import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './theme-toggle';
import { GitHubStars } from './github-stars';
import { Logo } from './ui/logo';
import { MainNavigation } from './main-navigation';
import { MobileNavigation } from './mobile-navigation';
import { LoginButton } from './login-button';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // 檢查當前路徑是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col w-full h-full">
      <header className="bg-background border-b w-full sticky top-0 z-40">
        <div className="w-full mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MobileNavigation />
              <Link to="/" className="flex items-center">
                <Logo 
                  size="medium" 
                  textClassName="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"
                />
              </Link>
              <div className="ml-6">
                <MainNavigation />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LoginButton />
              <GitHubStars username="monjeychiang" repo="Sabit-mvp" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow w-full">
        {children}
      </main>
      
      <footer className="bg-background border-t py-6 w-full">
        <div className="w-full mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Logo size="small" />
              <p className="text-sm text-muted-foreground ml-2">
                © {new Date().getFullYear()} 本地加密貨幣自動化交易工具
              </p>
            </div>
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