import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 如果仍在加載，顯示加載中提示
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">驗證中...</p>
      </div>
    );
  }
  
  // 如果未認證，重定向到登入頁面
  if (!isAuthenticated) {
    // 保存用戶原本想要訪問的路徑，登入後可以重定向回來
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 已認證，顯示受保護的內容
  return children;
} 