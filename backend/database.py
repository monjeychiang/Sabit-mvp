from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# 確保數據庫目錄存在
DB_DIR = Path("data")
DB_DIR.mkdir(exist_ok=True)

# 數據庫 URL
SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{DB_DIR}/sabit_local.db"

# 創建異步引擎
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# 創建異步會話
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

# 創建基類
Base = declarative_base()

# 獲取數據庫會話
async def get_db():
    """獲取數據庫會話"""
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

# 初始化數據庫
async def init_db():
    """初始化數據庫"""
    from models import exchange_keys, user  # 導入模型以創建表
    
    async with engine.begin() as conn:
        # 創建所有表
        await conn.run_sync(Base.metadata.create_all) 