import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { ThemeToggle } from "../theme-toggle";
import { GitHubStars } from "../github-stars";
import { Logo } from "../ui/logo";
import { MainNavigation } from "../main-navigation";
import { MobileNavigation } from "../mobile-navigation";
import { LoginButton } from "../login-button";
import {
  Github,
  Twitter,
  Mail,
  Heart,
  Coffee,
  ExternalLink,
  BookOpen,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

/**
 * 主布局組件 - 用於首頁和資訊頁
 * 特點：全寬設計，沒有側邊欄，適合展示和介紹內容
 */
const MainLayout = () => {
  const location = useLocation();

  // 檢查當前路徑是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b w-full sticky top-0 z-40">
        <div className="w-full mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <MobileNavigation />
              <Link to="/" className="flex items-center">
                <Logo size="medium" textClassName="text-foreground" />
              </Link>
              <div className="ml-12">
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
        <Outlet />
      </main>

      <footer className="bg-background border-t py-12 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* 第一欄 - 品牌和版權 */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <Logo size="small" />
                <p className="text-base font-medium ml-2">SABIT</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                © {new Date().getFullYear()} 加密貨幣自動化交易工具
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                本地運行 · 安全可靠 · 高效交易
              </p>
              <div className="flex items-center space-x-4 mt-5">
                <a
                  href={import.meta.env.VITE_SOCIAL_GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github size={20} />
                </a>
                <a
                  href={import.meta.env.VITE_SOCIAL_TWITTER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href={import.meta.env.VITE_SOCIAL_DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle size={20} />
                </a>
                <a
                  href={`mailto:${import.meta.env.VITE_SOCIAL_EMAIL}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>

            {/* 第二欄 - 產品與功能 */}
            <div className="mt-2">
              <h3 className="font-medium text-base mb-4">產品與功能</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span>儀表板</span>
                    <ArrowRight className="h-3 w-0 ml-1 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/price-monitor"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span>價格監控</span>
                    <ArrowRight className="h-3 w-0 ml-1 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trading"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span>交易策略</span>
                    <ArrowRight className="h-3 w-0 ml-1 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/asset-management"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span>資產管理</span>
                    <ArrowRight className="h-3 w-0 ml-1 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span>訂閱方案</span>
                    <ArrowRight className="h-3 w-0 ml-1 opacity-0 group-hover:w-3 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* 第三欄 - 資源與幫助 */}
            <div className="mt-2">
              <h3 className="font-medium text-base mb-4">資源與幫助</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <BookOpen size={14} className="mr-2" />
                    <span>文檔</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <ExternalLink size={14} className="mr-2" />

                    <span>API 參考</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`${import.meta.env.VITE_SOCIAL_GITHUB}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    問題報告
                  </a>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    常見問題
                  </Link>
                </li>
              </ul>
            </div>

            {/* 第四欄 - 關於與支持 */}
            <div className="mt-2">
              <h3 className="font-medium text-base mb-4">關於與支持</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    關於我們
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    隱私政策
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    使用條款
                  </a>
                </li>
                <li>
                  <a
                    href={import.meta.env.VITE_SOCIAL_GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <Heart size={14} className="mr-2 text-red-500" />

                    <span>贊助專案</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.buymeacoffee.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <Coffee size={14} className="mr-2" />
                    <span>請我喝杯咖啡</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 移除 API 指示器，保留簡單的裝飾性分隔線 */}
          <div className="mt-12 border-t"></div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
