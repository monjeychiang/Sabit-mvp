import ccxt
import ccxt.async_support as ccxt_async
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.exchange_keys import ExchangeKey
from utils.crypto import CryptoManager
from typing import Dict, List, Any, Optional, Union
import logging

logger = logging.getLogger(__name__)

class ExchangeService:
    """交易所操作服務"""
    
    def __init__(self, db: AsyncSession, crypto_manager: CryptoManager):
        """
        初始化交易所服務
        
        Args:
            db: 數據庫會話
            crypto_manager: 加密管理器
        """
        self.db = db
        self.crypto_manager = crypto_manager
        self.exchanges = {}  # 緩存已創建的交易所實例
        
    async def get_exchange_keys(self, exchange_id: Optional[str] = None) -> List[ExchangeKey]:
        """
        獲取交易所 API 密鑰
        
        Args:
            exchange_id: 可選的交易所 ID 過濾器
            
        Returns:
            交易所密鑰列表
        """
        query = select(ExchangeKey).where(ExchangeKey.is_active == True)
        
        if exchange_id:
            query = query.where(ExchangeKey.exchange_id == exchange_id)
            
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_exchange(self, key_id: int) -> ccxt_async.Exchange:
        """
        根據密鑰 ID 獲取交易所實例
        
        Args:
            key_id: 密鑰 ID
            
        Returns:
            交易所實例
        """
        # 檢查緩存
        if key_id in self.exchanges:
            return self.exchanges[key_id]
        
        # 獲取密鑰
        result = await self.db.execute(
            select(ExchangeKey).where(ExchangeKey.id == key_id)
        )
        key = result.scalars().first()
        
        if not key:
            raise ValueError(f"找不到 ID 為 {key_id} 的交易所密鑰")
            
        # 解密密鑰
        api_key = self.crypto_manager.decrypt(key.api_key)
        api_secret = self.crypto_manager.decrypt(key.api_secret)
        api_password = self.crypto_manager.decrypt(key.api_password) if key.api_password else None
        
        # 創建交易所實例
        exchange_class = getattr(ccxt_async, key.exchange_id)
        
        exchange_params = {
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
        }
        
        if api_password:
            exchange_params['password'] = api_password
            
        # 設置測試模式（如果支持）
        if key.test_mode:
            if key.exchange_id in ['binance', 'bitmex', 'bybit', 'okex', 'huobi']:
                exchange_params['options'] = {'defaultType': 'future'}
                
                if key.exchange_id == 'binance':
                    exchange_params['options']['test'] = True
                elif key.exchange_id == 'bitmex':
                    exchange_params['urls'] = {'api': ccxt_async.bitmex().urls['test']}
                elif key.exchange_id == 'bybit':
                    exchange_params['urls'] = {'api': ccxt_async.bybit().urls['test']}
                    
        exchange = exchange_class(exchange_params)
        
        # 緩存交易所實例
        self.exchanges[key_id] = exchange
        return exchange
    
    async def close_all_exchanges(self):
        """關閉所有交易所連接"""
        for exchange in self.exchanges.values():
            await exchange.close()
        self.exchanges = {}
    
    async def get_balance(self, key_id: int) -> Dict:
        """
        獲取賬戶餘額
        
        Args:
            key_id: 密鑰 ID
            
        Returns:
            餘額信息
        """
        exchange = await self.get_exchange(key_id)
        try:
            return await exchange.fetch_balance()
        except Exception as e:
            logger.error(f"獲取餘額失敗: {e}")
            raise
    
    async def create_order(self, key_id: int, symbol: str, order_type: str, 
                          side: str, amount: float, price: Optional[float] = None,
                          params: Dict = None) -> Dict:
        """
        創建訂單
        
        Args:
            key_id: 密鑰 ID
            symbol: 交易對符號
            order_type: 訂單類型 (market, limit)
            side: 交易方向 (buy, sell)
            amount: 數量
            price: 價格 (僅限價單需要)
            params: 額外參數
            
        Returns:
            訂單信息
        """
        exchange = await self.get_exchange(key_id)
        params = params or {}
        
        try:
            return await exchange.create_order(
                symbol=symbol,
                type=order_type,
                side=side,
                amount=amount,
                price=price,
                params=params
            )
        except Exception as e:
            logger.error(f"創建訂單失敗: {e}")
            raise
    
    async def cancel_order(self, key_id: int, order_id: str, symbol: str, params: Dict = None) -> Dict:
        """
        取消訂單
        
        Args:
            key_id: 密鑰 ID
            order_id: 訂單 ID
            symbol: 交易對符號
            params: 額外參數
            
        Returns:
            取消結果
        """
        exchange = await self.get_exchange(key_id)
        params = params or {}
        
        try:
            return await exchange.cancel_order(order_id, symbol, params=params)
        except Exception as e:
            logger.error(f"取消訂單失敗: {e}")
            raise
    
    async def set_leverage(self, key_id: int, symbol: str, leverage: int, params: Dict = None) -> Dict:
        """
        設置槓桿
        
        Args:
            key_id: 密鑰 ID
            symbol: 交易對符號
            leverage: 槓桿倍數
            params: 額外參數
            
        Returns:
            設置結果
        """
        exchange = await self.get_exchange(key_id)
        params = params or {}
        
        try:
            return await exchange.set_leverage(leverage, symbol, params=params)
        except Exception as e:
            logger.error(f"設置槓桿失敗: {e}")
            raise
    
    async def get_positions(self, key_id: int, symbol: Optional[str] = None, params: Dict = None) -> List:
        """
        獲取持倉
        
        Args:
            key_id: 密鑰 ID
            symbol: 交易對符號
            params: 額外參數
            
        Returns:
            持倉信息
        """
        exchange = await self.get_exchange(key_id)
        params = params or {}
        
        try:
            if hasattr(exchange, 'fetch_positions') and callable(exchange.fetch_positions):
                if symbol:
                    return await exchange.fetch_positions([symbol], params=params)
                else:
                    return await exchange.fetch_positions(params=params)
            else:
                raise NotImplementedError(f"交易所 {exchange.id} 不支持獲取持倉")
        except Exception as e:
            logger.error(f"獲取持倉失敗: {e}")
            raise
    
    async def get_open_orders(self, key_id: int, symbol: Optional[str] = None, params: Dict = None) -> List:
        """
        獲取未成交訂單
        
        Args:
            key_id: 密鑰 ID
            symbol: 交易對符號
            params: 額外參數
            
        Returns:
            未成交訂單列表
        """
        exchange = await self.get_exchange(key_id)
        params = params or {}
        
        try:
            return await exchange.fetch_open_orders(symbol=symbol, params=params)
        except Exception as e:
            logger.error(f"獲取未成交訂單失敗: {e}")
            raise 