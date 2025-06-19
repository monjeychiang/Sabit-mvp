import aiohttp
import logging
import time
import datetime
import asyncio
from typing import Dict, Optional, Union
import pytz
import os

# 創建 logger 實例
logger = logging.getLogger(__name__)

class TimeSync:
    """時間同步工具，用於確保本地時間與交易所時間同步"""
    
    def __init__(self):
        self.time_offsets = {}  # 存儲各服務的時間偏移
        self.last_sync_time = {}  # 最後同步時間
        self.sync_interval = int(os.environ.get("TIME_SYNC_INTERVAL", "3600"))  # 從環境變數讀取同步間隔（秒）
        self.timezone = pytz.timezone('Asia/Taipei')  # 設置台北時區
        self.utc_offset = 8 * 3600  # 台北時區 UTC+8 (秒)
        self.preferred_service = os.environ.get("PREFERRED_TIME_SERVICE", "google")  # 從環境變數讀取優先時間服務
        
    async def get_google_time(self) -> Optional[float]:
        """
        從Google獲取當前時間
        
        Returns:
            服務器時間（Unix時間戳）或None（如果請求失敗）
        """
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get('https://www.google.com') as response:
                    # 從響應頭獲取日期
                    if response.status == 200 and 'Date' in response.headers:
                        date_str = response.headers['Date']
                        # 解析HTTP日期格式
                        server_time = datetime.datetime.strptime(
                            date_str, '%a, %d %b %Y %H:%M:%S %Z'
                        ).timestamp()
                        
                        # 調整為台北時間 (UTC+8)
                        adjusted_time = server_time + self.utc_offset
                        
                        # 記錄時間信息
                        utc_time = datetime.datetime.fromtimestamp(server_time, pytz.UTC)
                        taipei_time = datetime.datetime.fromtimestamp(adjusted_time, self.timezone)
                        logger.info(f"Google 時間 (UTC): {utc_time}")
                        logger.info(f"Google 時間 (台北): {taipei_time}")
                        
                        return adjusted_time
            logger.warning("無法從Google獲取時間")
            return None
        except Exception as e:
            logger.error(f"獲取Google時間時發生錯誤: {e}")
            return None
    
    async def get_binance_time(self) -> Optional[float]:
        """
        從Binance獲取當前時間
        
        Returns:
            服務器時間（Unix時間戳）或None（如果請求失敗）
        """
        try:
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get('https://api.binance.com/api/v3/time') as response:
                    if response.status == 200:
                        data = await response.json()
                        server_time = data['serverTime'] / 1000.0  # 轉換為秒
                        logger.info(f"Binance 時間: {datetime.datetime.fromtimestamp(server_time, self.timezone)}")
                        return server_time
            logger.warning("無法從Binance獲取時間")
            return None
        except Exception as e:
            logger.error(f"獲取Binance時間時發生錯誤: {e}")
            return None
    
    async def sync_time(self) -> Dict[str, Union[float, str]]:
        """
        同步本地時間與Google和Binance時間
        
        Returns:
            包含時間偏移信息的字典
        """
        current_time = time.time()
        
        # 檢查是否需要更新
        should_update = False
        for service in ['google', 'binance']:
            if (service not in self.last_sync_time or 
                current_time - self.last_sync_time.get(service, 0) > self.sync_interval):
                should_update = True
                break
        
        if not should_update:
            return {
                'google_offset': self.time_offsets.get('google', 0),
                'binance_offset': self.time_offsets.get('binance', 0),
                'preferred_service': self.preferred_service,
                'last_sync': max(self.last_sync_time.values()) if self.last_sync_time else 0,
                'message': '使用緩存的時間偏移'
            }
        
        # 獲取服務器時間
        google_time = await self.get_google_time()
        binance_time = await self.get_binance_time()
        
        result = {
            'google_offset': 0,
            'binance_offset': 0,
            'preferred_service': self.preferred_service,
            'message': '時間同步完成'
        }
        
        # 計算偏移
        if google_time:
            self.time_offsets['google'] = google_time - current_time
            self.last_sync_time['google'] = current_time
            result['google_offset'] = self.time_offsets['google']
            
        if binance_time:
            self.time_offsets['binance'] = binance_time - current_time
            self.last_sync_time['binance'] = current_time
            result['binance_offset'] = self.time_offsets['binance']
        
        # 記錄時間偏移
        logger.info(f"時間偏移 - Google: {self.time_offsets.get('google', 0):.3f}秒, "
                   f"Binance: {self.time_offsets.get('binance', 0):.3f}秒")
        
        # 如果Google時間不可用，則使用Binance時間
        if self.preferred_service == 'google' and 'google' not in self.time_offsets:
            logger.warning("Google時間不可用，切換到Binance時間")
            self.preferred_service = 'binance'
        
        result['preferred_service'] = self.preferred_service
        return result
    
    def get_adjusted_time(self, service: str = None) -> float:
        """
        獲取根據服務調整後的當前時間
        
        Args:
            service: 服務名稱 ('google' 或 'binance')，如果為None則使用優先服務
            
        Returns:
            調整後的Unix時間戳
        """
        # 如果未指定服務，使用優先服務
        if service is None:
            service = self.preferred_service
            
        # 如果優先服務不可用，嘗試使用另一個服務
        if service not in self.time_offsets:
            alternative = 'binance' if service == 'google' else 'google'
            if alternative in self.time_offsets:
                logger.warning(f"{service} 時間偏移不可用，使用 {alternative} 時間偏移")
                service = alternative
            else:
                logger.warning(f"所有時間服務都不可用，使用本地時間")
                return time.time()
                
        offset = self.time_offsets.get(service, 0)
        return time.time() + offset
    
    def get_time_info(self) -> Dict:
        """
        獲取時間同步信息
        
        Returns:
            包含時間同步信息的字典
        """
        local_time = time.time()
        return {
            'offsets': self.time_offsets,
            'preferred_service': self.preferred_service,
            'last_sync': self.last_sync_time,
            'local_time': local_time,
            'local_time_taipei': datetime.datetime.fromtimestamp(local_time, self.timezone).strftime('%Y-%m-%d %H:%M:%S'),
            'adjusted_times': {
                service: self.get_adjusted_time(service)
                for service in self.time_offsets
            },
            'adjusted_times_taipei': {
                service: datetime.datetime.fromtimestamp(self.get_adjusted_time(service), self.timezone).strftime('%Y-%m-%d %H:%M:%S')
                for service in self.time_offsets
            },
            'preferred_adjusted_time': self.get_adjusted_time(),
            'preferred_adjusted_time_taipei': datetime.datetime.fromtimestamp(self.get_adjusted_time(), self.timezone).strftime('%Y-%m-%d %H:%M:%S')
        }

# 創建全局實例
time_sync = TimeSync()

async def sync_time_on_startup() -> Dict:
    """
    系統啟動時同步時間的輔助函數
    
    Returns:
        同步結果
    """
    result = await time_sync.sync_time()
    return result 