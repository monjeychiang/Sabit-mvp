# SABIT 主題切換功能

## 概述

SABIT 應用程序現在支援深淺主題切換功能，使用者可以根據自己的喜好或環境光線選擇適合的主題模式。主題設置會被保存在瀏覽器的本地存儲中，下次訪問時會自動應用上次選擇的主題。

## 支援的主題模式

SABIT 支援三種主題模式：

1. **淺色主題**：明亮的背景和深色文字，適合在明亮環境下使用。
2. **深色主題**：深色背景和明亮文字，適合在暗光環境下使用，減少眼睛疲勞。
3. **系統主題**：自動跟隨系統設置，根據用戶操作系統的主題偏好自動切換。

## 如何切換主題

在應用程序的頂部導航欄右側，有一個主題切換按鈕：

- 淺色模式下顯示為太陽圖標 ☀️
- 深色模式下顯示為月亮圖標 🌙

點擊此按鈕會顯示一個下拉菜單，提供三個選項：

1. **淺色**：切換到淺色主題
2. **深色**：切換到深色主題
3. **系統**：跟隨系統主題設置

選擇任一選項後，主題將立即切換，並自動保存您的偏好設置。

## 技術實現

主題切換功能使用以下技術實現：

- **React Context API**：用於在整個應用中共享主題狀態
- **Tailwind CSS**：提供深淺主題的樣式支援
- **localStorage**：保存用戶的主題偏好
- **CSS 變量**：定義不同主題的顏色方案

## 開發者指南

如果您是開發人員，想要在自定義組件中響應主題變化，可以使用我們提供的 `useTheme` Hook：

```jsx
import { useTheme } from "@/components/theme-provider";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <p>當前主題: {theme}</p>
      <button onClick={() => setTheme("dark")}>切換到深色主題</button>
    </div>
  );
}
```

您也可以使用 Tailwind CSS 的深淺主題類來設置不同主題下的樣式：

```jsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  根據主題自動調整的內容
</div>
```

## 注意事項

- 主題設置保存在瀏覽器的 localStorage 中，清除瀏覽器數據可能會重置此設置
- 系統主題模式需要瀏覽器支援 `prefers-color-scheme` 媒體查詢
- 在不支援 JavaScript 的環境中，將默認使用淺色主題 