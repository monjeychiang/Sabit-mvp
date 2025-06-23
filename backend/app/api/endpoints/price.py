from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import logging
from app.services.price_service.price_manager import PriceManager
from app.services.price_service.exchange_info import exchange_info_service

logger = logging.getLogger(__name__)

router = APIRouter()

# 創建一個全局的PriceManager實例
price_manager = PriceManager()

# 請求和響應模型
class SymbolSubscribeRequest(BaseModel):
    symbol: str = Field(..., description="交易對符號，例如 'BTC/USDT'")
    exchanges: List[str] = Field(..., description="交易所ID列表，例如 ['binance', 'okx']")
    marketType: str = Field("spot", description="市場類型，例如 'spot'、'futures'、'swap'")

class SymbolUnsubscribeRequest(BaseModel):
    symbol: str = Field(..., description="交易對符號，例如 'BTC/USDT'")
    exchanges: Optional[List[str]] = Field(None, description="交易所ID列表，如果為空則取消所有交易所的訂閱")

class PriceResponse(BaseModel):
    symbol: str
    prices: Dict[str, float]
    timestamp: int

# 啟動和關閉事件
@router.on_event("startup")
async def startup_price_service():
    """啟動價格服務"""
    logger.info("正在初始化價格服務...")

@router.on_event("shutdown")
async def shutdown_price_service():
    """關閉價格服務"""
    logger.info("正在關閉價格服務...")
    await price_manager.close_all()

# API路由
@router.post("/subscribe", status_code=status.HTTP_200_OK)
async def subscribe_symbol(request: SymbolSubscribeRequest):
    """訂閱交易對價格"""
    try:
        logger.info(f"訂閱交易對: {request.symbol}，交易所: {request.exchanges}，市場類型: {request.marketType}")
        results = await price_manager.subscribe_symbol(
            request.symbol, 
            request.exchanges,
            market_type=request.marketType
        )
        
        # 檢查是否全部成功
        all_success = all(results.values())
        
        if all_success:
            return {
                "success": True,
                "message": f"成功訂閱交易對 {request.symbol}",
                "details": results
            }
        else:
            return {
                "success": False,
                "message": f"部分交易所訂閱失敗",
                "details": results
            }
    except Exception as e:
        logger.error(f"訂閱交易對失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/unsubscribe", status_code=status.HTTP_200_OK)
async def unsubscribe_symbol(request: SymbolUnsubscribeRequest):
    """取消訂閱交易對價格"""
    try:
        logger.info(f"取消訂閱交易對: {request.symbol}，交易所: {request.exchanges or '所有交易所'}")
        results = await price_manager.unsubscribe_symbol(request.symbol, request.exchanges)
        
        return {
            "success": True,
            "message": f"成功取消訂閱交易對 {request.symbol}",
            "details": results
        }
    except Exception as e:
        logger.error(f"取消訂閱交易對失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/latest/{symbol_base}/{symbol_quote}", status_code=status.HTTP_200_OK)
async def get_latest_price(symbol_base: str, symbol_quote: str, exchange: Optional[str] = None):
    """獲取交易對的最新價格"""
    try:
        symbol = f"{symbol_base}/{symbol_quote}"
        prices = price_manager.get_latest_price(symbol, exchange)
        
        if not prices:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"找不到交易對 {symbol} 的價格數據"
            )
        
        # 獲取市場類型
        market_types = price_manager.get_symbol_market_types(symbol)
        
        import time
        return {
            "symbol": symbol,
            "prices": prices,
            "marketTypes": market_types,
            "timestamp": int(time.time())
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"獲取最新價格失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/subscriptions", status_code=status.HTTP_200_OK)
async def get_subscriptions():
    """獲取所有已訂閱的交易對"""
    try:
        subscriptions = price_manager.get_subscribed_symbols()
        return {
            "success": True,
            "subscriptions": subscriptions
        }
    except Exception as e:
        logger.error(f"獲取訂閱信息失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/status", status_code=status.HTTP_200_OK)
async def get_price_service_status():
    """獲取價格服務狀態"""
    try:
        status = price_manager.get_exchange_status()
        return {
            "success": True,
            "status": status
        }
    except Exception as e:
        logger.error(f"獲取服務狀態失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/symbols/{market_type}", status_code=status.HTTP_200_OK)
async def get_available_symbols(market_type: str, force_refresh: bool = False):
    """
    獲取交易所可用的交易對列表
    
    Args:
        market_type: 市場類型，"spot", "futures", "swap"
        force_refresh: 是否強制刷新緩存
    """
    try:
        symbols = await exchange_info_service.get_all_symbols(market_type)
        
        if not symbols:
            return {
                "success": True,
                "message": "未找到交易對",
                "symbols": {}
            }
        
        return {
            "success": True,
            "symbols": symbols
        }
    except Exception as e:
        logger.error(f"獲取交易對列表失敗: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 