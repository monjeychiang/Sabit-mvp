import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GitHubIcon } from './github-icon';

/**
 * GitHub Star 計數組件
 * 顯示指定 GitHub 倉庫的星標數量
 * @param {string} username - GitHub 用戶名
 * @param {string} repo - GitHub 倉庫名稱
 * @param {string} className - 額外的 CSS 類名
 */
export function GitHubStars({ username = 'monjeychiang', repo = 'Sabit-mvp', className = '' }) {
  const [stars, setStars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        
        if (!response.ok) {
          throw new Error('無法獲取 GitHub 數據');
        }
        
        const data = await response.json();
        setStars(data.stargazers_count);
        setError(false);
      } catch (err) {
        console.error('獲取 GitHub 星標數量出錯:', err);
        setError(true);
        // 設置一個預設值，避免顯示為空
        setStars(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
    
    // 每 5 分鐘更新一次數據
    const intervalId = setInterval(fetchStars, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [username, repo]);

  const handleClick = () => {
    window.open(`https://github.com/${username}/${repo}`, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`flex items-center gap-1 hover:bg-muted ${className}`}
      onClick={handleClick}
      title="在 GitHub 上查看"
    >
      <GitHubIcon className="h-4 w-4" />
      {loading ? (
        <span className="text-xs animate-pulse">載入中...</span>
      ) : error ? (
        <span className="text-xs">GitHub</span>
      ) : (
        <span className="text-xs">{stars} stars</span>
      )}
    </Button>
  );
} 