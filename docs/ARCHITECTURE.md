# SABIT API 密鑰連接架構

## 架構概述

SABIT 採用前後端分離的架構，使用 FastAPI 作為後端，React 作為前端，SQLite 作為本地數據庫。API 密鑰的管理和使用是系統的核心功能，下面詳細說明其架構設計。

```
┌───────────────┐      ┌───────────────────┐      ┌─────────────────┐      ┌─────────────┐
│               │      │                   │      │                 │      │             │
│  React 前端   │ ──── │  FastAPI 後端     │ ──── │  加密存儲系統   │ ──── │  交易所 API │
│               │      │                   │      │                 │      │             │
└───────────────┘      └───────────────────┘      └─────────────────┘      └─────────────┘
       │                        │                         │
       │                        │                         │
       ▼                        ▼                         ▼
┌───────────────┐      ┌───────────────────┐      ┌─────────────────┐
│               │      │                   │      │                 │
│  用戶界面     │      │  業務邏輯處理     │      │  SQLite 數據庫  │
│  表單驗證     │      │  多核心處理       │      │  加密 API 密鑰  │
│  狀態管理     │      │  非同步操作       │      │  交易記錄      │
│               │      │                   │      │                 │
└───────────────┘      └───────────────────┘      └─────────────────┘
```

## 數據流程

### 1. API 密鑰添加流程

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │     │           │
│  用戶輸入 │ ──► │ 前端驗證  │ ──► │ HTTP 請求 │ ──► │ 後端驗證  │ ──► │ 密鑰加密  │
│  API 密鑰 │     │           │     │           │     │           │     │           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
                                                                              │
                                                                              ▼
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │     │           │
│ 返回成功  │ ◄── │ 前端更新  │ ◄── │ 返回結果  │ ◄── │ 後端響應  │ ◄── │ 存入數據庫 │
│ 提示信息  │     │ 密鑰列表  │     │           │     │           │     │           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
```

### 2. 交易操作流程

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │     │           │
│ 選擇密鑰  │ ──► │ 創建訂單  │ ──► │ HTTP 請求 │ ──► │ 獲取密鑰  │ ──► │ 解密密鑰  │
│ 和交易對  │     │ 參數      │     │           │     │ 從數據庫  │     │           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
                                                                              │
                                                                              ▼
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │     │           │
│ 前端顯示  │ ◄── │ 返回交易  │ ◄── │ 後端響應  │ ◄── │ 處理響應  │ ◄── │ 調用交易所 │
│ 交易結果  │     │ 結果      │     │           │     │           │     │ API       │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
```

## 組件詳解

### 前端 (React)

#### 1. API 密鑰管理組件
- **ExchangeKeyForm.jsx**: 提供添加新 API 密鑰的表單
  - 使用 Zod 進行表單驗證
  - 使用 React Hook Form 管理表單狀態
  - 使用 Axios 發送 HTTP 請求到後端

- **ExchangeKeysPage.jsx**: 顯示和管理已保存的 API 密鑰
  - 使用 React 狀態管理顯示密鑰列表
  - 提供密鑰的啟用/禁用功能
  - 顯示密鑰的測試/正式模式狀態

#### 2. 交易操作組件
- **TradingPage.jsx**: 提供交易操作界面
  - 選擇已保存的 API 密鑰
  - 提供下單表單（市價單/限價單）
  - 提供設置槓桿的功能
  - 顯示當前持倉和未成交訂單

### 後端 (FastAPI)

#### 1. API 路由
- **exchange.py**: 提供 API 端點處理前端請求
  - `/api/exchanges/keys`: 管理 API 密鑰
  - `/api/exchanges/{key_id}/orders`: 處理訂單操作
  - `/api/exchanges/{key_id}/leverage`: 設置槓桿
  - `/api/exchanges/{key_id}/positions`: 獲取持倉信息
  - `/api/exchanges/{key_id}/open-orders`: 獲取未成交訂單

#### 2. 服務層
- **exchange_service.py**: 封裝交易所操作邏輯
  - 管理交易所實例的創建和緩存
  - 處理 API 密鑰的解密和使用
  - 封裝 CCXT 庫的功能，提供統一接口
  - 處理交易所 API 調用的錯誤

#### 3. 加密系統
- **crypto.py**: 提供 API 密鑰的加密和解密功能
  - 使用 PBKDF2 派生加密密鑰
  - 使用 Fernet 對稱加密算法
  - 管理鹽值的生成和存儲

### 數據庫 (SQLite)

#### 1. 模型定義
- **exchange_keys.py**: 定義 API 密鑰的數據模型
  - `id`: 主鍵
  - `exchange_id`: 交易所標識符
  - `name`: 用戶定義的名稱
  - `api_key`: 加密的 API Key
  - `api_secret`: 加密的 API Secret
  - `api_password`: 加密的 API 密碼 (可選)
  - `is_active`: 是否啟用
  - `test_mode`: 是否為測試模式
  - `created_at`: 創建時間
  - `updated_at`: 更新時間

#### 2. 數據庫操作
- **database.py**: 提供數據庫連接和會話管理
  - 使用 SQLAlchemy 作為 ORM
  - 使用非同步 SQLite 連接
  - 提供數據庫初始化功能

## 安全性設計

### 1. 密鑰加密存儲
- API 密鑰在前端輸入後，通過 HTTPS 傳輸到後端
- 後端使用主密碼派生的密鑰進行加密
- 加密後的密鑰存儲在本地 SQLite 數據庫中
- 主密碼可通過環境變量設置，不存儲在代碼中

### 2. 密鑰使用流程
- 需要使用 API 密鑰時，從數據庫獲取加密的密鑰
- 使用主密碼派生的密鑰進行解密
- 解密後的密鑰僅在內存中使用，不再持久化
- 使用後及時從內存中清除敏感信息

### 3. 前端安全措施
- API 密鑰輸入框使用密碼類型，避免明文顯示
- 前端不存儲或緩存任何 API 密鑰信息
- 使用表單驗證確保數據完整性
- 使用 HTTPS 確保傳輸安全

## 多核心與非同步處理

### 1. 非同步處理
- 使用 FastAPI 的非同步功能處理 HTTP 請求
- 使用 CCXT 的異步支持進行交易所 API 調用
- 使用非同步 SQLite 連接進行數據庫操作
- 前端使用 React 的非同步數據獲取

### 2. 多核心處理
- 使用 ProcessPoolExecutor 處理計算密集型任務
- 在非同步環境中使用 run_in_executor 執行阻塞操作
- 適當控制處理程序數量，避免資源過度分配

## 擴展性設計

### 1. 交易所適配
- 通過 CCXT 庫支持 100+ 交易所
- 統一的交易所操作接口
- 交易所特定功能通過參數傳遞

### 2. 模塊化設計
- 前端組件可重用
- 後端服務層與路由層分離
- 數據庫操作與業務邏輯分離

### 3. 可擴展功能
- 支持添加新的交易策略
- 支持添加市場數據分析功能
- 支持添加資產管理功能

## 結論

SABIT 的 API 密鑰連接架構採用了前後端分離、多層次安全保障、非同步與多核心處理等現代技術，確保了系統的安全性、高效性和可擴展性。通過加密存儲 API 密鑰並在本地處理所有交易操作，系統提供了一個安全可靠的加密貨幣自動化交易環境。 