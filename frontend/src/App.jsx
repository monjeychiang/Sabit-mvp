import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ComponentTest from './pages/ComponentTest';
import MultiProcessingTest from './pages/MultiProcessingTest';
import ExchangeKeysPage from './pages/ExchangeKeysPage';
import TradingPage from './pages/TradingPage';
import AssetManagementPage from './pages/AssetManagementPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sabit-theme-preference">
      <Router>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* 公開路由 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* 受保護路由 */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/components" element={
                <ProtectedRoute>
                  <ComponentTest />
                </ProtectedRoute>
              } />
              <Route path="/multiprocessing" element={
                <ProtectedRoute>
                  <MultiProcessingTest />
                </ProtectedRoute>
              } />
              <Route path="/exchange-keys" element={
                <ProtectedRoute>
                  <ExchangeKeysPage />
                </ProtectedRoute>
              } />
              <Route path="/trading" element={
                <ProtectedRoute>
                  <TradingPage />
                </ProtectedRoute>
              } />
              <Route path="/asset-management" element={
                <ProtectedRoute>
                  <AssetManagementPage />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 