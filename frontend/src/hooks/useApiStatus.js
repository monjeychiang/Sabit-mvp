import { useState, useEffect } from 'react';

/**
 * Hook 用於檢查 API 連接狀態
 * @param {number} interval - 檢查間隔（毫秒），默認 30 秒
 * @returns {Object} 狀態對象，包含當前狀態和手動檢查函數
 */
export function useApiStatus(interval = 30000) {
  const [status, setStatus] = useState('loading'); // 'loading', 'connected', 'disconnected'
  const [lastChecked, setLastChecked] = useState(null);

  const checkApiStatus = async () => {
    try {
      // 記錄檢查時間
      const checkTime = new Date();
      setLastChecked(checkTime);

      // 嘗試訪問 API 健康檢查端點
      const response = await fetch('/api/health');
      if (response.ok) {
        setStatus('connected');
        console.log('API 連接正常', checkTime);
      } else {
        setStatus('disconnected');
        console.warn('API 響應異常', response.status, checkTime);
      }
    } catch (error) {
      setStatus('disconnected');
      console.error('API 連接失敗', error, new Date());
    }
  };

  useEffect(() => {
    // 初始檢查
    checkApiStatus();

    // 設置定期檢查
    const timer = setInterval(checkApiStatus, interval);

    // 清理函數
    return () => clearInterval(timer);
  }, [interval]);

  return {
    status,
    lastChecked,
    checkApiStatus
  };
}
