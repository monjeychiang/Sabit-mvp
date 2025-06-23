"""
交易所信息服務

提供從不同交易所獲取可用交易對列表的功能。
使用交易所公共 API，無需身分驗證。
"""

import aiohttp
import logging
import asyncio
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class ExchangeInfoService:
    """提供交易所交易對信息服務"""
    
    # 交易所 API 端點
    BINANCE_SPOT_API = "https://api.binance.com/api/v3/exchangeInfo"
    BINANCE_FUTURES_API = "https://fapi.binance.com/fapi/v1/exchangeInfo"
    OKX_API = "https://www.okx.com/api/v5/public/instruments"
    
    def __init__(self):
        """初始化交易所信息服務"""
        # 緩存交易對列表，減少 API 調用
        self.cache = {}
        self.cache_timestamp = {}
        # 緩存有效期（秒），設定為10分鐘
        self.cache_ttl = 600
    
    async def _make_request(self, url: str, params: Optional[Dict[str, Any]] = None) -> Dict:
        """
        向 API 端點發送請求
        
        Args:
            url: API 端點 URL
            params: 請求參數
            
        Returns:
            API 回應
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, params=params, timeout=10) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"API 請求失敗: {url}, 狀態碼: {response.status}")
                        return {}
            except Exception as e:
                logger.error(f"API 請求異常: {url}, 錯誤: {e}")
                return {}
    
    async def get_binance_spot_symbols(self, force_refresh: bool = False) -> List[str]:
        """
        獲取幣安現貨交易對列表
        
        Args:
            force_refresh: 是否強制刷新緩存
            
        Returns:
            交易對列表
        """
        cache_key = "binance_spot"
        
        # 檢查緩存
        if not force_refresh and cache_key in self.cache and (
                asyncio.get_event_loop().time() - self.cache_timestamp.get(cache_key, 0) < self.cache_ttl):
            return self.cache[cache_key]
        
        # 發送請求
        try:
            response = await self._make_request(self.BINANCE_SPOT_API)
            
            if response and "symbols" in response:
                # 篩選狀態為 TRADING 的交易對，並轉換為標準格式
                symbols = [f"{symbol['baseAsset']}/{symbol['quoteAsset']}" 
                          for symbol in response["symbols"] 
                          if symbol["status"] == "TRADING"]
                
                # 更新緩存
                self.cache[cache_key] = symbols
                self.cache_timestamp[cache_key] = asyncio.get_event_loop().time()
                
                logger.info(f"已獲取幣安現貨交易對列表，共 {len(symbols)} 個交易對")
                return symbols
        except Exception as e:
            logger.error(f"獲取幣安現貨交易對列表失敗: {e}")
        
        # 返回空列表，如果請求失敗
        return []
    
    async def get_binance_futures_symbols(self, force_refresh: bool = False) -> List[str]:
        """
        獲取幣安合約交易對列表
        
        Args:
            force_refresh: 是否強制刷新緩存
            
        Returns:
            交易對列表
        """
        cache_key = "binance_futures"
        
        # 檢查緩存
        if not force_refresh and cache_key in self.cache and (
                asyncio.get_event_loop().time() - self.cache_timestamp.get(cache_key, 0) < self.cache_ttl):
            return self.cache[cache_key]
        
        # 發送請求
        try:
            response = await self._make_request(self.BINANCE_FUTURES_API)
            
            if response and "symbols" in response:
                # 篩選狀態為 TRADING 的交易對，並轉換為標準格式
                symbols = [f"{symbol['baseAsset']}/{symbol['quoteAsset']}"
                          for symbol in response["symbols"]
                          if symbol["status"] == "TRADING"]
                
                # 更新緩存
                self.cache[cache_key] = symbols
                self.cache_timestamp[cache_key] = asyncio.get_event_loop().time()
                
                logger.info(f"已獲取幣安合約交易對列表，共 {len(symbols)} 個交易對")
                return symbols
        except Exception as e:
            logger.error(f"獲取幣安合約交易對列表失敗: {e}")
        
        # 返回空列表，如果請求失敗
        return []
    
    async def get_okx_symbols(self, inst_type: str = "SPOT", force_refresh: bool = False) -> List[str]:
        """
        獲取OKX交易對列表
        
        Args:
            inst_type: 產品類型，"SPOT"(現貨), "SWAP"(永續合約), "FUTURES"(交割合約)
            force_refresh: 是否強制刷新緩存
            
        Returns:
            交易對列表
        """
        cache_key = f"okx_{inst_type.lower()}"
        
        # 檢查緩存
        if not force_refresh and cache_key in self.cache and (
                asyncio.get_event_loop().time() - self.cache_timestamp.get(cache_key, 0) < self.cache_ttl):
            return self.cache[cache_key]
        
        # 發送請求
        try:
            params = {"instType": inst_type}
            response = await self._make_request(self.OKX_API, params)
            
            if response and "data" in response:
                # 轉換為標準格式
                symbols = []
                for instrument in response["data"]:
                    if "state" in instrument and instrument["state"] == "live":
                        # 分割 OKX 格式的交易對，例如 "BTC-USDT" -> "BTC/USDT"
                        if "-" in instrument["instId"]:
                            base, quote = instrument["instId"].split("-")[:2]
                            symbols.append(f"{base}/{quote}")
                        else:
                            # 如果格式不符合預期，則使用原始格式
                            symbols.append(instrument["instId"].replace("-", "/"))
                
                # 更新緩存
                self.cache[cache_key] = symbols
                self.cache_timestamp[cache_key] = asyncio.get_event_loop().time()
                
                logger.info(f"已獲取OKX {inst_type} 交易對列表，共 {len(symbols)} 個交易對")
                return symbols
        except Exception as e:
            logger.error(f"獲取OKX {inst_type} 交易對列表失敗: {e}")
        
        # 返回空列表，如果請求失敗
        return []
    
    async def get_all_symbols(self, market_type: str) -> Dict[str, List[str]]:
        """
        獲取所有交易所的交易對列表
        
        Args:
            market_type: 市場類型，"spot", "futures", "swap"
            
        Returns:
            各交易所的交易對列表，例如 {"binance": [...], "okx": [...]}
        """
        result = {}
        tasks = []

        if market_type == "spot":
            tasks.append(self._get_symbols_with_key("binance", self.get_binance_spot_symbols()))
            tasks.append(self._get_symbols_with_key("okx", self.get_okx_symbols("SPOT")))
        elif market_type == "futures":
            tasks.append(self._get_symbols_with_key("binance", self.get_binance_futures_symbols()))
            tasks.append(self._get_symbols_with_key("okx", self.get_okx_symbols("FUTURES")))
        elif market_type == "swap":
            # 幣安沒有直接的 swap 接口，使用 futures
            tasks.append(self._get_symbols_with_key("binance", self.get_binance_futures_symbols()))
            tasks.append(self._get_symbols_with_key("okx", self.get_okx_symbols("SWAP")))
        else:
            logger.warning(f"不支持的市場類型: {market_type}")
            return {}
        
        # 並行獲取所有交易所的數據
        completed_tasks = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 處理結果
        for exchange_id, symbols in completed_tasks:
            if isinstance(symbols, Exception):
                logger.error(f"獲取 {exchange_id} 交易對失敗: {symbols}")
            else:
                result[exchange_id] = symbols
        
        return result

    async def _get_symbols_with_key(self, key: str, coro):
        """
        包裝協程以返回標識符和結果
        """
        result = await coro
        return key, result

# 創建一個全局實例
exchange_info_service = ExchangeInfoService() 