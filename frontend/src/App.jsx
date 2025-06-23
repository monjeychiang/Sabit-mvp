import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from './components/layouts/MainLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import ComponentTest from './pages/ComponentTest';
import ExchangeKeysPage from './pages/ExchangeKeysPage';
import TradingPage from './pages/TradingPage';
import AssetManagementPage from './pages/AssetManagementPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PriceMonitorPage from './pages/PriceMonitorPage';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingTransition } from '@/components/ui/loading-transition';
import { useEffect, useState } from 'react';

// 路由變更監聽器，用於觸發過場動畫
const RouteChangeListener = ({ onLayoutChange }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // 判斷是否是布局變更
  const isLayoutChange = (pathname) => {
    // 從主布局到儀表板布局，或從儀表板布局到主布局
    const isDashboardRoute = pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/exchange-keys') || 
                            pathname.startsWith('/trading') || 
                            pathname.startsWith('/asset-management') || 
                            pathname.startsWith('/price-monitor') || 
                            pathname.startsWith('/components');
                            
    const isMainRoute = pathname === '/' || pathname === '/login' || pathname === '/register';
    
    // 檢查是否從一種布局切換到另一種布局
    const prevPathname = sessionStorage.getItem('prevPathname');
    const prevIsDashboard = prevPathname && (
      prevPathname.startsWith('/dashboard') || 
      prevPathname.startsWith('/exchange-keys') || 
      prevPathname.startsWith('/trading') || 
      prevPathname.startsWith('/asset-management') || 
      prevPathname.startsWith('/price-monitor') || 
      prevPathname.startsWith('/components')
    );
    const prevIsMain = prevPathname === '/' || prevPathname === '/login' || prevPathname === '/register';
    
    // 儲存當前路徑
    sessionStorage.setItem('prevPathname', pathname);
    
    // 如果是首次載入，不顯示過場動畫
    if (!prevPathname) return false;
    
    // 如果是從主布局到儀表板布局，或從儀表板布局到主布局，則顯示過場動畫
    return (isDashboardRoute && prevIsMain) || (isMainRoute && prevIsDashboard);
  };
  
  useEffect(() => {
    // 如果是布局變更且不是瀏覽器的前進/後退操作，則觸發過場動畫
    if (isLayoutChange(location.pathname) && navigationType !== 'POP') {
      onLayoutChange();
    }
  }, [location.pathname, navigationType, onLayoutChange]);
  
  return null;
};

function App() {
  const [showTransition, setShowTransition] = useState(false);
  
  const handleLayoutChange = () => {
    setShowTransition(true);
    
    // 模擬載入時間，2秒後自動完成
    setTimeout(() => {
      setShowTransition(false);
    }, 2000);
  };
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="sabit-theme-preference">
      <Router>
        <AuthProvider>
          <RouteChangeListener onLayoutChange={handleLayoutChange} />
          
          {/* 過場動畫 */}
          {showTransition && (
            <LoadingTransition 
              isLoading={showTransition} 
              onComplete={() => setShowTransition(false)} 
            />
          )}
          
          <Routes>
            {/* 公開路由 - 使用 MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            
            {/* 受保護路由 - 使用 DashboardLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/components" element={<ComponentTest />} />
                <Route path="/exchange-keys" element={<ExchangeKeysPage />} />
                <Route path="/trading" element={<TradingPage />} />
                <Route path="/asset-management" element={<AssetManagementPage />} />
                <Route path="/price-monitor" element={<PriceMonitorPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 