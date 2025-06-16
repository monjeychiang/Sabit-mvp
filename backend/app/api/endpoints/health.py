from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """
    健康檢查端點
    
    此端點提供一種方式來確認 API 服務是否正常運行
    
    返回:
        dict: 包含服務狀態資訊的字典
    """
    return {
        "status": "healthy",
        "service": "fastapi-backend",
        "version": "0.1.0"
    } 