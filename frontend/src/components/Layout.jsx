import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // 檢查當前路徑是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-6">SABIT-LOCAL</h1>
              <nav className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  首頁
                </Link>
                <Link 
                  to="/exchange-keys" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/exchange-keys') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  API 密鑰管理
                </Link>
                <Link 
                  to="/trading" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/trading') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  交易操作
                </Link>
                <Link 
                  to="/multiprocessing" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/multiprocessing') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  多核心處理
                </Link>
                <Link 
                  to="/components" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/components') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  組件庫
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SABIT-LOCAL 本地加密貨幣自動化交易工具
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">
                本地運行 · 安全可靠 · 高效交易
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 