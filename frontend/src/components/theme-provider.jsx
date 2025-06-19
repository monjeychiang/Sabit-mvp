import { createContext, useContext, useEffect, useState } from "react";
import { useApiStatus } from "../hooks/useApiStatus";

// 創建主題上下文，包含 API 狀態
const ThemeProviderContext = createContext({
  theme: "system",
  setTheme: () => null,
  apiStatus: 'loading',
  lastChecked: null,
  checkApiStatus: () => null
});

// 主題提供器組件
export function ThemeProvider({ 
  children, 
  defaultTheme = "system", 
  storageKey = "sabit-ui-theme",
  apiCheckInterval = 30000
}) {
  // 主題狀態
  const [theme, setTheme] = useState(() => {
    // 嘗試從本地存儲中獲取主題設置
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme || defaultTheme;
  });

  // 獲取 API 狀態
  const apiStatusData = useApiStatus(apiCheckInterval);

  useEffect(() => {
    const root = window.document.documentElement;

    // 移除所有主題類名
    root.classList.remove("light", "dark");

    // 根據當前主題設置類名
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // 當主題變化時，保存到本地存儲
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // 監聽系統主題變化
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // 合併主題和 API 狀態
  const value = {
    theme,
    setTheme: (newTheme) => setTheme(newTheme),
    ...apiStatusData
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// 自定義 Hook，用於在組件中訪問主題和 API 狀態
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 