import React, { createContext, useContext } from 'react';
import { useApiStatus } from '../hooks/useApiStatus';

// 創建 Context
export const ApiStatusContext = createContext({
  status: 'loading',
  lastChecked: null,
  checkApiStatus: () => {}
});

/**
 * API 狀態提供者組件
 * @param {Object} props - 組件屬性
 * @param {React.ReactNode} props.children - 子組件
 * @param {number} props.checkInterval - 檢查間隔（毫秒）
 */
export function ApiStatusProvider({ children, checkInterval = 30000 }) {
  const apiStatus = useApiStatus(checkInterval);
  
  return (
    <ApiStatusContext.Provider value={apiStatus}>
      {children}
    </ApiStatusContext.Provider>
  );
}

/**
 * 使用 API 狀態的 Hook
 * @returns {Object} API 狀態對象
 */
export function useApiStatusContext() {
  const context = useContext(ApiStatusContext);
  
  if (context === undefined) {
    throw new Error('useApiStatusContext 必須在 ApiStatusProvider 內使用');
  }
  
  return context;
} 