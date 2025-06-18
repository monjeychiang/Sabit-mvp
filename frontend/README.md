# React 前端應用

## 概述
此前端應用使用 React 框架開發，通過 API 與 FastAPI 後端服務進行通信。使用 Shadcn UI 組件庫提供美觀且一致的使用者介面。

## 目錄結構
```
frontend/
├── public/            # 靜態資源
├── src/               # 源代碼
│   ├── assets/        # 圖片、字體等資源
│   ├── components/    # 可重用元件
│   │   └── ui/        # Shadcn UI 組件
│   ├── pages/         # 頁面元件
│   ├── App.jsx        # 主應用元件
│   └── main.jsx       # 應用入口點
├── index.html         # HTML 模板
├── package.json       # 相依套件與腳本
├── tailwind.config.js # Tailwind CSS 配置
├── postcss.config.js  # PostCSS 配置
└── vite.config.js     # Vite 配置
```

## 環境設置

### 安裝相依套件
```bash
npm install
```

## 開發與構建

### 開發模式
```bash
npm run dev
```
開發服務器將啟動在 http://localhost:5173

### 構建生產版本
```bash
npm run build
```
構建後的文件將位於 `dist` 目錄

## 與後端通信
前端應用已配置 Vite 代理，所有對 `/api` 的請求將被轉發到後端服務。

## Shadcn UI 組件
本專案使用 Shadcn UI 組件庫，這是一個基於 Tailwind CSS 的高質量 React 組件集合。

### 添加新組件
```bash
npx shadcn-ui@latest add [組件名稱]
```

例如添加按鈕組件：
```bash
npx shadcn-ui@latest add button
```

### 主題定制
可以在 `tailwind.config.js` 和 `src/index.css` 中自定義主題顏色和其他樣式變量。

## 開發規範
1. 使用函數組件與 React Hooks
2. 將可重用邏輯抽取為自定義 Hooks
3. 保持組件的單一職責
4. 使用語義化的元素與清晰的命名
5. 只使用 Shadcn UI 組件，保持界面一致性 ,非允許禁止使用其他組件