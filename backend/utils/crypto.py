from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from pathlib import Path

class CryptoManager:
    """API 密鑰加密管理器"""
    
    def __init__(self, master_password=None):
        """
        初始化加密管理器
        
        Args:
            master_password: 用於派生加密密鑰的主密碼，如果未提供則使用環境變數
        """
        self.salt_file = Path("config/salt.key")
        self.salt = self._get_or_create_salt()
        self.master_password = master_password or os.environ.get("SABIT_MASTER_PASSWORD")
        
        if not self.master_password:
            raise ValueError("必須提供主密碼或設置 SABIT_MASTER_PASSWORD 環境變數")
            
        self.key = self._derive_key()
        self.cipher = Fernet(self.key)
    
    def _get_or_create_salt(self):
        """獲取或創建鹽值"""
        if self.salt_file.exists():
            with open(self.salt_file, "rb") as f:
                return f.read()
        else:
            # 創建目錄（如果不存在）
            self.salt_file.parent.mkdir(parents=True, exist_ok=True)
            # 生成新的鹽值
            salt = os.urandom(16)
            with open(self.salt_file, "wb") as f:
                f.write(salt)
            return salt
    
    def _derive_key(self):
        """從主密碼派生加密密鑰"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.master_password.encode()))
        return key
    
    def encrypt(self, data):
        """
        加密數據
        
        Args:
            data: 要加密的字符串
            
        Returns:
            加密後的字符串
        """
        if not isinstance(data, str):
            raise TypeError("加密數據必須是字符串")
            
        encrypted = self.cipher.encrypt(data.encode())
        return encrypted.decode()
    
    def decrypt(self, encrypted_data):
        """
        解密數據
        
        Args:
            encrypted_data: 加密的字符串
            
        Returns:
            解密後的字符串
        """
        if not isinstance(encrypted_data, str):
            raise TypeError("加密數據必須是字符串")
            
        decrypted = self.cipher.decrypt(encrypted_data.encode())
        return decrypted.decode() 