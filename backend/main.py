from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.db.database import init_db
from app.api.api import api_router
import os
from app.utils.initialize_db import initialize_database
from app.utils.time_sync import sync_time_on_startup, time_sync
import datetime
import pytz
import logging
from dotenv import load_dotenv

# 載入 .env 檔案
load_dotenv()

# 設定日誌等級（由 LOG_LEVEL 環境變數控制，預設為 INFO）
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=log_level, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# 創建 FastAPI 應用
app = FastAPI(
    title="SABIT API",
    description="本地加密貨幣自動化交易工具 API",
    version="0.1.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),  # 從環境變數讀取，支援多個來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(api_router, prefix="/api")

# 啟動事件
@app.on_event("startup")
async def startup_event():
    """應用啟動時初始化數據庫和用戶，並同步時間"""
    # 同步時間
    logger.info("正在同步時間...")
    sync_result = await sync_time_on_startup()
    logger.info(f"時間同步完成 - Google偏移: {sync_result['google_offset']:.3f}秒, Binance偏移: {sync_result['binance_offset']:.3f}秒")
    logger.info(f"優先使用的時間服務: {sync_result['preferred_service']}")
    
    # 初始化數據庫
    await initialize_database()
    logger.info("數據庫和用戶初始化完成")

# 定義時間同步端點
@app.get("/system/time")
async def get_system_time():
    """獲取系統時間同步信息"""
    time_info = time_sync.get_time_info()
    # 格式化時間，使其更易於閱讀
    formatted_info = {
        'offsets': {
            k: f"{v:.3f}秒" for k, v in time_info['offsets'].items()
        },
        'preferred_service': time_info['preferred_service'],
        'last_sync': {
            k: f"{datetime.datetime.fromtimestamp(v, pytz.timezone('Asia/Taipei')).strftime('%Y-%m-%d %H:%M:%S')}" 
            for k, v in time_info['last_sync'].items()
        },
        'local_time': time_info['local_time_taipei'],
        'adjusted_times': time_info['adjusted_times_taipei'],
        'preferred_adjusted_time': time_info['preferred_adjusted_time_taipei']
    }
    return formatted_info

@app.post("/system/time/sync")
async def sync_system_time():
    """手動同步系統時間"""
    result = await time_sync.sync_time()
    return {
        'success': True,
        'google_offset': f"{result['google_offset']:.3f}秒",
        'binance_offset': f"{result['binance_offset']:.3f}秒",
        'preferred_service': result['preferred_service'],
        'message': result['message']
    }

# 根路由
@app.get("/")
async def root():
    """API 根路由"""
    return {
        "message": "歡迎使用 SABIT API",
        "docs_url": "/docs",
        "version": "0.1.0"
    }

# 主程序入口
if __name__ == "__main__":
    # 設置主密碼環境變數（僅用於開發）
    if not os.environ.get("SABIT_MASTER_PASSWORD"):
        os.environ["SABIT_MASTER_PASSWORD"] = "development_master_password"
        logger.warning("警告: 使用開發環境主密碼，生產環境請設置 SABIT_MASTER_PASSWORD 環境變數")
    
    # 從環境變數讀取 API 伺服器設定
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    reload_enabled = os.environ.get("API_RELOAD", "true").lower() == "true"
    
    # 啟動 Uvicorn 服務器
    uvicorn.run("main:app", host=host, port=port, reload=reload_enabled)