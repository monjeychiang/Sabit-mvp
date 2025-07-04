# 變更紀錄

## 2023-11-17: 移除多核心處理功能，簡化用戶初始化流程

### 變更概述
移除多核心處理相關功能模組與前端頁面，並簡化資料庫初始化流程，僅保留創建單一管理員用戶的功能。

### 技術實現
1. 後端變更：
   - 移除 `app/api/endpoints/processing.py`，刪除多核心處理相關 API 端點
   - 移除 `app/core/worker.py`，刪除多核心任務管理器模組
   - 修改 `app/api/api.py`，移除對 processing 路由的引用
   - 修改 `app/utils/initialize_db.py`，僅保留創建管理員用戶功能

2. 前端變更：
   - 刪除 `src/pages/MultiProcessingTest.jsx` 與 `MultiProcessingTest.css` 文件
   - 從 `App.jsx` 中移除相關路由配置
   - 從導航菜單（主菜單、移動版菜單、操作菜單）中移除多核心處理選項
   - 從儀表板頁面中移除多核心處理的鏈接

### 檔案變更
- 刪除 `backend/app/api/endpoints/processing.py`
- 刪除 `backend/app/core/worker.py`
- 修改 `backend/app/api/api.py`
- 修改 `backend/app/utils/initialize_db.py`
- 刪除 `frontend/src/pages/MultiProcessingTest.jsx`
- 刪除 `frontend/src/pages/MultiProcessingTest.css`
- 修改 `frontend/src/App.jsx`
- 修改 `frontend/src/components/operations-menu.jsx`
- 修改 `frontend/src/components/mobile-navigation.jsx`
- 修改 `frontend/src/components/main-navigation.jsx`
- 修改 `frontend/src/pages/DashboardPage.jsx`

### 效能影響
- 減小應用程序體積，降低系統複雜性
- 移除不必要的依賴和功能，提高應用整體效能
- 簡化資料庫初始化流程，加快啟動速度

### 維護性改進
- 減少不必要的代碼和功能，使系統更易於維護
- 簡化用戶管理，僅保留管理員用戶
- 降低整體系統複雜度，聚焦於核心功能

## 2023-11-16: 移除未使用的資料庫模組檔案，提升程式碼整潔度

### 變更概述
移除未被使用且功能重複的資料庫會話管理檔案 `app/db/session.py`，降低程式碼冗餘度並減少維護成本。

### 技術實現
1. 分析資料庫模組架構：
   - 識別出兩個功能重複的檔案 `database.py` 與 `session.py`
   - 確認專案中僅有 `database.py` 被實際引用與使用
   - 移除未被引用的 `session.py` 檔案

### 檔案變更
- 刪除 `app/db/session.py` 檔案

### 效能影響
- 無直接效能影響
- 減少程式碼冗餘，降低維護成本
- 避免未來開發人員在選擇使用哪個資料庫會話管理模組時的混淆

### 維護性改進
- 消除資料庫連線管理的重複實現
- 簡化程式碼架構，提高可讀性
- 避免未來因重複功能導致的不一致性問題

## 2023-11-15: 修復前後端連接問題並優化錯誤處理

### 變更概述
解決前後端連接問題，修復 `/api/health` 請求拒絕錯誤，並優化錯誤處理機制，確保系統穩定性。

### 技術實現
1. 前端 Vite 代理配置優化：
   - 增強代理配置，添加錯誤處理機制
   - 優化連接失敗的友好錯誤提示
   - 提升系統在後端未啟動時的穩定性

2. 後端 API 路由優化：
   - 在根層級直接添加 `/api/health` 路由，解決尾部斜線問題
   - 增強 CORS 配置，支持更多 HTTP 方法
   - 添加日誌以便更好追蹤請求流程

3. Node.js 棄用警告處理：
   - 修改前端啟動腳本，抑制 `util._extend` 棄用警告
   - 使用 `--no-deprecation` 標誌確保開發時的良好體驗

### 檔案變更
- 修改 `frontend/vite.config.js`: 優化代理配置和錯誤處理
- 修改 `frontend/package.json`: 更新開發腳本，抑制棄用警告
- 修改 `backend/main.py`: 增強 CORS 配置，添加根層級健康檢查路由

### 效能影響
- 提高前後端連接的穩定性
- 減少因路由不匹配導致的請求失敗
- 改善開發環境的使用者體驗

### 維護性改進
- 更詳細的日誌記錄，便於問題診斷
- 更友好的錯誤提示，便於開發調試
- 符合 FastAPI 和 Vite 的最佳實踐

## 2023-11-14: 重構資料庫和模型結構，符合 FastAPI 最佳實踐

