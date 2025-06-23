"""
WebSocket 基礎類

提供WebSocket連接的基礎功能，所有交易所特定的WebSocket類都應該繼承此類。
實現了連接管理、心跳維護、重連邏輯等通用功能。
"""

import asyncio
import json
import logging
import time
from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Optional, Any, Set, Callable

import aiohttp

logger = logging.getLogger(__name__)

class WebSocketState(Enum):
    """WebSocket連接狀態"""
    DISCONNECTED = 0    # 未連接
    CONNECTING = 1      # 正在連接
    CONNECTED = 2       # 已連接
    RECONNECTING = 3    # 正在重連
    CLOSING = 4         # 正在關閉
    CLOSED = 5          # 已關閉


class WebSocketBase(ABC):
    """
    WebSocket基礎類，定義了所有交易所WebSocket客戶端的共同接口和基礎功能。
    """
    
    def __init__(self, 
                 exchange_name: str,
                 ws_url: str,
                 ping_interval: int = 30,
                 reconnect_delay: int = 5,
                 max_reconnect_attempts: int = 10):
        """
        初始化WebSocket基礎類
        
        Args:
            exchange_name: 交易所名稱
            ws_url: WebSocket連接URL
            ping_interval: 心跳間隔（秒）
            reconnect_delay: 重連延遲（秒）
            max_reconnect_attempts: 最大重連嘗試次數
        """
        self.exchange_name = exchange_name
        self.ws_url = ws_url
        self.ping_interval = ping_interval
        self.reconnect_delay = reconnect_delay
        self.max_reconnect_attempts = max_reconnect_attempts
        
        self.ws: Optional[aiohttp.ClientWebSocketResponse] = None
        self.ws_session: Optional[aiohttp.ClientSession] = None
        self.state = WebSocketState.DISCONNECTED
        self.last_ping_time = 0
        self.reconnect_attempts = 0
        
        # 訂閱的交易對集合
        self.subscribed_symbols: Set[str] = set()
        
        # 價格更新回調函數
        self.price_callbacks: List[Callable[[str, float], None]] = []
        
        # 任務管理
        self.tasks: List[asyncio.Task] = []
    
    async def connect(self) -> bool:
        """
        建立WebSocket連接
        
        Returns:
            連接是否成功
        """
        if self.state in [WebSocketState.CONNECTED, WebSocketState.CONNECTING]:
            logger.info(f"{self.exchange_name} WebSocket已連接或正在連接中")
            return True
        
        self.state = WebSocketState.CONNECTING
        logger.info(f"正在連接{self.exchange_name} WebSocket...")
        
        try:
            if self.ws_session is None or self.ws_session.closed:
                self.ws_session = aiohttp.ClientSession()
            
            self.ws = await self.ws_session.ws_connect(self.ws_url)
            self.state = WebSocketState.CONNECTED
            self.reconnect_attempts = 0
            logger.info(f"{self.exchange_name} WebSocket連接成功")
            
            # 啟動消息處理任務
            self._start_tasks()
            
            # 重新訂閱已訂閱的交易對
            await self._resubscribe()
            
            return True
        except Exception as e:
            logger.error(f"{self.exchange_name} WebSocket連接失敗: {e}")
            self.state = WebSocketState.DISCONNECTED
            return False
    
    async def disconnect(self) -> None:
        """關閉WebSocket連接"""
        if self.state == WebSocketState.DISCONNECTED:
            return
        
        self.state = WebSocketState.CLOSING
        logger.info(f"正在關閉{self.exchange_name} WebSocket連接...")
        
        # 取消所有任務
        for task in self.tasks:
            if not task.done():
                task.cancel()
        self.tasks.clear()
        
        # 關閉WebSocket連接
        if self.ws and not self.ws.closed:
            await self.ws.close()
        
        # 關閉會話
        if self.ws_session and not self.ws_session.closed:
            await self.ws_session.close()
        
        self.ws = None
        self.ws_session = None
        self.state = WebSocketState.DISCONNECTED
        logger.info(f"{self.exchange_name} WebSocket連接已關閉")
    
    def _start_tasks(self) -> None:
        """啟動WebSocket相關任務"""
        # 清理舊任務
        for task in self.tasks:
            if not task.done():
                task.cancel()
        self.tasks.clear()
        
        # 創建新任務
        self.tasks.append(asyncio.create_task(self._message_handler()))
        self.tasks.append(asyncio.create_task(self._heartbeat()))
    
    async def _heartbeat(self) -> None:
        """心跳維持任務"""
        while self.state == WebSocketState.CONNECTED:
            await asyncio.sleep(self.ping_interval)
            try:
                if self.ws and not self.ws.closed:
                    await self._send_ping()
                    self.last_ping_time = time.time()
                    logger.debug(f"已發送{self.exchange_name}心跳")
            except Exception as e:
                logger.error(f"{self.exchange_name}心跳發送失敗: {e}")
                await self._handle_connection_issue()
    
    async def _message_handler(self) -> None:
        """消息處理任務"""
        if not self.ws:
            return
            
        try:
            async for msg in self.ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    await self._process_message(msg.data)
                elif msg.type == aiohttp.WSMsgType.BINARY:
                    await self._process_binary_message(msg.data)
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    logger.error(f"{self.exchange_name} WebSocket錯誤: {msg.data}")
                    await self._handle_connection_issue()
                    break
                elif msg.type == aiohttp.WSMsgType.CLOSED:
                    logger.warning(f"{self.exchange_name} WebSocket連接關閉")
                    await self._handle_connection_issue()
                    break
        except asyncio.CancelledError:
            # 任務被取消，屬於正常情況
            pass
        except Exception as e:
            logger.error(f"{self.exchange_name} WebSocket消息處理錯誤: {e}")
            await self._handle_connection_issue()
    
    async def _handle_connection_issue(self) -> None:
        """處理連接問題並嘗試重連"""
        if self.state in [WebSocketState.RECONNECTING, WebSocketState.CLOSING, WebSocketState.CLOSED]:
            return
            
        self.state = WebSocketState.RECONNECTING
        logger.warning(f"{self.exchange_name} WebSocket連接中斷，嘗試重連...")
        
        # 取消現有任務
        for task in self.tasks:
            if not task.done():
                task.cancel()
        self.tasks.clear()
        
        # 關閉現有連接
        if self.ws and not self.ws.closed:
            await self.ws.close()
        
        self.ws = None
        
        # 嘗試重連
        while (self.reconnect_attempts < self.max_reconnect_attempts and 
               self.state != WebSocketState.CONNECTED):
            self.reconnect_attempts += 1
            logger.info(f"正在進行第{self.reconnect_attempts}次重連...")
            
            # 等待重連延遲
            await asyncio.sleep(self.reconnect_delay * min(self.reconnect_attempts, 5))
            
            # 嘗試連接
            if await self.connect():
                break
        
        if self.state != WebSocketState.CONNECTED:
            logger.error(f"{self.exchange_name} WebSocket重連失敗，已達最大重試次數")
    
    async def _resubscribe(self) -> None:
        """重新訂閱之前訂閱的交易對"""
        if not self.subscribed_symbols:
            return
            
        symbols_to_subscribe = list(self.subscribed_symbols)
        logger.info(f"重新訂閱{self.exchange_name}交易對: {symbols_to_subscribe}")
        
        try:
            await self.subscribe_symbols(symbols_to_subscribe)
        except Exception as e:
            logger.error(f"重新訂閱{self.exchange_name}交易對失敗: {e}")
    
    def add_price_callback(self, callback: Callable[[str, float], None]) -> None:
        """
        添加價格更新回調函數
        
        Args:
            callback: 回調函數，參數為(symbol, price)
        """
        self.price_callbacks.append(callback)
    
    def remove_price_callback(self, callback: Callable[[str, float], None]) -> None:
        """
        移除價格更新回調函數
        
        Args:
            callback: 要移除的回調函數
        """
        if callback in self.price_callbacks:
            self.price_callbacks.remove(callback)
    
    def _notify_price_update(self, symbol: str, price: float) -> None:
        """
        通知所有回調函數價格更新
        
        Args:
            symbol: 交易對
            price: 更新的價格
        """
        for callback in self.price_callbacks:
            try:
                callback(symbol, price)
            except Exception as e:
                logger.error(f"執行價格回調函數時出錯: {e}")
    
    # 抽象方法，子類必須實現
    @abstractmethod
    async def subscribe_symbols(self, symbols: List[str]) -> bool:
        """
        訂閱交易對價格
        
        Args:
            symbols: 交易對列表，例如 ["BTC/USDT", "ETH/USDT"]
            
        Returns:
            訂閱是否成功
        """
        pass
    
    @abstractmethod
    async def unsubscribe_symbols(self, symbols: List[str]) -> bool:
        """
        取消訂閱交易對價格
        
        Args:
            symbols: 交易對列表，例如 ["BTC/USDT", "ETH/USDT"]
            
        Returns:
            取消訂閱是否成功
        """
        pass
    
    @abstractmethod
    async def _send_ping(self) -> None:
        """發送心跳包"""
        pass
    
    @abstractmethod
    async def _process_message(self, message: str) -> None:
        """
        處理WebSocket文本消息
        
        Args:
            message: WebSocket消息
        """
        pass
    
    @abstractmethod
    async def _process_binary_message(self, data: bytes) -> None:
        """
        處理WebSocket二進制消息
        
        Args:
            data: 二進制數據
        """
        pass 