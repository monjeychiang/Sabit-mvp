/**
 * 前端日誌工具
 * 
 * 支援從 VITE_LOG_LEVEL 環境變數控制日誌等級
 * 可選等級：debug、info、warn、error
 */

// 定義日誌等級權重
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 從環境變數取得日誌等級，預設為 info
const currentLevel = (import.meta.env.VITE_LOG_LEVEL || 'info').toLowerCase();

// 檢查日誌是否應該顯示
const shouldLog = (level) => {
  const levelValue = LOG_LEVELS[level];
  const currentLevelValue = LOG_LEVELS[currentLevel];
  return levelValue >= currentLevelValue;
};

// 日誌工具
const logger = {
  debug: (...args) => {
    if (shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  },
  
  // 取得目前日誌等級
  getLevel: () => currentLevel,
};

export default logger; 