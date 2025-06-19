from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.exchange_keys import ExchangeKey
from app.utils.crypto import CryptoManager
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ApiKeyManager:
    """
    API 密鑰管理器
    
    負責處理所有與交易所 API 密鑰相關的操作，包括獲取、新增、修改、刪除和使用 API 密鑰。
    所有與數據庫的交互都在此類中進行，其他服務通過此類來操作 API 密鑰。
    """
    
    def __init__(self, db: AsyncSession, crypto_manager: CryptoManager):
        """
        初始化 API 密鑰管理器
        
        Args:
            db: 數據庫會話
            crypto_manager: 加密管理器，用於加密和解密 API 密鑰
        """
        self.db = db
        self.crypto_manager = crypto_manager
    
    async def get_all_keys(self, exchange_id: Optional[str] = None) -> List[ExchangeKey]:
        """
        獲取所有 API 密鑰
        
        Args:
            exchange_id: 可選的交易所 ID 過濾器
            
        Returns:
            API 密鑰列表
        """
        query = select(ExchangeKey)
        
        if exchange_id:
            query = query.where(ExchangeKey.exchange_id == exchange_id)
            
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_key_by_id(self, key_id: int) -> Optional[ExchangeKey]:
        """
        根據 ID 獲取 API 密鑰
        
        Args:
            key_id: API 密鑰 ID
            
        Returns:
            API 密鑰對象，如果未找到則返回 None
        """
        result = await self.db.execute(
            select(ExchangeKey).where(ExchangeKey.id == key_id)
        )
        return result.scalars().first()
    
    async def create_key(self, 
                        exchange_id: str, 
                        name: str, 
                        api_key: str, 
                        api_secret: str, 
                        api_password: Optional[str] = None, 
                        test_mode: bool = True) -> ExchangeKey:
        """
        創建新的 API 密鑰
        
        Args:
            exchange_id: 交易所 ID
            name: 用戶定義的名稱
            api_key: API Key
            api_secret: API Secret
            api_password: API 密碼 (某些交易所需要)
            test_mode: 是否為測試模式
            
        Returns:
            創建的 API 密鑰對象
        """
        # 加密敏感數據
        encrypted_api_key = self.crypto_manager.encrypt(api_key)
        encrypted_api_secret = self.crypto_manager.encrypt(api_secret)
        encrypted_api_password = self.crypto_manager.encrypt(api_password) if api_password else None
        
        # 創建數據庫記錄
        db_key = ExchangeKey(
            exchange_id=exchange_id,
            name=name,
            api_key=encrypted_api_key,
            api_secret=encrypted_api_secret,
            api_password=encrypted_api_password,
            test_mode=test_mode
        )
        
        self.db.add(db_key)
        await self.db.commit()
        await self.db.refresh(db_key)
        
        logger.info(f"已創建 API 密鑰: ID {db_key.id}, 交易所 {exchange_id}, 名稱 {name}")
        return db_key
    
    async def update_key(self, 
                        key_id: int, 
                        name: Optional[str] = None, 
                        is_active: Optional[bool] = None, 
                        test_mode: Optional[bool] = None) -> Optional[ExchangeKey]:
        """
        更新 API 密鑰信息
        
        Args:
            key_id: API 密鑰 ID
            name: 新的名稱 (可選)
            is_active: 是否啟用 (可選)
            test_mode: 是否為測試模式 (可選)
            
        Returns:
            更新後的 API 密鑰對象，如果未找到則返回 None
        """
        # 獲取密鑰
        db_key = await self.get_key_by_id(key_id)
        
        if not db_key:
            logger.warning(f"嘗試更新不存在的 API 密鑰: ID {key_id}")
            return None
        
        # 更新數據
        if name is not None:
            db_key.name = name
        
        if is_active is not None:
            db_key.is_active = is_active
        
        if test_mode is not None:
            db_key.test_mode = test_mode
        
        await self.db.commit()
        await self.db.refresh(db_key)
        
        logger.info(f"已更新 API 密鑰: ID {key_id}")
        return db_key
    
    async def delete_key(self, key_id: int) -> bool:
        """
        刪除 API 密鑰
        
        Args:
            key_id: API 密鑰 ID
            
        Returns:
            是否成功刪除
        """
        # 獲取密鑰
        db_key = await self.get_key_by_id(key_id)
        
        if not db_key:
            logger.warning(f"嘗試刪除不存在的 API 密鑰: ID {key_id}")
            return False
        
        # 刪除記錄
        await self.db.delete(db_key)
        await self.db.commit()
        
        logger.info(f"已刪除 API 密鑰: ID {key_id}")
        return True
    
    async def toggle_key_status(self, key_id: int) -> Optional[ExchangeKey]:
        """
        切換 API 密鑰的啟用狀態
        
        Args:
            key_id: API 密鑰 ID
            
        Returns:
            更新後的 API 密鑰對象，如果未找到則返回 None
        """
        # 獲取密鑰
        db_key = await self.get_key_by_id(key_id)
        
        if not db_key:
            logger.warning(f"嘗試切換不存在的 API 密鑰狀態: ID {key_id}")
            return None
        
        # 切換狀態
        db_key.is_active = not db_key.is_active
        await self.db.commit()
        await self.db.refresh(db_key)
        
        logger.info(f"已切換 API 密鑰狀態: ID {key_id}, 新狀態: {'啟用' if db_key.is_active else '禁用'}")
        return db_key
    
    async def get_decrypted_key_data(self, key_id: int) -> Optional[Dict[str, Any]]:
        """
        獲取解密後的 API 密鑰數據
        
        Args:
            key_id: API 密鑰 ID
            
        Returns:
            包含解密後 API 密鑰數據的字典，如果未找到則返回 None
        """
        # 獲取密鑰
        db_key = await self.get_key_by_id(key_id)
        
        if not db_key:
            logger.warning(f"嘗試獲取不存在的 API 密鑰數據: ID {key_id}")
            return None
        
        # 如果密鑰未啟用，拒絕提供數據
        if not db_key.is_active:
            logger.warning(f"嘗試獲取已禁用的 API 密鑰數據: ID {key_id}")
            return None
        
        # 解密密鑰
        api_key = self.crypto_manager.decrypt(db_key.api_key)
        api_secret = self.crypto_manager.decrypt(db_key.api_secret)
        api_password = self.crypto_manager.decrypt(db_key.api_password) if db_key.api_password else None
        
        return {
            "id": db_key.id,
            "exchange_id": db_key.exchange_id,
            "name": db_key.name,
            "api_key": api_key,
            "api_secret": api_secret,
            "api_password": api_password,
            "test_mode": db_key.test_mode,
            "is_active": db_key.is_active
        } 