### 變更概述
重構了專案的資料庫和模型結構，將模型從根目錄的 `models/` 移至 `app/db/models/` 目錄，使其符合 FastAPI 的最佳實踐結構。

### 技術實現
1. 資料庫結構調整：
   - 將 `database.py` 從根目錄移至 `app/db/database.py`
   - 將 `models/` 目錄下的模型移至 `app/db/models/`
   - 刪除不再需要的 `app/models/` 目錄

2. 導入路徑更新：
   - 更新所有相關文件中的導入路徑，使用新的模型位置
   - 統一使用 `app.db.models` 命名空間導入模型
   - 統一使用 `app.db.database` 導入資料庫功能

3. 模型整合：
   - 確保所有模型都使用 `app.db.base_class.Base` 作為基類
   - 更新 `app.db.base.py` 文件，導入所有模型以便 Alembic 遷移

### 檔案變更
- 新增 `app/db/models/` 目錄，包含所有數據模型
- 新增 `app/db/database.py`，整合原有 `database.py` 功能
- 更新 `main.py`、`services/auth_service.py`、`services/api_key_manager.py` 等文件的導入路徑
- 更新 `app/api/endpoints/exchange.py` 和 `app/api/endpoints/auth.py` 的導入路徑
- 刪除舊的 `models/` 目錄和 `database.py` 文件

### 效能影響
- 無直接效能影響，但提高了代碼結構的一致性
- 使專案結構更符合 FastAPI 的最佳實踐，便於後續擴展

### 維護性改進
- 更清晰的模組化結構，使代碼更易於維護
- 統一的導入路徑，減少混淆
- 符合 FastAPI 的標準專案結構，便於新開發者理解

## 2023-11-13: 優化時間同步機制，支持台北時區和優先服務

### 變更概述
優化了時間同步機制，添加了對台北時區(UTC+8)的支持，並實現了時間服務優先級機制，優先使用Google時間，當Google時間不可用時自動切換到Binance時間。

### 技術實現
1. 時區處理優化：
   - 添加了對台北時區(UTC+8)的支持
   - 調整Google返回的UTC時間為台北本地時間
   - 所有時間顯示均包含時區信息

2. 時間服務優先級機制：
   - 設置Google為默認優先時間服務
   - 當優先服務不可用時自動切換到備用服務
   - 提供清晰的服務選擇日誌和API響應

3. 用戶界面改進：
   - 在啟動日誌中顯示優先使用的時間服務
   - 時間同步API返回更詳細的時間信息
   - 增強了時間同步狀態的可讀性

### 檔案變更
- 修改 `utils/time_sync.py`: 添加時區支持和優先服務機制
- 修改 `main.py`: 更新時間同步顯示格式
- 修改 `services/exchange_service.py`: 使用優先時間服務
- 更新 `requirements.txt`: 添加pytz依賴

### 效能影響
- 提高時間同步的可靠性
- 減少因時間服務不可用導致的失敗
- 確保時間戳與台北時區一致

### 安全考量
- 增強交易API請求的時間戳準確性
- 提供更穩定的時間同步機制
- 優先使用可靠的時間源

## 2023-11-12: 實現自動時間同步機制

### 變更概述
新增時間同步功能，在系統啟動時自動與Google和Binance服務器同步時間，確保交易API請求時間戳準確，避免請求被交易所拒絕。

### 技術實現
1. 新增 `time_sync.py` 模組，包含時間同步功能：
   - 從Google和Binance服務器獲取標準時間
   - 計算本地時間與服務器時間的偏移量
   - 提供調整後的時間給API請求使用

2. 在系統啟動時自動同步：
   - 在FastAPI應用啟動時執行時間同步
   - 記錄時間偏移信息到日誌
   - 提供時間同步狀態API端點

3. 啟動腳本：
   - 新增Windows PowerShell和Linux/macOS啟動腳本
   - 腳本會依序啟動後端和前端服務
   - 提供友好的控制台輸出

### 檔案變更
- 新增 `utils/time_sync.py`: 實現時間同步核心功能
- 修改 `main.py`: 在啟動時調用時間同步，並添加時間API端點
- 更新 `requirements.txt`: 添加aiohttp依賴
- 新增 `start.ps1`和`start.sh`: 啟動腳本

### 效能影響
- 增強交易所API請求的可靠性
- 避免因時間不同步導致的請求失敗
- 改善系統整體穩定性

### 安全考量
- 保證交易API請求的時間戳準確性
- 提高系統與交易所交互的穩定性

## 2023-11-05: 實現交易所連線預熱機制

### 變更概述
新增交易所連線預熱機制，以提高系統效能與使用者體驗。預熱機制在用戶新增 API 密鑰或登入系統後自動啟動，並提供手動觸發預熱的 API 端點。

