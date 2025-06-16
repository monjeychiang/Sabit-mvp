# 專案變更紀錄

## [0.4.0] - 2025-06-17
### 架構優化
- 統一化 API 路由結構，提高代碼一致性和可維護性
- 重構 API 端點命名規則，統一使用 `/api/*` 前綴

### 後端
- 將 `routers/exchange.py` 移動到 `app/api/endpoints/exchange.py`
- 在 `app/api/api.py` 中統一註冊 exchange 路由
- 移除 `main.py` 中對 `exchange_router` 的直接引用
- 將 API 路徑從 `/exchanges/*` 標準化為 `/api/exchange/*`
- 刪除原有的 `routers/exchange.py` 文件
- 更新 `routers/__init__.py`，移除對舊路由的引用

### 前端
- 更新所有前端 API 請求路徑，從 `/api/exchanges/*` 改為 `/api/exchange/*`
- 修正 TradingPage、ExchangeKeysPage 和 ExchangeKeyForm 中的 API 請求

### 文檔
- 更新 API 路徑文檔
- 添加架構變更說明

## [0.3.0] - 2025-06-17
### 新增功能
- 添加基於 Python multiprocessing 的多核心處理模組
- 實現並行任務處理功能，充分利用多核心 CPU

### 後端
- 創建 TaskManager 類，封裝多核心處理邏輯
- 添加處理批次數據的 API 端點
- 添加系統資訊 API 端點，用於獲取 CPU 和記憶體資訊

### 前端
- 添加多核心處理測試頁面
- 實現系統資訊顯示功能
- 添加並行處理測試功能，可配置處理項目數量和處理因子

## [0.2.0] - 2025-06-17
### 新增功能
- 添加本地 SQLite 資料庫支援
- 整合 Shadcn UI 組件庫至前端

### 後端
- 添加 SQLAlchemy ORM 與 SQLite 資料庫連接設定
- 建立資料庫模型基礎架構
- 添加異步資料庫會話管理

### 前端
- 整合 Tailwind CSS 與 Shadcn UI 組件
- 配置 PostCSS 與 Tailwind
- 更新全局樣式以支援 Shadcn UI 主題

### 文檔
- 更新專案說明，明確標示為本地應用
- 添加 SQLite 與 Shadcn UI 相關文檔

## [0.1.0] - 2025-06-17
### 初始化項目
- 建立基本專案架構，區分前後端開發環境
- 設置 FastAPI 後端框架基礎結構
- 設置 React 前端基礎結構

### 後端
- 創建基礎 FastAPI 應用
- 設定 CORS 以支援前後端分離開發
- 建立基本目錄結構與 API 路由

### 前端
- 使用 Vite 建立 React 應用
- 配置基本路由系統
- 建立基礎元件結構

### 其他
- 建立項目文件與開發指南
- 設定基本的依賴管理系統 