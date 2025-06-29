import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  LineChart,
  Wallet,
  Settings,
  Search,
} from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui/logo";
import { LoginButton } from "../login-button";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ApiStatusFooter } from "../ui/api-status-footer";

/**
 * 儀表板布局組件 - 用於功能性頁面
 * 特點：含側邊欄，適合操作性功能頁面
 */
const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 檢查當前路徑是否匹配
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // 側邊欄導航項目
  const navItems = [
    {
      name: "儀表板",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "價格監控",
      path: "/price-monitor",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      name: "資產管理",
      path: "/asset-management",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "系統設置",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // 側邊欄切換
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 頂部導航欄 */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* 移動端菜單按鈕 */}
              <button
                className="md:hidden p-2 mr-2 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* 側邊欄切換按鈕 */}
              <button
                className="hidden md:flex p-2 mr-2 rounded-md"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/" className="flex items-center">
                <Logo
                  size="small"
                  textClassName="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"
                />
              </Link>
            </div>

            {/* 搜尋欄 */}
            <div className="hidden md:flex items-center relative max-w-md w-full mx-4">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                placeholder="搜尋功能、設置或幫助..."
                className="pl-10 pr-4 py-2 w-full rounded-md border bg-background"
              />
            </div>

            {/* 右側工具欄 */}
            <div className="flex items-center space-x-3">
              <LoginButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* 側邊欄 - 桌面版 */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
            sidebarOpen ? "w-64" : "w-20",
          )}
        >
          <nav className="flex flex-col p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-3 rounded-md transition-colors",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 側邊欄 - 移動版 */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <Logo size="small" />
                <button
                  className="p-2 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-md transition-colors",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 text-sm font-medium">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* 主內容區 */}
        <main className="flex-grow p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* 頁腳 */}
      <footer className="bg-background border-t py-4">
        <div className="mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Sabit - 加密貨幣自動化交易工具
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/faq"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  常見問題
                </Link>
                <Link
                  to="/about"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  關於我們
                </Link>
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <ApiStatusFooter />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