### 技術實現
1. 在 `ExchangeService` 類中新增預熱相關方法：
   - `preheat_exchange`: 預熱單一交易所連線
   - `preheat_all_exchanges`: 預熱所有交易所連線

2. 在三個關鍵時機觸發預熱：
   - 新增 API 密鑰後立即預熱該連線
   - 用戶登入後在背景預熱所有連線
   - 提供手動預熱 API 端點

3. 優化預熱流程：
   - 使用 `asyncio.gather` 並行處理多個預熱任務
   - 實現連線緩存機制
   - 預熱失敗時自動清理資源

### 檔案變更
- `services/exchange_service.py`: 新增預熱相關方法
- `app/api/endpoints/exchange.py`: 修改 API 密鑰創建邏輯，新增預熱端點
- `app/api/endpoints/auth.py`: 修改登入邏輯，加入背景預熱任務
- `backend/README.md`: 更新文檔，說明預熱機制

### 效能影響
- 減少首次操作交易所時的延遲
- 提高交易操作的響應速度
- 背景預熱不影響用戶正常操作

### 安全考量
- 預熱過程中的錯誤不會影響系統主要功能
- 連線失敗時自動清理資源，避免記憶體洩漏
- 保持原有的 API 密鑰加密機制

## 2023-11-06: 新增 API 密鑰管理功能

### 變更概述
擴展 API 密鑰管理功能，新增刪除、禁用/啟用等操作，提供更完整的密鑰生命週期管理。

### 技術實現
1. 新增 API 密鑰管理端點：
   - 更新密鑰信息 (`PUT /api/exchange/keys/{key_id}`)
   - 刪除密鑰 (`DELETE /api/exchange/keys/{key_id}`)
   - 切換密鑰啟用狀態 (`POST /api/exchange/keys/{key_id}/toggle`)

2. 密鑰管理流程優化：
   - 密鑰刪除時自動關閉並清理相關連線
   - 密鑰啟用時自動預熱連線
   - 提供彈性的密鑰信息更新機制

### 檔案變更
- `app/api/endpoints/exchange.py`: 新增密鑰管理相關端點

### 效能影響
- 優化資源管理，刪除或禁用密鑰時釋放相關資源
- 啟用密鑰時自動預熱，提高後續操作的響應速度

### 安全考量
- 刪除密鑰時確保相關連線正確關閉
- 維持密鑰敏感信息的加密存儲

## 2023-11-07: 前端實現 API 密鑰管理選單

### 變更概述
在前端實現 API 密鑰管理的下拉選單功能，提供用戶友好的界面進行密鑰管理操作，包括啟用/禁用、預熱連線和刪除密鑰等功能。

### 技術實現
1. 擴展 ExchangeKeysPage 組件：
   - 添加下拉選單 (DropdownMenu) 提供密鑰操作選項
   - 實現密鑰啟用/禁用切換功能
   - 添加密鑰刪除功能，並提供確認對話框
   - 實現單個密鑰和批量預熱連線功能

2. 使用 Shadcn UI 組件：
   - 使用 shadcn CLI 工具添加所需組件
   - 添加 AlertDialog 組件用於刪除確認
   - 添加 DropdownMenu 組件用於操作選單
   - 使用 Lucide 圖標增強視覺效果

### 檔案變更
- `frontend/src/pages/ExchangeKeysPage.jsx`: 擴展密鑰管理功能
- `frontend/src/components/ui/alert-dialog.jsx`: 添加確認對話框組件
- `frontend/src/components/ui/dropdown-menu.jsx`: 添加下拉選單組件

### 用戶體驗改進
- 提供直觀的密鑰管理界面
- 操作前確認機制，避免誤操作
- 加載狀態反饋，提高用戶交互體驗
- 統一的錯誤處理和成功提示
- 使用 Shadcn UI 組件保持界面一致性

## 2023-11-08: 修復 API 密鑰禁用後在界面消失的問題

### 變更概述
修復了一個 bug，該 bug 導致 API 密鑰在被禁用後從界面中消失，而不是顯示為禁用狀態。

### 技術實現
1. 修改 ExchangeService 中的 get_exchange_keys 方法：
   - 移除了 `ExchangeKey.is_active == True` 過濾條件
   - 確保返回所有密鑰，無論其啟用狀態如何

### 檔案變更
- `services/exchange_service.py`: 修改 get_exchange_keys 方法

### 用戶體驗改進
- 禁用的 API 密鑰現在會在界面中顯示為「停用」狀態，而不是完全消失
- 用戶可以更清楚地看到所有密鑰的狀態，並可以輕鬆地重新啟用已禁用的密鑰

