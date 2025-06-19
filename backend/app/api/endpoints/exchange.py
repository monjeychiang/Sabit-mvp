from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from app.db.database import get_db
from app.db.models.exchange_keys import ExchangeKey
from app.services.exchange_service import ExchangeService
from app.services.api_key_manager import ApiKeyManager
from app.utils.crypto import CryptoManager
import os
import ccxt
import logging

# 創建 logger 實例
logger = logging.getLogger(__name__)

router = APIRouter()

# 創建一個加密管理器實例
crypto_manager = CryptoManager(os.environ.get("SABIT_MASTER_PASSWORD", "default_master_password"))

# 獲取 API 密鑰管理器
async def get_api_key_manager(db: AsyncSession = Depends(get_db)):
    manager = ApiKeyManager(db, crypto_manager)
    return manager

# 獲取交易所服務
async def get_exchange_service(api_key_manager: ApiKeyManager = Depends(get_api_key_manager)):
    service = ExchangeService(api_key_manager)
    try:
        yield service
    finally:
        # 不再關閉共享連線，只清理實例級別緩存
        await service.close_all_exchanges()

# 應用關閉時清理所有連線
@router.on_event("shutdown")
async def shutdown_event():
    await ExchangeService.close_all_shared_exchanges()

# 請求和響應模型
class ExchangeKeyCreate(BaseModel):
    exchange_id: str = Field(..., description="交易所 ID (如 'binance', 'okex')")
    name: str = Field(..., description="用戶定義的名稱")
    api_key: str = Field(..., description="API Key")
    api_secret: str = Field(..., description="API Secret")
    api_password: Optional[str] = Field(None, description="API 密碼 (某些交易所需要)")
    test_mode: bool = Field(True, description="是否為測試模式")

class ExchangeKeyResponse(BaseModel):
    id: int
    exchange_id: str
    name: str
    test_mode: bool
    is_active: bool

    class Config:
        orm_mode = True

class ExchangeKeyUpdate(BaseModel):
    name: Optional[str] = Field(None, description="用戶定義的名稱")
    is_active: Optional[bool] = Field(None, description="是否啟用")
    test_mode: Optional[bool] = Field(None, description="是否為測試模式")

class OrderRequest(BaseModel):
    symbol: str = Field(..., description="交易對符號")
    order_type: str = Field(..., description="訂單類型 (market, limit)")
    side: str = Field(..., description="交易方向 (buy, sell)")
    amount: float = Field(..., description="數量")
    price: Optional[float] = Field(None, description="價格 (僅限價單需要)")
    params: Optional[Dict[str, Any]] = Field(None, description="額外參數")

class LeverageRequest(BaseModel):
    symbol: str = Field(..., description="交易對符號")
    leverage: int = Field(..., description="槓桿倍數")
    params: Optional[Dict[str, Any]] = Field(None, description="額外參數")

class PositionModeRequest(BaseModel):
    dual_side: bool = Field(..., description="是否啟用雙向持倉模式")

# API 路由
@router.post("/keys", response_model=ExchangeKeyResponse)
async def create_exchange_key(
    key_data: ExchangeKeyCreate,
    background_tasks: BackgroundTasks,
    api_key_manager: ApiKeyManager = Depends(get_api_key_manager),
    service: ExchangeService = Depends(get_exchange_service)
):
    """創建新的交易所 API 密鑰"""
    # 使用 API 密鑰管理器創建密鑰
    db_key = await api_key_manager.create_key(
        exchange_id=key_data.exchange_id,
        name=key_data.name,
        api_key=key_data.api_key,
        api_secret=key_data.api_secret,
        api_password=key_data.api_password,
        test_mode=key_data.test_mode
    )
    
    # 新增後在背景預熱連線
    background_tasks.add_task(preheat_exchange_background, db_key.id, service)
    
    return db_key

# 背景預熱任務
async def preheat_exchange_background(key_id: int, service: ExchangeService):
    """在背景執行預熱交易所連線的任務"""
    await service.preheat_exchange(key_id)

@router.get("/keys", response_model=List[ExchangeKeyResponse])
async def get_exchange_keys(
    exchange_id: Optional[str] = None,
    api_key_manager: ApiKeyManager = Depends(get_api_key_manager)
):
    """獲取所有交易所 API 密鑰"""
    return await api_key_manager.get_all_keys(exchange_id)

