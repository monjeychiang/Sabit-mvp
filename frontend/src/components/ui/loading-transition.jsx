import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { Sparkles, BarChart3, LineChart, Coins, ArrowUpDown } from 'lucide-react';

/**
 * 過場動畫組件 - 用於布局切換時顯示
 * 增強版載入動畫，包含圖標、粒子效果和動態讀取條
 */
const LoadingTransition = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [loadingText, setLoadingText] = useState('正在載入應用程式...');
  
  // 隨機更改載入文字
  useEffect(() => {
    const loadingTexts = [
      '正在載入應用程式...',
      '正在連接交易所...',
      '正在準備市場數據...',
      '正在載入交易策略...',
      '正在分析資產數據...',
      '正在優化使用者介面...',
    ];
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingTexts.length);
      setLoadingText(loadingTexts[randomIndex]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // 如果不再載入，則完成進度條並淡出
    if (!isLoading && progress < 100) {
      // 快速完成剩餘進度
      const timer = setTimeout(() => {
        setProgress(100);
      }, 200);
      return () => clearTimeout(timer);
    }
    
    // 如果正在載入，則逐漸增加進度
    if (isLoading && progress < 85) {
      const timer = setTimeout(() => {
        // 進度增加速度隨著進度增加而減慢
        const increment = Math.max(1, 10 - Math.floor(progress / 10));
        setProgress(prev => Math.min(prev + increment, 85));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress]);
  
  // 當進度達到 100% 時，觸發淡出效果
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 500); // 淡出動畫時間
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background flex flex-col items-center justify-center z-50",
        "transition-opacity duration-500 overflow-hidden",
        progress >= 100 ? "opacity-0" : "opacity-100"
      )}
    >
      {/* 背景粒子效果 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-primary/10 rounded-full animate-pulse-glow"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 3}s`
            }}
          />
        ))}
      </div>
      
      {/* 浮動圖標 */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles 
          className="absolute text-primary/30 animate-float" 
          style={{
            top: '20%',
            left: '15%',
            width: 40,
            height: 40,
            animationDelay: '0.5s'
          }}
        />
        <BarChart3 
          className="absolute text-primary/30 animate-float" 
          style={{
            top: '30%',
            left: '80%',
            width: 36,
            height: 36,
            animationDelay: '1.2s'
          }}
        />
        <LineChart 
          className="absolute text-primary/30 animate-float" 
          style={{
            top: '70%',
            left: '20%',
            width: 32,
            height: 32,
            animationDelay: '0.8s'
          }}
        />
        <Coins 
          className="absolute text-primary/30 animate-float" 
          style={{
            top: '65%',
            left: '75%',
            width: 38,
            height: 38,
            animationDelay: '1.5s'
          }}
        />
        <ArrowUpDown 
          className="absolute text-primary/30 animate-float" 
          style={{
            top: '40%',
            left: '60%',
            width: 30,
            height: 30,
            animationDelay: '0.3s'
          }}
        />
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        {/* Logo 動畫 */}
        <div className="animate-float mb-8 relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-xl animate-pulse-glow"></div>
          <Logo size="large" />
        </div>
        
        {/* 進度條 */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* 進度條光暈效果 */}
            <div className="absolute right-0 top-0 h-full w-8 bg-white/30 animate-pulse"></div>
          </div>
        </div>
        
        {/* 載入文字 */}
        <div className="h-6 mt-4">
          <p className="text-sm text-muted-foreground animate-fade-in">
            {loadingText}
          </p>
        </div>
        
        {/* 進度百分比 */}
        <p className="text-xs text-primary/70 mt-2 font-mono">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};

export { LoadingTransition }; 