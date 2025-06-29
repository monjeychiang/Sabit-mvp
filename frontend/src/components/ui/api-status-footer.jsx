import React from "react";
import { CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";
import { useApiStatusContext } from "../../contexts/ApiStatusContext";

/**
 * API 狀態頁腳指示器組件
 * 顯示在頁面底部的 API 連接狀態指示器，包含上次檢查時間
 */
export function ApiStatusFooter() {
  const { status, lastChecked, checkApiStatus } = useApiStatusContext();

  // 格式化上次檢查時間
  const formattedTime = lastChecked
    ? new Intl.DateTimeFormat("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(lastChecked)
    : "未檢查";

  return (
    <div className="flex items-center text-xs text-muted-foreground">
      {status === "loading" && (
        <div className="flex items-center">
          <div className="animate-pulse h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
          <span>API 狀態檢查中...</span>
        </div>
      )}

      {status === "connected" && (
        <div className="flex items-center">
          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />

          <span>API 已連接</span>
          <span className="mx-2">•</span>
          <Clock className="h-3 w-3 mr-1" />
          <span>上次檢查: {formattedTime}</span>
        </div>
      )}

      {status === "disconnected" && (
        <div className="flex items-center">
          <XCircle className="h-3 w-3 text-red-500 mr-1" />
          <span className="text-red-500">API 未連接</span>
          <span className="mx-2">•</span>
          <Clock className="h-3 w-3 mr-1" />
          <span>上次檢查: {formattedTime}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              checkApiStatus();
            }}
            className="ml-2 p-1 rounded-full hover:bg-muted"
            title="重新檢查連接"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
