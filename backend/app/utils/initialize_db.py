"""
數據庫初始化腳本，用於創建默認管理員用戶和其他必要數據
"""
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db, init_db
from app.db.models.user import User
from app.services.auth_service import create_user

async def initialize_users():
    """初始化默認管理員用戶"""
    logging.info("正在初始化默認管理員用戶...")
    
    # 獲取數據庫會話
    db_gen = get_db()
    db = await anext(db_gen)
    
    try:
        # 檢查是否已存在默認管理員用戶
        query = select(User).where(User.username == "admin")
        result = await db.execute(query)
        user = result.scalars().first()
        
        if not user:
            # 創建默認管理員用戶
            logging.info("創建默認管理員用戶: admin/admin123")
            await create_user(db, "admin", "admin123")
        else:
            logging.info("管理員用戶已存在，跳過初始化")
            
    except Exception as e:
        logging.error(f"初始化管理員用戶時出錯: {e}")
    finally:
        await db.close()

async def initialize_database():
    """初始化數據庫及其內容"""
    logging.info("正在初始化數據庫...")
    
    # 創建數據庫表
    await init_db()
    
    # 初始化默認管理員用戶
    await initialize_users()
    
    logging.info("數據庫初始化完成")

if __name__ == "__main__":
    # 直接運行此腳本時，執行初始化
    logging.basicConfig(level=logging.INFO)
    asyncio.run(initialize_database()) 
