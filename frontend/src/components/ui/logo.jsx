import React from "react";

/**
 * SABIT Logo 組件
 * @param {string} className - 額外的 CSS 類名
 * @param {number} size - 圖標大小 (small, medium, large)
 * @param {boolean} withText - 是否顯示文字
 */
export function Logo({
  className = "",
  size = "medium",
  withText = true,
  textClassName = "",
}) {
  // 根據 size 參數決定圖標大小
  const sizeMap = {
    small: {
      imgSize: 24,
      imgClass: "h-6 w-6",
      textClass: "text-lg",
    },
    medium: {
      imgSize: 32,
      imgClass: "h-8 w-8",
      textClass: "text-xl",
    },
    large: {
      imgSize: 48,
      imgClass: "h-12 w-12",
      textClass: "text-2xl",
    },
  };

  const { imgClass, textClass } = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo/png_256.png"
        alt="SABIT Logo"
        className={`${imgClass} mr-2`}
      />

      {withText && (
        <span className={`font-bold ${textClass} ${textClassName}`}>SABIT</span>
      )}
    </div>
  );
}
