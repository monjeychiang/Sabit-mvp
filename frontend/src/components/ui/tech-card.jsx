import React, { useState, useEffect } from 'react';
import { Card } from './card';

// 添加全局樣式到 head，只需要執行一次
const addGlobalStyles = () => {
  // 檢查是否已經添加了樣式
  if (!document.getElementById('tech-card-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'tech-card-styles';
    styleElement.innerHTML = `
      @keyframes tech-card-border-animation {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

const TechCard = ({ 
  children, 
  className = '', 
  glowColor = 'rgba(var(--primary), 0.3)',
  borderColor = 'hsl(var(--primary))',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 當組件首次渲染時添加全局樣式
  useEffect(() => {
    addGlobalStyles();
  }, []);
  
  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 發光效果 */}
      <div 
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          boxShadow: `0 0 20px ${glowColor}`,
          zIndex: -1
        }}
      />
      
      {/* 邊框動畫 */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)`,
            animation: 'tech-card-border-animation 2s linear infinite',
            opacity: isHovered ? 0.7 : 0.3,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>
      
      {/* 卡片內容 */}
      <Card 
        className="relative z-10 border border-transparent bg-background/80 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]"
        {...props}
      >
        {children}
      </Card>
    </div>
  );
};

export { TechCard }; 