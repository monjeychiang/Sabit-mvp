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

### 使用啟動腳本
提供了方便的啟動腳本，會自動啟動前端和後端服務：

#### Windows
```bash
# PowerShell
.\start.ps1
```

#### Linux/macOS
```bash
# Bash
chmod +x start.sh
./start.sh
```

### 手動啟動
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

## 時間同步機制

系統實現了自動時間同步機制，以確保交易所API請求的時間戳準確：

### 同步來源
- Google 服務器時間
- Binance 服務器時間

### 同步時機
1. **系統啟動時**: 應用啟動時自動同步時間
2. **週期性同步**: 每小時自動重新同步一次
3. **手動同步**: 通過API手動觸發同步

### 時間同步端點
- `GET /system/time`: 獲取當前時間同步狀態
- `POST /system/time/sync`: 手動觸發時間同步

### 時間使用方式
- 交易所API請求自動使用同步後的時間戳
- Binance等對時間要求嚴格的交易所會設置時間偏移

## 交易所連線預熱機制

系統實現了交易所連線預熱機制，以提高使用者體驗和減少首次操作延遲：

### 預熱時機
1. **新增 API 密鑰後**：當用戶新增交易所 API 密鑰後，系統會自動預熱該交易所連線
2. **用戶登入後**：用戶登入系統後，系統會在背景預熱所有已配置的交易所連線
3. **手動預熱**：用戶可通過 API 手動觸發預熱操作

### 預熱端點
- `POST /api/exchange/{key_id}/preheat`：預熱指定交易所連線
- `POST /api/exchange/preheat-all`：預熱所有交易所連線

### 預熱流程
1. 系統從數據庫獲取交易所 API 密鑰
2. 創建交易所實例並初始化連線
3. 執行輕量級操作（`load_markets`）測試連線
4. 將成功建立的連線緩存，以供後續操作使用

### 效能優化
- 使用 `asyncio.gather` 並行處理多個交易所預熱任務
- 登入後的預熱操作在背景執行，不阻塞用戶操作
- 預熱失敗時會自動清理資源，避免記憶體洩漏

## 開發規範
1. 所有新端點應該放在 `app/api/endpoints/` 下適當的模組中
2. 使用 Pydantic 模型驗證請求與回應
3. 所有函數和類別應加上適當的註解
4. 遵循 PEP 8 代碼風格
5. 資料庫操作應使用異步 SQLAlchemy 函數 