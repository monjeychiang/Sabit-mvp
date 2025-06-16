from fastapi import APIRouter

from app.api.endpoints import health, processing, exchange

api_router = APIRouter()

# 加入各個端點模組
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(processing.router, prefix="/processing", tags=["processing"])
api_router.include_router(exchange.router, prefix="/exchange", tags=["exchange"])

# 在此處可以繼續添加其他 API 路由模組
# 例如:
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(items.router, prefix="/items", tags=["items"]) 