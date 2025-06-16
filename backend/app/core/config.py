from typing import List
from pydantic_settings import BaseSettings
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    應用程式設定類別，使用 pydantic 管理環境變數與設定
    
    用法範例:
    ```python
    from app.core.config import settings
    
    app_name = settings.PROJECT_NAME
    ```
    """
    PROJECT_NAME: str = "FastAPI-React-App"
    API_V1_STR: str = "/api/v1"
    
    # CORS 設定
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # 資料庫設定
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/app.db"
    
    # 安全設定
    SECRET_KEY: str = "your-secret-key-for-local-development-only"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 天
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings() 