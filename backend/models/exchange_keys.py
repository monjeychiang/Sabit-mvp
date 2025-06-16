from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class ExchangeKey(Base):
    """交易所 API 密鑰模型"""
    __tablename__ = "exchange_keys"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(String(50), nullable=False, index=True)  # 交易所標識符 (如 'binance', 'okex')
    name = Column(String(100), nullable=False)  # 用戶定義的名稱
    api_key = Column(Text, nullable=False)  # 加密的 API Key
    api_secret = Column(Text, nullable=False)  # 加密的 API Secret
    api_password = Column(Text, nullable=True)  # 加密的 API 密碼 (某些交易所需要)
    is_active = Column(Boolean, default=True)  # 是否啟用
    test_mode = Column(Boolean, default=True)  # 是否為測試模式
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    class Config:
        orm_mode = True 