import ccxt
import ccxt.async_support as ccxt_async
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.api_key_manager import ApiKeyManager
from app.utils.crypto import CryptoManager
from app.utils.time_sync import time_sync
from typing import Dict, List, Any, Optional, Union
import logging
import time
import os

logger = logging.getLogger(__name__)

class ExchangeService:
    """交易所操作服務"""
    
    # 類級別變數，用於跨實例共享交易所連線
    _shared_exchanges = {}  # 緩存已創建的交易所實例
    _exchange_last_used = {}  # 記錄每個交易所最後使用時間
    _exchange_locks = {}  # 用於同步訪問的鎖
    _connection_ttl = int(os.environ.get("EXCHANGE_CONNECTION_TTL", "3600"))  # 從環境變數讀取連線存活時間（秒）
    
    @classmethod
    async def get_shared_exchange(cls, key_id: int, api_key_manager: ApiKeyManager):
        """
        獲取或創建共享的交易所實例
        
        Args:
            key_id: 密鑰 ID
            api_key_manager: API 密鑰管理器
            
        Returns:
            交易所實例
        """
        # 如果沒有此密鑰的鎖，創建一個
        if key_id not in cls._exchange_locks:
            cls._exchange_locks[key_id] = asyncio.Lock()
            
        # 使用鎖確保同一時間只有一個請求創建/獲取交易所實例
        async with cls._exchange_locks[key_id]:
            # 檢查緩存
            if key_id in cls._shared_exchanges:
                # 更新最後使用時間
                cls._exchange_last_used[key_id] = time.time()
                return cls._shared_exchanges[key_id]
                
            # 獲取密鑰數據
            key_data = await api_key_manager.get_decrypted_key_data(key_id)
            
            if not key_data:
                raise ValueError(f"找不到 ID 為 {key_id} 的交易所密鑰或密鑰已被禁用")
            
            # 驗證解密後的值
            if not key_data["api_key"]:
                logger.error(f"API Key 解密失敗或為空: ID {key_id}")
                raise ValueError(f"API Key 解密失敗或為空")
                
            if not key_data["api_secret"]:
                logger.error(f"API Secret 解密失敗或為空: ID {key_id}")
                raise ValueError(f"API Secret 解密失敗或為空")
            
            # 創建交易所實例
            exchange_class = getattr(ccxt_async, key_data["exchange_id"])
            
            exchange_params = {
                'apiKey': key_data["api_key"],
                'secret': key_data["api_secret"],
                'enableRateLimit': True,
            }
            
            if key_data["api_password"]:
                exchange_params['password'] = key_data["api_password"]
                
            # 設置測試模式（如果支持）
            if key_data["test_mode"]:
                if key_data["exchange_id"] in ['binance', 'bitmex', 'bybit', 'okex', 'huobi']:
                    exchange_params['options'] = {'defaultType': 'future'}
                    
                    if key_data["exchange_id"] == 'binance':
                        exchange_params['options']['test'] = True
                    elif key_data["exchange_id"] == 'bitmex':
                        exchange_params['urls'] = {'api': ccxt_async.bitmex().urls['test']}
                    elif key_data["exchange_id"] == 'bybit':
                        exchange_params['urls'] = {'api': ccxt_async.bybit().urls['test']}
                        
            # 創建交易所實例
            exchange = exchange_class(exchange_params)
            
            # 為交易所添加獲取同步時間的方法 - 使用優先服務
            exchange.get_synced_timestamp = lambda: time_sync.get_adjusted_time() * 1000  # 轉換為毫秒
            
            # 設置時間提供者（針對不同交易所可能需要不同設置）
            if key_data["exchange_id"] == 'binance':
                # Binance 要求時間戳精度較高
                exchange.options['timeDifference'] = int((time_sync.get_adjusted_time() - time.time()) * 1000)
                logger.info(f"為 Binance 設置時間偏移: {exchange.options['timeDifference']}毫秒 (使用{time_sync.preferred_service}時間)")
            
            # 緩存交易所實例
            cls._shared_exchanges[key_id] = exchange
            cls._exchange_last_used[key_id] = time.time()
            
            logger.info(f"已創建交易所連線: ID {key_id}, {exchange.id}")
            return exchange
    
    @classmethod
    async def close_shared_exchange(cls, key_id: int):
        """
        關閉指定的共享交易所連線
        
        Args:
            key_id: 密鑰 ID
        """
        if key_id in cls._exchange_locks:
            async with cls._exchange_locks[key_id]:
                if key_id in cls._shared_exchanges:
                    try:
                        await cls._shared_exchanges[key_id].close()
                        logger.info(f"已關閉交易所連線: ID {key_id}")
                    except Exception as e:
                        logger.error(f"關閉交易所連線失敗: ID {key_id}, 錯誤: {e}")
                    finally:
                        if key_id in cls._shared_exchanges:
                            del cls._shared_exchanges[key_id]
                        if key_id in cls._exchange_last_used:
                            del cls._exchange_last_used[key_id]
    
    @classmethod
    async def close_all_shared_exchanges(cls):
        """關閉所有共享的交易所連線"""
        for key_id in list(cls._shared_exchanges.keys()):
            await cls.close_shared_exchange(key_id)
    
    @classmethod
    async def cleanup_idle_connections(cls, max_idle_time: int = None):
        """
        清理閒置的交易所連線
        
        Args:
            max_idle_time: 最大閒置時間（秒），默認使用類變數
        """
        if max_idle_time is None:
            max_idle_time = cls._connection_ttl
            
        current_time = time.time()
        for key_id in list(cls._exchange_last_used.keys()):
            if current_time - cls._exchange_last_used.get(key_id, 0) > max_idle_time:
                await cls.close_shared_exchange(key_id)
                logger.info(f"已清理閒置交易所連線: ID {key_id}, 閒置時間超過 {max_idle_time}秒")
    
    def __init__(self, api_key_manager: ApiKeyManager):
        """
        初始化交易所服務
        
        Args:
            api_key_manager: API 密鑰管理器
        """
        self.api_key_manager = api_key_manager
        self.exchanges = {}  # 實例級別緩存，用於兼容現有代碼
    
    async def get_exchange(self, key_id: int) -> ccxt_async.Exchange:
        """
        根據密鑰 ID 獲取交易所實例，使用共享連線機制
        
        Args:
            key_id: 密鑰 ID
            
        Returns:
            交易所實例
        """
        # 使用共享連線機制
        exchange = await self.__class__.get_shared_exchange(key_id, self.api_key_manager)
        
        # 同時更新實例級別緩存，兼容現有代碼
        self.exchanges[key_id] = exchange
        
        return exchange
    
    async def close_all_exchanges(self):
        """關閉所有交易所連接（僅實例級別，不影響共享連線）"""
        # 這個方法保留是為了兼容性，但實際上不再關閉共享連線
        self.exchanges = {}
        logger.debug("實例級別交易所緩存已清空")
    
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
            # 檢查是否為 Binance 合約交易
            is_contract = False
            if exchange.id == 'binance' and (symbol.endswith(':USDT') or 
                                           symbol.endswith('-PERP') or 
                                           symbol.endswith('SWAP') or
                                           'future' in params.get('options', {}).get('defaultType', '')):
                is_contract = True
                
                # 載入市場信息
                await exchange.load_markets()
                
                # 檢查用戶的持倉模式 (單向或雙向)
                try:
                    account_info = await exchange.fapiPrivateGetPositionSideDual()
                    dual_side_position = account_info.get('dualSidePosition', False)
                    
                    # 根據持倉模式設置相應的參數
                    if dual_side_position:  # 雙向持倉模式需要指定持倉方向
                        # 如果用戶未提供持倉方向，根據交易方向推斷
                        if 'positionSide' not in params:
                            # buy 預設為 LONG，sell 預設為 SHORT
                            position_side = 'LONG' if side == 'buy' else 'SHORT'
                            params['positionSide'] = position_side
                            logger.info(f"雙向持倉模式: 自動設置持倉方向為 {position_side}")
                    else:
                        # 單向持倉模式，確保不傳入 positionSide 參數
                        if 'positionSide' in params:
                            del params['positionSide']
                        logger.info("單向持倉模式: 不使用持倉方向參數")
                        
                except Exception as e:
                    logger.warning(f"無法獲取持倉模式，使用默認設置: {e}")

            # 創建訂單
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
            # 特殊處理 Binance 交易所
            if exchange.id == 'binance':
                # 確保市場已載入
                await exchange.load_markets()
                
                # 檢查該交易對是否存在
                if symbol not in exchange.markets:
                    raise ValueError(f"交易對 {symbol} 在交易所 {exchange.id} 不存在")
                
                market = exchange.markets[symbol]
                
                # 檢查市場類型是否支持槓桿設置
                if 'type' in market:
                    market_type = market['type']
                    # 檢查是否是合約或期貨市場
                    if market_type not in ['swap', 'future']:
                        raise ValueError(f"交易對 {symbol} 不是衍生品合約，不支持設置槓桿。請使用合約交易對（通常以 -PERP 或 USDT-SWAP 等結尾）")
                    
                    # 如果是現貨市場而非合約市場，提供明確的錯誤信息
                    if market_type == 'spot':
                        raise ValueError(f"交易對 {symbol} 是現貨交易對，不支持設置槓桿。請使用合約交易對")
                        
                # 設置默認合約類型為期貨（對 Binance 有幫助）
                if 'options' not in params:
                    params['options'] = {}
                    
                if 'defaultType' not in params['options']:
                    params['options']['defaultType'] = 'future'
                
                logger.info(f"為 Binance 交易所的 {symbol} 設置槓桿為 {leverage}x")
                    
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
            # 特殊處理 Binance 交易所，減少 API 速率限制問題
            if exchange.id == 'binance' and not symbol:
                # 設置選項禁用警告
                exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = False
                
                # 如果是 Binance 且未指定 symbol，可以考慮以下做法:
                # 1. 先獲取所有可用的交易對
                markets = await exchange.load_markets()
                
                # 2. 檢查是否有最近使用的交易對或活躍的交易對
                # 此處僅記錄日誌，仍使用原始調用
                logger.info(f"從 Binance 無 symbol 獲取未成交訂單，可能遇到速率限制")
            
            # 針對 OKX 的特殊處理
            if exchange.id == 'okx':
                # 檢查 OKX 是否已經正確設置 password/passphrase 
                # 在 CCXT 4.4.89 中，exchange.credentials 可能不存在，改為檢查 exchange 本身
                has_password = False
                
                # 檢查 exchange.options 是否有 passphrase 設置
                if hasattr(exchange, 'options') and exchange.options and 'passphrase' in exchange.options:
                    has_password = True
                # 或檢查初始化參數
                elif hasattr(exchange, 'password') and exchange.password:
                    has_password = True
                
                if not has_password:
                    logger.error("OKX 獲取未成交訂單：缺少必要的 password 憑證")
                    raise ValueError("OKX 交易所需要 API Passphrase，請確保已設置")
                
                # 記錄嘗試獲取未成交訂單
                symbol_log = f"符號: {symbol}" if symbol else "所有符號"
                logger.info(f"嘗試從 OKX 獲取未成交訂單 ({symbol_log})")
            
            return await exchange.fetch_open_orders(symbol=symbol, params=params)
        except Exception as e:
            logger.error(f"獲取未成交訂單失敗: {e}")
            # 針對 OKX 的特殊錯誤提供更具體的錯誤訊息
            if exchange.id == 'okx' and "requires \"password\" credential" in str(e):
                raise ValueError("OKX 交易所需要 API Passphrase，請在 API 密鑰設置中填寫 API Password 欄位")
            raise

    async def preheat_exchange(self, key_id: int) -> bool:
        """
        預熱交易所連線
        
        Args:
            key_id: 密鑰 ID
            
        Returns:
            是否成功預熱
        """
        try:
            # 獲取密鑰信息
            key_data = await self.api_key_manager.get_key_by_id(key_id)
            
            if not key_data:
                logger.error(f"預熱失敗: 找不到 ID 為 {key_id} 的交易所密鑰")
                return False
                
            # 如果密鑰未啟用，跳過預熱
            if not key_data.is_active:
                logger.warning(f"密鑰 ID {key_id} 已被禁用，跳過預熱")
                # 確保關閉任何可能存在的連線
                await self.__class__.close_shared_exchange(key_id)
                return False
            
            # 使用共享連線機制獲取或創建交易所實例
            try:
                exchange = await self.__class__.get_shared_exchange(key_id, self.api_key_manager)
                
                # 執行一個輕量級操作來測試連線
                logger.info(f"正在測試交易所連線: ID {key_id}, {exchange.id}")
                await exchange.load_markets()
                logger.info(f"交易所連線預熱成功: ID {key_id}, {exchange.id}")
                return True
            except ValueError as ve:
                # 處理值錯誤，通常是由於 API 密鑰問題
                logger.error(f"交易所連線預熱失敗: ID {key_id}, 密鑰錯誤: {ve}")
                # 如果預熱失敗，清除緩存中的實例
                await self.__class__.close_shared_exchange(key_id)
                return False
        except Exception as e:
            logger.error(f"交易所連線預熱失敗: ID {key_id}, 錯誤: {e}")
            # 如果預熱失敗，清除緩存中的實例
            await self.__class__.close_shared_exchange(key_id)
            return False
    
    async def preheat_all_exchanges(self) -> Dict[int, bool]:
        """
        預熱所有活躍的交易所連線
        
        Returns:
            預熱結果字典，鍵為密鑰 ID，值為是否成功
        """
        # 先清理閒置連線
        await self.__class__.cleanup_idle_connections()
        
        # 獲取所有活躍的密鑰
        keys = await self.api_key_manager.get_all_keys()
        active_keys = [key for key in keys if key.is_active]
        results = {}
        
        # 使用 asyncio.gather 並行處理所有預熱任務
        tasks = [self.preheat_exchange(key.id) for key in active_keys]
        preheat_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 整理結果
        for i, key in enumerate(active_keys):
            result = preheat_results[i]
            if isinstance(result, Exception):
                logger.error(f"預熱交易所 {key.id} 時發生異常: {result}")
                results[key.id] = False
            else:
                results[key.id] = result
                
        return results 
