# FastAPI 後端應用

## 概述
此後端應用使用 FastAPI 框架開發，提供 REST API 服務。資料存儲使用本地 SQLite 資料庫，適合個人或小型團隊使用。

## 目錄結構
```
backend/
├── app/
│   ├── api/              # API 相關模組
│   │   ├── endpoints/    # API 端點
│   │   └── api.py        # API 路由集合
│   ├── core/             # 核心配置
│   ├── db/               # 資料庫相關
│   │   ├── base.py       # 模型基礎匯入
│   │   ├── base_class.py # SQLAlchemy 基礎類別
│   │   └── session.py    # 資料庫連接會話
│   ├── models/           # 資料庫模型
│   └── schemas/          # Pydantic 資料模型
├── main.py               # 應用入口點
└── requirements.txt      # 相依套件清單
```

## 環境設置

### 安裝相依套件
```bash
pip install -r requirements.txt
```

### 環境變數
可在項目根目錄創建 `.env` 文件設置環境變數：
```
PROJECT_NAME=我的專案名稱
```

## 資料庫
本應用使用 SQLite 作為資料庫，適合本地開發與小型應用。資料庫文件預設位於 `app.db`。

### 資料庫遷移
使用 Alembic 進行資料庫遷移：
```bash
# 初始化 Alembic (僅首次需要)
alembic init migrations

# 創建新的遷移腳本
alembic revision --autogenerate -m "描述變更"

# 應用遷移
alembic upgrade head
```

## 執行應用
```bash
# 開發模式
uvicorn main:app --reload

# 生產模式
uvicorn main:app
```

## API 文件
啟動應用後，可透過以下 URL 訪問 API 文件：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 開發規範
1. 所有新端點應該放在 `app/api/endpoints/` 下適當的模組中
2. 使用 Pydantic 模型驗證請求與回應
3. 所有函數和類別應加上適當的註解
4. 遵循 PEP 8 代碼風格
5. 資料庫操作應使用異步 SQLAlchemy 函數 