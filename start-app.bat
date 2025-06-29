@echo off
setlocal enabledelayedexpansion

:: 設定命令提示字元使用 UTF-8 編碼
chcp 65001 > nul
:: 移除顏色設定，使用系統預設顏色
cls

echo.
echo.
echo  .d8888b.         d8888 888888b.   8888888 88888888888 
echo d88P  Y88b       d88888 888  "88b    888       888     
echo Y88b.           d88P888 888  .88P    888       888     
echo  "Y888b.       d88P 888 8888888K.    888       888     
echo     "Y88b.    d88P  888 888  "Y88b   888       888     
echo       "888   d88P   888 888    888   888       888     
echo Y88b  d88P  d8888888888 888   d88P   888       888     
echo  "Y8888P"  d88P     888 8888888P"  8888888     888     
echo.
echo ========================================================
echo    FastAPI + React 本地多核心應用系統 - 啟動工具
echo ========================================================
echo.

:: 設置工作目錄
set "WORKSPACE=%~dp0"
cd /d "%WORKSPACE%"

:: 顯示系統資訊
echo  [系統資訊]
echo  --------------------------------------------------------
echo  日期時間: %date% %time%
echo  --------------------------------------------------------
wmic cpu get name | findstr /v "Name"
echo  --------------------------------------------------------
echo  記憶體: 
wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value | findstr "="
echo  --------------------------------------------------------
echo.

:: 檢查必要的依賴
echo  [檢查依賴]
echo  --------------------------------------------------------
echo  檢查 Python...
python --version 2>nul || (
    echo  錯誤: Python 未安裝或不在 PATH 中
    goto :error
)

echo  檢查 Node.js...
node --version 2>nul || (
    echo  錯誤: Node.js 未安裝或不在 PATH 中
    goto :error
)
echo  --------------------------------------------------------
echo.

:: 確認目錄存在
if not exist "backend" (
    echo  錯誤: 找不到 backend 目錄
    goto :error
)

if not exist "frontend" (
    echo  錯誤: 找不到 frontend 目錄
    goto :error
)

:: 啟動後端
echo  [啟動後端] FastAPI 服務...
echo  --------------------------------------------------------
start cmd /c "chcp 65001 > nul && title SABIT 後端服務 && cd /d "%WORKSPACE%backend" && echo 正在啟動後端服務... && python -m uvicorn main:app --reload --port 8000"

:: 等待後端啟動
echo  等待後端啟動中...
echo  [####################] 處理中...
timeout /t 5 /nobreak > nul
echo  後端啟動完成！
echo.

:: 啟動前端
echo  [啟動前端] React 應用...
echo  --------------------------------------------------------
start cmd /c "chcp 65001 > nul && title SABIT 前端應用 && cd /d "%WORKSPACE%frontend" && echo 正在啟動前端應用... && npm run dev"

:: 等待前端啟動
echo  等待前端啟動中...
echo  [####################] 處理中...
timeout /t 8 /nobreak > nul
echo  前端啟動完成！
echo.

:: 打開瀏覽器
echo  [打開瀏覽器] 訪問應用...
echo  --------------------------------------------------------
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
echo  ✓✓✓ 應用已成功啟動！ ✓✓✓
echo  --------------------------------------------------------
echo  後端 API: http://localhost:8000/docs
echo  前端頁面: http://localhost:5173
echo  多核心處理測試頁面: http://localhost:5173/multiprocessing
echo  --------------------------------------------------------
echo.
echo  提示: 關閉此窗口不會停止應用，需要手動關閉前後端命令視窗
echo.
echo  按任意鍵退出此啟動器
pause > nul
exit /b 0

:error
echo.
echo  啟動失敗，請檢查錯誤信息
echo.
pause
exit /b 1 