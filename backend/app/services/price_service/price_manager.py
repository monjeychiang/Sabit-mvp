"""
價格管理器

統一管理不同交易所的WebSocket連接和價格監控。
提供統一的接口進行價格訂閱、查詢和警報設置。
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Set, Any, Callable, Tuple

from app.services.price_service.binance_websocket import BinanceWebSocket
from app.services.price_service.okx_websocket import OkxWebSocket

logger = logging.getLogger(__name__)

class PriceManager:
    """
    價格管理器，統一管理交易所連接和價格監控
    """
    
    def __init__(self):
        """初始化價格管理器"""
        # 存儲WebSocket連接實例
        self.exchange_connections: Dict[str, Any] = {}
        
        # 交易對和交易所的映射，用於跟踪每個交易對的訂閱情況
        # {"BTC/USDT": ["binance", "okx"], "ETH/USDT": ["binance"]}
        self.symbol_exchanges: Dict[str, List[str]] = {}
        
        # 價格更新回調函數
        # [(callback1, {"binance"}), (callback2, {"binance", "okx"})]
        self.price_callbacks: List[Tuple[Callable[[str, str, float], None], Set[str]]] = []
        
        # 預設交易所配置
        self.exchange_configs = {
            "binance": {
                "spot": {"market_type": "spot"},
                "futures": {"market_type": "futures"}
            },
            "okx": {
                "spot": {"market_type": "spot"},
                "swap": {"market_type": "swap"},
                "futures": {"market_type": "futures"}
            }
        }
        
        # 最新價格緩存
        # {"BTC/USDT": {"binance": 50000.0, "okx": 50010.0}}
        self.latest_prices: Dict[str, Dict[str, float]] = {}
    
    async def init_exchange(self, exchange_id: str, market_type: str = "spot") -> bool:
        """
        初始化交易所連接
        
        Args:
            exchange_id: 交易所ID，例如 "binance", "okx"
            market_type: 市場類型，例如 "spot", "futures", "swap"
            
        Returns:
            初始化是否成功
        """
        conn_key = f"{exchange_id}_{market_type}"
        
        # 檢查是否已初始化
        if conn_key in self.exchange_connections:
            logger.info(f"交易所連接已存在: {conn_key}")
            return True
        
        try:
            # 創建交易所連接
            if exchange_id.lower() == "binance":
                if market_type not in self.exchange_configs["binance"]:
                    logger.error(f"幣安不支持的市場類型: {market_type}")
                    return False
                    
                config = self.exchange_configs["binance"][market_type]
                connection = BinanceWebSocket(
                    market_type=config["market_type"]
                )
            elif exchange_id.lower() == "okx":
                if market_type not in self.exchange_configs["okx"]:
                    logger.error(f"OKX不支持的市場類型: {market_type}")
                    return False
                    
                config = self.exchange_configs["okx"][market_type]
                connection = OkxWebSocket(
                    market_type=config["market_type"]
                )
            else:
                logger.error(f"不支持的交易所: {exchange_id}")
                return False
            
            # 添加到連接管理器
            self.exchange_connections[conn_key] = connection
            
            # 設置價格更新回調
            connection.add_price_callback(
                lambda symbol, price: self._on_price_update(exchange_id, symbol, price)
            )
            
            # 連接WebSocket
            success = await connection.connect()
            if not success:
                logger.error(f"連接{exchange_id}_{market_type} WebSocket失敗")
                del self.exchange_connections[conn_key]
                return False
            
            logger.info(f"初始化{exchange_id}_{market_type}交易所連接成功")
            return True
        except Exception as e:
            logger.error(f"初始化{exchange_id}_{market_type}交易所連接失敗: {e}")
            return False
    
    async def close_all(self) -> None:
        """關閉所有交易所連接"""
        for conn_key, connection in list(self.exchange_connections.items()):
            try:
                await connection.disconnect()
                logger.info(f"已關閉{conn_key}交易所連接")
            except Exception as e:
                logger.error(f"關閉{conn_key}交易所連接失敗: {e}")
        
        # 清空數據
        self.exchange_connections.clear()
        self.symbol_exchanges.clear()
        self.latest_prices.clear()
    
    async def subscribe_symbol(self, symbol: str, exchange_ids: List[str], market_type: str = "spot") -> Dict[str, bool]:
        """
        訂閱交易對價格，支持指定多個交易所
        
        Args:
            symbol: 交易對，例如 "BTC/USDT"
            exchange_ids: 交易所ID列表，例如 ["binance", "okx"]
            market_type: 市場類型，例如 "spot", "futures", "swap"
            
        Returns:
            各交易所訂閱結果，例如 {"binance": True, "okx": False}
        """
        results = {}
        
        for exchange_id in exchange_ids:
            # 根據交易所和市場類型確定最終使用的市場類型
            effective_market_type = market_type
            
            # 根據交易所限制調整市場類型
            if exchange_id.lower() == "binance" and market_type == "swap":
                # 幣安使用 futures 代替 swap
                effective_market_type = "futures"
                logger.info(f"幣安不支持 'swap'，自動轉換為 'futures'")
            elif exchange_id.lower() == "okx" and market_type == "futures":
                # OKX使用 swap 代替 futures (簡化處理)
                effective_market_type = "swap"
                logger.info(f"OKX使用 'swap' 代替 'futures' (簡化處理)")
            
            # 初始化交易所連接
            conn_key = f"{exchange_id}_{effective_market_type}"
            if conn_key not in self.exchange_connections:
                init_success = await self.init_exchange(exchange_id, effective_market_type)
                if not init_success:
                    results[exchange_id] = False
                    continue
            
            connection = self.exchange_connections[conn_key]
            
            # 訂閱交易對
            try:
                success = await connection.subscribe_symbols([symbol])
                results[exchange_id] = success
                
                # 更新交易對和交易所的映射
                if success:
                    if symbol not in self.symbol_exchanges:
                        self.symbol_exchanges[symbol] = []
                    if exchange_id not in self.symbol_exchanges[symbol]:
                        self.symbol_exchanges[symbol].append(exchange_id)
                    
                    logger.info(f"已訂閱{exchange_id}交易對: {symbol} (市場類型: {effective_market_type})")
            except Exception as e:
                logger.error(f"訂閱{exchange_id}交易對{symbol}失敗: {e}")
                results[exchange_id] = False
        
        return results
    
    async def unsubscribe_symbol(self, symbol: str, exchange_ids: Optional[List[str]] = None) -> Dict[str, bool]:
        """
        取消訂閱交易對價格
        
        Args:
            symbol: 交易對，例如 "BTC/USDT"
            exchange_ids: 交易所ID列表，例如 ["binance", "okx"]。如果為None，則取消所有交易所的訂閱
            
        Returns:
            各交易所取消訂閱結果，例如 {"binance": True, "okx": True}
        """
        results = {}
        
        # 如果沒有指定交易所，取消所有訂閱該交易對的交易所
        if exchange_ids is None:
            exchange_ids = self.symbol_exchanges.get(symbol, [])
        
        for exchange_id in exchange_ids:
            # 檢查交易對是否在該交易所訂閱
            if symbol not in self.symbol_exchanges or exchange_id not in self.symbol_exchanges[symbol]:
                logger.warning(f"{exchange_id}未訂閱交易對{symbol}")
                results[exchange_id] = True  # 視為成功，因為本來就沒訂閱
                continue
            
            # 查找連接
            found = False
            for conn_key, connection in self.exchange_connections.items():
                if conn_key.startswith(f"{exchange_id}_"):
                    try:
                        success = await connection.unsubscribe_symbols([symbol])
                        results[exchange_id] = success
                        
                        if success:
                            # 更新交易對和交易所的映射
                            self.symbol_exchanges[symbol].remove(exchange_id)
                            if not self.symbol_exchanges[symbol]:
                                del self.symbol_exchanges[symbol]
                            
                            # 清除價格緩存
                            if symbol in self.latest_prices and exchange_id in self.latest_prices[symbol]:
                                del self.latest_prices[symbol][exchange_id]
                                if not self.latest_prices[symbol]:
                                    del self.latest_prices[symbol]
                            
                            logger.info(f"已取消訂閱{exchange_id}交易對: {symbol}")
                        
                        found = True
                        break
                    except Exception as e:
                        logger.error(f"取消訂閱{exchange_id}交易對{symbol}失敗: {e}")
                        results[exchange_id] = False
                        found = True
                        break
            
            if not found:
                logger.warning(f"找不到{exchange_id}的交易所連接")
                results[exchange_id] = False
        
        return results
    
    def _on_price_update(self, exchange_id: str, symbol: str, price: float) -> None:
        """
        處理價格更新
        
        Args:
            exchange_id: 交易所ID
            symbol: 交易對
            price: 價格
        """
        # 更新最新價格緩存
        if symbol not in self.latest_prices:
            self.latest_prices[symbol] = {}
        self.latest_prices[symbol][exchange_id] = price
        
        # 通知回調
        for callback, exchanges in self.price_callbacks:
            if not exchanges or exchange_id in exchanges:
                try:
                    callback(exchange_id, symbol, price)
                except Exception as e:
                    logger.error(f"執行價格回調函數時出錯: {e}")
    
    def add_price_callback(self, callback: Callable[[str, str, float], None], 
                          exchanges: Optional[Set[str]] = None) -> None:
        """
        添加價格更新回調函數
        
        Args:
            callback: 回調函數，參數為(exchange_id, symbol, price)
            exchanges: 只關注特定交易所的價格更新，None表示所有交易所
        """
        self.price_callbacks.append((callback, exchanges or set()))
    
    def remove_price_callback(self, callback: Callable[[str, str, float], None]) -> None:
        """
        移除價格更新回調函數
        
        Args:
            callback: 要移除的回調函數
        """
        self.price_callbacks = [(cb, exs) for cb, exs in self.price_callbacks if cb != callback]
    
    def get_latest_price(self, symbol: str, exchange_id: Optional[str] = None) -> Optional[Dict[str, float]]:
        """
        獲取交易對的最新價格
        
        Args:
            symbol: 交易對，例如 "BTC/USDT"
            exchange_id: 交易所ID，如果為None則返回所有交易所的價格
            
        Returns:
            價格信息，例如 {"binance": 50000.0, "okx": 50010.0} 或 50000.0 (指定exchange_id時)
        """
        if symbol not in self.latest_prices:
            return None
        
        if exchange_id:
            return self.latest_prices[symbol].get(exchange_id)
        
        return self.latest_prices[symbol]
    
    def get_subscribed_symbols(self) -> Dict[str, List[str]]:
        """
        獲取所有已訂閱的交易對
        
        Returns:
            交易對和訂閱的交易所的映射，例如 {"BTC/USDT": ["binance", "okx"], "ETH/USDT": ["binance"]}
        """
        return dict(self.symbol_exchanges)
    
    def get_exchange_status(self) -> Dict[str, bool]:
        """
        獲取交易所連接狀態
        
        Returns:
            交易所連接狀態，例如 {"binance_spot": True, "okx_spot": False}
        """
        return {
            conn_key: connection.state.name == "CONNECTED"
            for conn_key, connection in self.exchange_connections.items()
        }
    
    def get_symbol_market_types(self, symbol: str) -> Dict[str, str]:
        """
        獲取交易對的市場類型
        
        Args:
            symbol: 交易對，例如 "BTC/USDT"
            
        Returns:
            各交易所對應的市場類型，例如 {"binance": "spot", "okx": "spot"}
        """
        market_types = {}
        
        # 尋找包含該交易對的所有連接
        for conn_key, connection in self.exchange_connections.items():
            if symbol in connection.subscribed_symbols:
                # conn_key 格式為 "{exchange_id}_{market_type}"
                exchange_id, market_type = conn_key.split('_', 1)
                market_types[exchange_id] = market_type 