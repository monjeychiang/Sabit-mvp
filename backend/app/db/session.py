from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# SQLite 連接字串轉換為異步格式
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

# 創建異步引擎
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=True,
)

# 創建異步會話工廠
AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """
    獲取資料庫會話的依賴函數
    
    用法範例:
    ```python
    @app.get("/items/")
    async def read_items(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(Item))
        items = result.scalars().all()
        return items
    ```
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 