from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from database import get_db
from services.auth_service import authenticate_user, create_user, get_user_by_username

router = APIRouter()

# 定義響應模型
class UserResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    
    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

# 簡單的會話令牌生成（非 JWT）
def create_session_token(user_id: int) -> str:
    """生成簡單的會話令牌"""
    import hashlib
    import time
    token = hashlib.sha256(f"{user_id}:{time.time()}:sabit-local-token".encode()).hexdigest()
    return token

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """用戶登入"""
    user = await authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用戶名或密碼不正確",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 生成令牌
    access_token = create_session_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """用戶註冊"""
    # 檢查密碼長度
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密碼至少需要6個字符"
        )
    
    # 創建用戶
    user = await create_user(db, request.username, request.password)
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str, db: AsyncSession = Depends(get_db)):
    """獲取當前用戶信息（簡化版，僅用於示範）"""
    # 這裡我們簡化了驗證流程，實際應用中應該解析令牌獲取用戶ID
    # 並進行更完善的驗證
    
    # 在這個簡化版本中，我們直接返回第一個用戶
    # 實際應用中，應該解析令牌獲取用戶ID，然後從數據庫獲取用戶
    from sqlalchemy.future import select
    from models.user import User
    
    query = select(User).limit(1)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到用戶"
        )
        
    return user 