"""
幣安(Binance) WebSocket 連接類

實現與幣安交易所的WebSocket連接，訂閱和處理價格更新。
支持現貨和合約市場。
"""

import json
import logging
import time
from typing import Dict, List, Optional, Any

from app.services.price_service.websocket_base import WebSocketBase

logger = logging.getLogger(__name__)

class BinanceWebSocket(WebSocketBase):
    """
    幣安(Binance) WebSocket客戶端，用於連接和訂閱幣安的實時價格數據。
    """
    
    # 幣安WebSocket URLs
    SPOT_WS_URL = "wss://stream.binance.com:9443/ws"
    FUTURES_WS_URL = "wss://fstream.binance.com/ws"
    
    def __init__(self, 
                 market_type: str = "spot",
                 ping_interval: int = 30,
                 reconnect_delay: int = 5,
                 max_reconnect_attempts: int = 10):
        """
        初始化幣安WebSocket客戶端
        
        Args:
            market_type: 市場類型，"spot"(現貨) 或 "futures"(合約)
            ping_interval: 心跳間隔（秒）
            reconnect_delay: 重連延遲（秒）
            max_reconnect_attempts: 最大重連嘗試次數
        """
        self.market_type = market_type.lower()
        
        # 選擇正確的WebSocket URL
        if self.market_type == "futures":
            ws_url = self.FUTURES_WS_URL
        else:  # 默認為現貨
            ws_url = self.SPOT_WS_URL
        
        super().__init__(
            exchange_name="Binance",
            ws_url=ws_url,
            ping_interval=ping_interval,
            reconnect_delay=reconnect_delay,
            max_reconnect_attempts=max_reconnect_attempts
        )
        
        # 為每個交易對維護最新價格
        self.latest_prices: Dict[str, float] = {}
        
        # 跟踪訂閱ID和交易對的映射
        self.stream_ids: Dict[str, int] = {}
        self.next_id = 1
    
    def _normalize_symbol(self, symbol: str) -> str:
        """
        將標準交易對格式轉換為幣安的格式
        
        Args:
            symbol: 標準格式的交易對，例如 "BTC/USDT"
            
        Returns:
            幣安格式的交易對，例如 "btcusdt"
        """
        # 移除斜線，轉為小寫
        binance_symbol = symbol.replace("/", "").lower()
        return binance_symbol
    
    def _denormalize_symbol(self, binance_symbol: str) -> str:
        """
        將幣安格式的交易對轉換回標準格式
        
        Args:
            binance_symbol: 幣安格式的交易對，例如 "btcusdt"
            
        Returns:
            標準格式的交易對，例如 "BTC/USDT"
        """
        # 幣安的主要穩定幣
        stablecoins = ["usdt", "busd", "usdc", "tusd", "usdp", "dai", "fdusd"]
        
        # 尋找交易對中的穩定幣
        symbol = binance_symbol.lower()
        for coin in stablecoins:
            if symbol.endswith(coin):
                base = symbol[:-len(coin)].upper()
                quote = coin.upper()
                return f"{base}/{quote}"
        
        # 如果找不到穩定幣，假設最後4個字符是報價貨幣
        base = symbol[:-4].upper()
        quote = symbol[-4:].upper()
        return f"{base}/{quote}"
    
    async def subscribe_symbols(self, symbols: List[str]) -> bool:
        """
        訂閱交易對的ticker數據
        
        Args:
            symbols: 交易對列表，例如 ["BTC/USDT", "ETH/USDT"]
            
        Returns:
            訂閱是否成功
        """
        if not self.ws or self.ws.closed:
            logger.warning("嘗試在WebSocket關閉狀態下訂閱交易對，先嘗試連接")
            if not await self.connect():
                return False
        
        binance_symbols = [self._normalize_symbol(s) for s in symbols]
        
        try:
            # 針對每個交易對建立訂閱
            for idx, binance_symbol in enumerate(binance_symbols):
                standard_symbol = symbols[idx]
                
                # 如果已經訂閱，則跳過
                if standard_symbol in self.subscribed_symbols:
                    continue
                
                # 創建訂閱ID
                stream_id = self.next_id
                self.next_id += 1
                
                # 創建訂閱消息
                subscribe_msg = {
                    "method": "SUBSCRIBE",
                    "params": [f"{binance_symbol}@ticker"],
                    "id": stream_id
                }
                
                # 發送訂閱請求
                await self.ws.send_str(json.dumps(subscribe_msg))
                logger.info(f"已發送{self.exchange_name}訂閱請求: {standard_symbol}")
                
                # 記錄訂閱信息
                self.stream_ids[standard_symbol] = stream_id
                self.subscribed_symbols.add(standard_symbol)
            
            return True
        except Exception as e:
            logger.error(f"訂閱{self.exchange_name}交易對失敗: {e}")
            return False
    
    async def unsubscribe_symbols(self, symbols: List[str]) -> bool:
        """
        取消訂閱交易對的ticker數據
        
        Args:
            symbols: 交易對列表，例如 ["BTC/USDT", "ETH/USDT"]
            
        Returns:
            取消訂閱是否成功
        """
        if not self.ws or self.ws.closed:
            logger.warning("WebSocket未連接，無需取消訂閱")
            return False
        
        try:
            for symbol in symbols:
                if symbol not in self.subscribed_symbols:
                    continue
                
                binance_symbol = self._normalize_symbol(symbol)
                
                # 創建取消訂閱消息
                unsubscribe_msg = {
                    "method": "UNSUBSCRIBE",
                    "params": [f"{binance_symbol}@ticker"],
                    "id": self.stream_ids.get(symbol, 0)
                }
                
                # 發送取消訂閱請求
                await self.ws.send_str(json.dumps(unsubscribe_msg))
                logger.info(f"已發送{self.exchange_name}取消訂閱請求: {symbol}")
                
                # 更新記錄
                if symbol in self.stream_ids:
                    del self.stream_ids[symbol]
                if symbol in self.subscribed_symbols:
                    self.subscribed_symbols.remove(symbol)
                if symbol in self.latest_prices:
                    del self.latest_prices[symbol]
            
            return True
        except Exception as e:
            logger.error(f"取消訂閱{self.exchange_name}交易對失敗: {e}")
            return False
    
    async def _send_ping(self) -> None:
        """發送心跳包"""
        if self.ws and not self.ws.closed:
            # 幣安WebSocket需要使用正確的心跳格式，不能簡單地發送 "ping"
            # 使用空的LIST_SUBSCRIPTIONS作為心跳
            ping_msg = {"method": "LIST_SUBSCRIPTIONS", "id": 0}
            await self.ws.send_str(json.dumps(ping_msg))
    
    async def _process_message(self, message: str) -> None:
        """
        處理WebSocket文本消息
        
        Args:
            message: WebSocket消息
        """
        try:
            data = json.loads(message)
            
            # 處理心跳回應
            if "result" in data and data.get("id") == 0:
                logger.debug(f"{self.exchange_name}心跳回應: {data}")
                return
            
            # 處理訂閱確認消息
            if "result" in data and data.get("id") in [v for v in self.stream_ids.values()]:
                logger.info(f"{self.exchange_name}訂閱確認: {data}")
                return
            
            # 處理錯誤消息
            if "error" in data:
                logger.error(f"{self.exchange_name}錯誤消息: {data}")
                return
            
            # 處理ticker數據
            if "e" in data and data["e"] == "24hrTicker":
                symbol = data["s"]
                
                # 將幣安格式轉換回標準格式
                standard_symbol = self._denormalize_symbol(symbol)
                
                # 最新價格
                price = float(data["c"])
                
                # 更新最新價格
                self.latest_prices[standard_symbol] = price
                
                # 打印日誌
                logger.debug(f"{self.exchange_name}價格更新: {standard_symbol} = {price}")
                
                # 通知回調
                self._notify_price_update(standard_symbol, price)
        except json.JSONDecodeError:
            logger.error(f"{self.exchange_name}無法解析JSON消息: {message}")
        except KeyError as e:
            logger.error(f"{self.exchange_name}處理消息時缺少鍵: {e}, 消息: {message}")
        except Exception as e:
            logger.error(f"{self.exchange_name}處理消息時發生錯誤: {e}, 消息: {message}")
    
    async def _process_binary_message(self, data: bytes) -> None:
        """
        處理WebSocket二進制消息
        
        Args:
            data: 二進制數據
        """
        # 幣安一般不發送二進制消息，但如果有的話，轉換為文本處理
        try:
            message = data.decode("utf-8")
            await self._process_message(message)
        except Exception as e:
            logger.error(f"{self.exchange_name}處理二進制消息時發生錯誤: {e}")
    
    def get_latest_price(self, symbol: str) -> Optional[float]:
        """
        獲取交易對的最新價格
        
        Args:
            symbol: 交易對，例如 "BTC/USDT"
            
        Returns:
            最新價格，如果沒有則返回None
        """
        return self.latest_prices.get(symbol) 