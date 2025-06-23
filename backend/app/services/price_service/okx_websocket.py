"""
OKX WebSocket 連接類

實現與OKX交易所的WebSocket連接，訂閱和處理價格更新。
支持現貨、交割和永續合約市場。
"""

import json
import logging
import time
from typing import Dict, List, Optional, Any

from app.services.price_service.websocket_base import WebSocketBase

logger = logging.getLogger(__name__)

class OkxWebSocket(WebSocketBase):
    """
    OKX WebSocket客戶端，用於連接和訂閱OKX的實時價格數據。
    """
    
    # OKX WebSocket URL
    WS_URL = "wss://ws.okx.com:8443/ws/v5/public"
    
    def __init__(self, 
                 market_type: str = "spot",  # spot, swap, futures
                 ping_interval: int = 15,  # OKX建議15-30秒發送一次心跳
                 reconnect_delay: int = 5,
                 max_reconnect_attempts: int = 10):
        """
        初始化OKX WebSocket客戶端
        
        Args:
            market_type: 市場類型，"spot"(現貨), "swap"(永續合約) 或 "futures"(交割合約)
            ping_interval: 心跳間隔（秒）
            reconnect_delay: 重連延遲（秒）
            max_reconnect_attempts: 最大重連嘗試次數
        """
        self.market_type = market_type.lower()
        
        super().__init__(
            exchange_name="OKX",
            ws_url=self.WS_URL,
            ping_interval=ping_interval,
            reconnect_delay=reconnect_delay,
            max_reconnect_attempts=max_reconnect_attempts
        )
        
        # 為每個交易對維護最新價格
        self.latest_prices: Dict[str, float] = {}
        
        # OKX的心跳回應時間監控
        self.last_pong_time = 0
    
    def _normalize_symbol(self, symbol: str) -> str:
        """
        將標準交易對格式轉換為OKX的格式
        
        Args:
            symbol: 標準格式的交易對，例如 "BTC/USDT"
            
        Returns:
            OKX格式的交易對，例如 "BTC-USDT" (現貨) 或 "BTC-USDT-SWAP" (永續)
        """
        if "/" not in symbol:
            return symbol  # 假設已經是OKX格式
            
        base, quote = symbol.split("/")
        
        if self.market_type == "swap":
            return f"{base}-{quote}-SWAP"
        elif self.market_type == "futures":
            return f"{base}-{quote}"  # 交割合約還需要額外指定日期，這裡簡化處理
        else:  # 默認為現貨
            return f"{base}-{quote}"
    
    def _denormalize_symbol(self, okx_symbol: str) -> str:
        """
        將OKX格式的交易對轉換回標準格式
        
        Args:
            okx_symbol: OKX格式的交易對，例如 "BTC-USDT" 或 "BTC-USDT-SWAP"
            
        Returns:
            標準格式的交易對，例如 "BTC/USDT"
        """
        parts = okx_symbol.split("-")
        if len(parts) >= 2:
            base = parts[0]
            quote = parts[1]
            return f"{base}/{quote}"
        return okx_symbol  # 如果無法解析，返回原始字符串
    
    def _get_instid(self, symbol: str) -> str:
        """
        獲取OKX的instId參數
        
        Args:
            symbol: 標準格式的交易對，例如 "BTC/USDT"
            
        Returns:
            OKX的instId參數，例如 "BTC-USDT"
        """
        okx_symbol = self._normalize_symbol(symbol)
        
        # 根據市場類型返回適當的instId
        if self.market_type == "spot":
            # OKX現貨市場格式為 "BTC-USDT"，不需要添加-SPOT後綴
            return f"{okx_symbol}"
        elif self.market_type == "swap":
            return f"{okx_symbol}"  # 已經包含SWAP後綴
        elif self.market_type == "futures":
            # 這裡需要指定具體的交割日期，這裡簡化處理
            return f"{okx_symbol}"
        
        return okx_symbol
    
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
        
        try:
            # 準備訂閱參數
            args = []
            for symbol in symbols:
                # 如果已經訂閱，則跳過
                if symbol in self.subscribed_symbols:
                    continue
                
                instid = self._get_instid(symbol)
                args.append({
                    "channel": "tickers",
                    "instId": instid
                })
            
            if not args:
                logger.debug(f"沒有新的交易對需要訂閱")
                return True
            
            # 創建訂閱消息
            subscribe_msg = {
                "op": "subscribe",
                "args": args
            }
            
            # 發送訂閱請求
            await self.ws.send_str(json.dumps(subscribe_msg))
            logger.info(f"已發送{self.exchange_name}訂閱請求: {symbols}")
            
            # 記錄訂閱信息
            for symbol in symbols:
                if symbol not in self.subscribed_symbols:
                    self.subscribed_symbols.add(symbol)
            
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
            # 準備取消訂閱參數
            args = []
            for symbol in symbols:
                if symbol not in self.subscribed_symbols:
                    continue
                
                instid = self._get_instid(symbol)
                args.append({
                    "channel": "tickers",
                    "instId": instid
                })
            
            if not args:
                logger.debug(f"沒有需要取消訂閱的交易對")
                return True
            
            # 創建取消訂閱消息
            unsubscribe_msg = {
                "op": "unsubscribe",
                "args": args
            }
            
            # 發送取消訂閱請求
            await self.ws.send_str(json.dumps(unsubscribe_msg))
            logger.info(f"已發送{self.exchange_name}取消訂閱請求: {symbols}")
            
            # 更新記錄
            for symbol in symbols:
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
            ping_msg = "ping"
            await self.ws.send_str(ping_msg)
    
    async def _process_message(self, message: str) -> None:
        """
        處理WebSocket文本消息
        
        Args:
            message: WebSocket消息
        """
        try:
            # 處理心跳回應
            if message == "pong":
                self.last_pong_time = time.time()
                logger.debug(f"{self.exchange_name}收到心跳回應")
                return
            
            data = json.loads(message)
            
            # 處理訂閱確認消息
            if "event" in data and data["event"] == "subscribe":
                logger.info(f"{self.exchange_name}訂閱確認: {data}")
                return
            
            # 處理取消訂閱確認消息
            if "event" in data and data["event"] == "unsubscribe":
                logger.info(f"{self.exchange_name}取消訂閱確認: {data}")
                return
            
            # 處理錯誤消息
            if "event" in data and data["event"] == "error":
                logger.error(f"{self.exchange_name}錯誤消息: {data}")
                return
            
            # 處理ticker數據
            if "data" in data and "arg" in data and data["arg"].get("channel") == "tickers":
                for ticker_data in data["data"]:
                    if "instId" in ticker_data:
                        okx_symbol = ticker_data["instId"].replace("-SPOT", "")
                        
                        # 將OKX格式轉換回標準格式
                        standard_symbol = self._denormalize_symbol(okx_symbol)
                        
                        # 最新價格
                        price = float(ticker_data["last"])
                        
                        # 更新最新價格
                        self.latest_prices[standard_symbol] = price
                        
                        # 打印日誌
                        logger.debug(f"{self.exchange_name}價格更新: {standard_symbol} = {price}")
                        
                        # 通知回調
                        self._notify_price_update(standard_symbol, price)
        except json.JSONDecodeError:
            if message != "pong":  # 忽略心跳回應的解析錯誤
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