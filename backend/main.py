from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import init_db
from app.api.api import api_router
import os

# 創建 FastAPI 應用
app = FastAPI(
    title="SABIT-LOCAL API",
    description="本地加密貨幣自動化交易工具 API",
    version="0.1.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 前端開發服務器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(api_router, prefix="/api")

# 啟動事件
@app.on_event("startup")
async def startup_event():
    """應用啟動時初始化數據庫"""
    await init_db()
    print("數據庫初始化完成")

# 根路由
@app.get("/")
async def root():
    """API 根路由"""
    return {
        "message": "歡迎使用 SABIT-LOCAL API",
        "docs_url": "/docs",
        "version": "0.1.0"
    }

# 主程序入口
if __name__ == "__main__":
    # 設置主密碼環境變數（僅用於開發）
    if not os.environ.get("SABIT_MASTER_PASSWORD"):
        os.environ["SABIT_MASTER_PASSWORD"] = "development_master_password"
        print("警告: 使用開發環境主密碼，生產環境請設置 SABIT_MASTER_PASSWORD 環境變數")
    
    # 啟動 Uvicorn 服務器
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 