@router.put("/keys/{key_id}", response_model=ExchangeKeyResponse)
async def update_exchange_key(
    key_id: int,
    key_data: ExchangeKeyUpdate,
    background_tasks: BackgroundTasks,
    api_key_manager: ApiKeyManager = Depends(get_api_key_manager),
    service: ExchangeService = Depends(get_exchange_service)
):
    """更新交易所 API 密鑰信息"""
    # 獲取當前密鑰狀態
    current_key = await api_key_manager.get_key_by_id(key_id)
    
    if not current_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到 ID 為 {key_id} 的 API 密鑰"
        )
    
    # 檢查是否需要關閉現有連線
    need_reconnect = False
    
    # 檢查是否更改了狀態或測試模式
    if (key_data.is_active is not None and key_data.is_active != current_key.is_active) or \
       (key_data.test_mode is not None and key_data.test_mode != current_key.test_mode):
        need_reconnect = True
    
    # 更新數據
    updated_key = await api_key_manager.update_key(
        key_id=key_id,
        name=key_data.name,
        is_active=key_data.is_active,
        test_mode=key_data.test_mode
    )
    
    # 如果需要重新連線
    if need_reconnect:
        # 先關閉現有連線
        await ExchangeService.close_shared_exchange(key_id)
        
        # 如果密鑰被啟用，在背景預熱連線
        if updated_key.is_active:
            background_tasks.add_task(preheat_exchange_background, key_id, service)
    
    return updated_key

@router.delete("/keys/{key_id}", response_model=Dict[str, bool])
async def delete_exchange_key(
    key_id: int,
    api_key_manager: ApiKeyManager = Depends(get_api_key_manager)
):
    """刪除交易所 API 密鑰"""
    # 檢查密鑰是否存在
    key = await api_key_manager.get_key_by_id(key_id)
    
    if not key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到 ID 為 {key_id} 的 API 密鑰"
        )
    
    # 關閉並刪除共享交易所連線
    await ExchangeService.close_shared_exchange(key_id)
    
    # 刪除記錄
    success = await api_key_manager.delete_key(key_id)
    
    return {"success": success}

@router.post("/keys/{key_id}/toggle", response_model=ExchangeKeyResponse)
async def toggle_exchange_key_status(
    key_id: int,
    background_tasks: BackgroundTasks,
    api_key_manager: ApiKeyManager = Depends(get_api_key_manager),
    service: ExchangeService = Depends(get_exchange_service)
):
    """切換交易所 API 密鑰的啟用狀態"""
    # 使用 API 密鑰管理器切換狀態
    updated_key = await api_key_manager.toggle_key_status(key_id)
    
    if not updated_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到 ID 為 {key_id} 的 API 密鑰"
        )
    
    # 根據新狀態處理連線
    if updated_key.is_active:
        # 如果啟用，在背景預熱連線
        background_tasks.add_task(preheat_exchange_background, key_id, service)
    else:
        # 如果禁用，關閉並刪除連線
        await ExchangeService.close_shared_exchange(key_id)
    
    return updated_key

@router.get("/supported")
async def get_supported_exchanges():
    """獲取支持的交易所列表"""
    return {
        "exchanges": ccxt.exchanges
    }