## 2023-11-09: 修復交易所連線資源洩漏問題

### 變更概述
修復了交易所連線資源洩漏問題，該問題導致 client session 和 connector 沒有被正確關閉，造成警告和潛在的記憶體洩漏。

### 技術實現
1. 改進資源管理機制：
   - 在所有建立 ExchangeService 實例的地方添加 finally 區塊確保資源釋放
   - 增強 close_all_exchanges 方法的錯誤處理能力
   - 改進 preheat_exchange 方法中的資源清理邏輯

2. 主要修改點：
   - 在 toggle_exchange_key_status、create_exchange_key 和 update_exchange_key 端點中添加資源清理
   - 增強 close_all_exchanges 方法，使其能夠處理關閉連線時的異常
   - 改進 preheat_exchange 方法中的錯誤處理和資源清理

### 檔案變更
- `app/api/endpoints/exchange.py`: 修改多個端點以確保資源釋放
- `services/exchange_service.py`: 增強資源管理和錯誤處理

### 效能影響
- 減少記憶體洩漏和資源佔用
- 提高系統長時間運行的穩定性
- 消除相關警告和錯誤日誌

### 安全考量
- 確保敏感的 API 連線資源被及時釋放
- 提高系統整體穩定性和安全性

## 2023-11-10: 實現交易所持久連線機制

### 變更概述
重新設計並實現了交易所連線機制，從「按需連線」模式改為「持久連線」模式，以提高系統響應速度和效率。新機制保留了預熱功能，但避免了每次操作都重新建立連線的開銷。

### 技術實現
1. 設計持久連線架構：
   - 使用類級別變數實現跨實例共享的連線池
   - 實現連線鎖機制，避免競態條件
   - 添加連線生命週期管理（TTL、閒置清理）
   - 保留與現有代碼的兼容性

2. 主要功能增強：
   - 實現連線共享機制，避免重複創建
   - 添加連線閒置清理功能，優化資源使用
   - 提供連線狀態管理 API
   - 在應用關閉時自動清理所有連線

3. 改進預熱機制：
   - 預熱操作現在創建持久連線而非臨時連線
   - 使用背景任務處理預熱，避免阻塞用戶操作
   - 智能處理密鑰啟用/禁用狀態變更

### 檔案變更
- `services/exchange_service.py`: 重新設計為持久連線架構
- `app/api/endpoints/exchange.py`: 更新端點以使用持久連線
- `app/api/endpoints/auth.py`: 修改登入預熱機制

### 效能影響
- 顯著減少操作延遲，尤其是頻繁交易操作
- 降低交易所 API 請求頻率，減少觸發限流風險
- 優化資源使用，閒置連線自動清理
- 系統啟動和用戶登入後預熱連線，確保首次操作快速響應

### 安全考量
- 實現連線閒置超時機制，避免長時間保持不必要的連線
- 應用關閉時確保所有連線正確關閉
- 密鑰禁用時立即關閉相關連線

## [0.6.3] - 2025-07-29
### 架構重構
- 將所有 API 密鑰相關操作（取得、新增、修改、刪除、解密）獨立為 `ApiKeyManager` 管理器，集中管理密鑰存取與加密解密邏輯。
- `ExchangeService` 移除所有直接存取資料庫的密鑰操作，統一透過 `ApiKeyManager` 取得密鑰資料。
- `app/api/endpoints/exchange.py` 所有密鑰相關 API 路由皆改為呼叫 `ApiKeyManager`，不再直接操作資料庫。
- 提升模組化、可維護性與日後擴充彈性，符合單一職責原則。

### 技術細節
- `ApiKeyManager` 封裝所有 SQLAlchemy 操作與 CryptoManager 加解密流程。
- 交易所連線建立、預熱、關閉等流程皆改為依賴 `ApiKeyManager` 提供的密鑰資料。
- 所有密鑰狀態切換、刪除、查詢等操作皆集中於管理器，減少重複程式碼。
- 完整中文註解，並保留原有 API 行為與回傳格式。

## 2024-05-XX - 日誌等級支援

### 新增功能
- 新增 `.env` 支援，可通過環境變數配置日誌等級、資料庫連線等參數
- 所有 `print` 語句已改為使用 `logging` 模組，支援日誌等級控制
- 前端也可通過 `.env` 中的 `VITE_LOG_LEVEL` 控制日誌輸出等級
- 所有重要參數皆可由環境變數設定，提高系統靈活性

### 技術改進
- 使用 `python-dotenv` 載入環境變數
- 統一日誌格式，包含時間戳與日誌等級
- 前端 API base url 改為從環境變數讀取，便於多環境部署 