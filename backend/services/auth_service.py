from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
import hashlib
import os
import uuid

def get_password_hash(password: str) -> str:
    """生成密碼雜湊值
    簡單實現，生產環境建議使用更安全的方法（如 bcrypt）
    """
    salt = "sabit-local-salt"  # 固定鹽值，簡化實現
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

async def authenticate_user(db: AsyncSession, username: str, password: str):
    """驗證用戶
    
    Args:
        db: 數據庫會話
        username: 用戶名
        password: 密碼
        
    Returns:
        用戶對象或 None（如果驗證失敗）
    """
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        return None
    
    if not user.is_active:
        return None
    
    if user.password_hash != get_password_hash(password):
        return None
        
    return user

async def get_user_by_username(db: AsyncSession, username: str):
    """通過用戶名獲取用戶
    
    Args:
        db: 數據庫會話
        username: 用戶名
        
    Returns:
        用戶對象或 None
    """
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    return result.scalars().first()

async def create_user(db: AsyncSession, username: str, password: str):
    """創建用戶
    
    Args:
        db: 數據庫會話
        username: 用戶名
        password: 密碼
        
    Returns:
        創建的用戶對象
    """
    # 檢查用戶是否已存在
    existing_user = await get_user_by_username(db, username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用戶名已存在"
        )
    
    # 創建新用戶
    hashed_password = get_password_hash(password)
    user = User(username=username, password_hash=hashed_password)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user 