import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ComponentTest from './pages/ComponentTest';
import MultiProcessingTest from './pages/MultiProcessingTest';
import ExchangeKeysPage from './pages/ExchangeKeysPage';
import TradingPage from './pages/TradingPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/components" element={<ComponentTest />} />
          <Route path="/multiprocessing" element={<MultiProcessingTest />} />
          <Route path="/exchange-keys" element={<ExchangeKeysPage />} />
          <Route path="/trading" element={<TradingPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App; 