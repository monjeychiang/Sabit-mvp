from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from database import get_db
from models.exchange_keys import ExchangeKey
from services.exchange_service import ExchangeService
from utils.crypto import CryptoManager
import os
import ccxt

router = APIRouter()

# 創建一個加密管理器實例
crypto_manager = CryptoManager(os.environ.get("SABIT_MASTER_PASSWORD", "default_master_password"))

# 獲取交易所服務
async def get_exchange_service(db: AsyncSession = Depends(get_db)):
    service = ExchangeService(db, crypto_manager)
    try:
        yield service
    finally:
        await service.close_all_exchanges()

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

# API 路由
@router.post("/keys", response_model=ExchangeKeyResponse)
async def create_exchange_key(
    key_data: ExchangeKeyCreate,
    db: AsyncSession = Depends(get_db)
):
    """創建新的交易所 API 密鑰"""
    # 加密敏感數據
    encrypted_api_key = crypto_manager.encrypt(key_data.api_key)
    encrypted_api_secret = crypto_manager.encrypt(key_data.api_secret)
    encrypted_api_password = crypto_manager.encrypt(key_data.api_password) if key_data.api_password else None
    
    # 創建數據庫記錄
    db_key = ExchangeKey(
        exchange_id=key_data.exchange_id,
        name=key_data.name,
        api_key=encrypted_api_key,
        api_secret=encrypted_api_secret,
        api_password=encrypted_api_password,
        test_mode=key_data.test_mode
    )
    
    db.add(db_key)
    await db.commit()
    await db.refresh(db_key)
    
    return db_key

@router.get("/keys", response_model=List[ExchangeKeyResponse])
async def get_exchange_keys(
    exchange_id: Optional[str] = None,
    service: ExchangeService = Depends(get_exchange_service)
):
    """獲取所有交易所 API 密鑰"""
    return await service.get_exchange_keys(exchange_id)

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