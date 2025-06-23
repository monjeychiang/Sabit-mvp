import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * 合併 Tailwind CSS 類名的工具函數
 * 使用 clsx 處理條件類名，並使用 tailwind-merge 合併和解決衝突
 * @param {...string} inputs - 要合併的類名
 * @returns {string} - 合併後的類名字符串
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