@router.get("/{key_id}/balance")
async def get_balance(
    key_id: int,
    service: ExchangeService = Depends(get_exchange_service)
):
    """獲取賬戶餘額"""
    try:
        return await service.get_balance(key_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{key_id}/orders")
async def create_order(
    key_id: int,
    order_data: OrderRequest,
    service: ExchangeService = Depends(get_exchange_service)
):
    """創建訂單"""
    try:
        return await service.create_order(
            key_id=key_id,
            symbol=order_data.symbol,
            order_type=order_data.order_type,
            side=order_data.side,
            amount=order_data.amount,
            price=order_data.price,
            params=order_data.params
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{key_id}/orders/{order_id}")
async def cancel_order(
    key_id: int,
    order_id: str,
    symbol: str,
    service: ExchangeService = Depends(get_exchange_service)
):
    """取消訂單"""
    try:
        return await service.cancel_order(key_id, order_id, symbol)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{key_id}/leverage")
async def set_leverage(
    key_id: int,
    leverage_data: LeverageRequest,
    service: ExchangeService = Depends(get_exchange_service)
):
    """設置槓桿"""
    try:
        return await service.set_leverage(
            key_id=key_id,
            symbol=leverage_data.symbol,
            leverage=leverage_data.leverage,
            params=leverage_data.params
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{key_id}/positions")
async def get_positions(
    key_id: int,
    symbol: Optional[str] = None,
    service: ExchangeService = Depends(get_exchange_service)
):
    """獲取持倉"""
    try:
        return await service.get_positions(key_id, symbol)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{key_id}/open-orders")
async def get_open_orders(
    key_id: int,
    symbol: Optional[str] = None,
    service: ExchangeService = Depends(get_exchange_service)
):
    """獲取未成交訂單"""
    try:
        return await service.get_open_orders(key_id, symbol)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# 新增預熱相關端點
@router.post("/{key_id}/preheat")
async def preheat_exchange_connection(
    key_id: int,
    service: ExchangeService = Depends(get_exchange_service)
):
    """預熱指定交易所連線"""
    try:
        result = await service.preheat_exchange(key_id)
        return {"success": result, "key_id": key_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/preheat-all")
async def preheat_all_exchange_connections(
    service: ExchangeService = Depends(get_exchange_service)
):
    """預熱所有交易所連線"""
    try:
        results = await service.preheat_all_exchanges()
        return {"results": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/cleanup-idle-connections")
async def cleanup_idle_connections(max_idle_time: Optional[int] = None):
    """清理閒置的交易所連線"""
    await ExchangeService.cleanup_idle_connections(max_idle_time)
    return {"success": True}

@router.post("/keys/{key_id}/preheat")
async def preheat_single_exchange_key(
    key_id: int,
    service: ExchangeService = Depends(get_exchange_service)
):
    """預熱指定的交易所 API 密鑰連線"""
    try:
        result = await service.preheat_exchange(key_id)
        return {"success": result, "key_id": key_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/keys/{key_id}/connection-status")
async def get_connection_status(
    key_id: int
):
    """獲取指定交易所 API 密鑰的連線狀態"""
    try:
        # 檢查是否有活躍連線
        is_connected = key_id in ExchangeService._shared_exchanges
        last_used = None
        
        if is_connected and key_id in ExchangeService._exchange_last_used:
            last_used = ExchangeService._exchange_last_used[key_id]
            
        return {
            "connected": is_connected,
            "last_used": last_used,
            "key_id": key_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{key_id}/position-mode")
async def get_position_mode(
    key_id: int,
    service: ExchangeService = Depends(get_exchange_service)
):
    """獲取合約帳戶的持倉模式（單向或雙向）"""
    try:
        exchange = await service.get_exchange(key_id)
        
        # 目前只支持 Binance
        if exchange.id == 'binance':
            try:
                # 獲取持倉模式
                response = await exchange.fapiPrivateGetPositionSideDual()
                return response
            except Exception as e:
                # 如果獲取失敗，假設為單向模式
                logger.warning(f"獲取持倉模式失敗: {e}")
                return {"dualSidePosition": False}
        else:
            return {"dualSidePosition": False, "message": f"不支持獲取 {exchange.id} 的持倉模式"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{key_id}/position-mode")
async def set_position_mode(
    key_id: int,
    request_data: PositionModeRequest,
    service: ExchangeService = Depends(get_exchange_service)
):
    """設置合約帳戶的持倉模式（單向或雙向）"""
    try:
        exchange = await service.get_exchange(key_id)
        
        # 目前只支持 Binance
        if exchange.id == 'binance':
            try:
                # 設置持倉模式
                params = {"dualSidePosition": request_data.dual_side}
                response = await exchange.fapiPrivatePostPositionSideDual(params=params)
                
                logger.info(f"設置持倉模式成功: {'雙向' if request_data.dual_side else '單向'}")
                return {"success": True, "dualSidePosition": request_data.dual_side, "message": f"成功切換為{'雙向' if request_data.dual_side else '單向'}持倉模式"}
            except Exception as e:
                logger.error(f"設置持倉模式失敗: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"設置持倉模式失敗: {e}"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持設置 {exchange.id} 的持倉模式"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) 