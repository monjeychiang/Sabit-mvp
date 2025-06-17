import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

// 創建上下文
const AuthContext = createContext(null);

// 身份驗證提供者組件
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 初始化時檢查用戶是否已登入
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // 解析用戶數據
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // 可選：驗證令牌的有效性
          // 對於簡單的本地應用，我們可以跳過這一步
          /*
          try {
            await axios.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (error) {
            // 令牌無效，執行登出
            logout();
          }
          */
        } catch (error) {
          console.error('解析用戶數據出錯:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 登出函數
  const logout = () => {
    // 清除本地存儲
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // 更新狀態
    setUser(null);
    setIsAuthenticated(false);
    
    // 顯示提示
    toast({
      title: "已登出",
      description: "您已成功登出系統",
    });
    
    // 跳轉到首頁
    navigate('/');
  };

  // 上下文值
  const value = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    // 更新用戶數據的方法
    updateUser: (userData) => {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 自定義鉤子以使用上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用');
  }
  return context;
}; 