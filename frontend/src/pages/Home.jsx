import { useState, useEffect } from 'react'
import axios from 'axios'
import './Home.css'
import logger from '../utils/logger'

function Home() {
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 取得 API base url（從 .env 設定，預設為 http://localhost:8000）
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/api/v1/health`)
        setApiStatus(response.data)
        setError(null)
      } catch (err) {
        setError('無法連接到 API 服務')
        logger.error('API 連接錯誤:', err)
      } finally {
        setLoading(false)
      }
    }

    checkApiStatus()
  }, [])

  return (
    <div className="home-container">
      <h2>歡迎使用 FastAPI + React 前後端分離應用</h2>
      
      <section className="api-status-section">
        <h3>API 連接狀態</h3>
        {loading ? (
          <p>正在檢查 API 連接...</p>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <p>請確認後端服務是否已啟動</p>
          </div>
        ) : (
          <div className="status-card">
            <p><strong>狀態:</strong> {apiStatus?.status}</p>
            <p><strong>服務:</strong> {apiStatus?.service}</p>
            <p><strong>版本:</strong> {apiStatus?.version}</p>
          </div>
        )}
      </section>

      <section className="instructions-section">
        <h3>開始開發</h3>
        <p>此專案已設置好基本的前後端分離架構，您可以開始開發您的應用程式功能。</p>
        <ul>
          <li>後端 API 位於 <code>/backend</code> 目錄</li>
          <li>前端 React 應用位於 <code>/frontend</code> 目錄</li>
        </ul>
      </section>
    </div>
  )
}

export default Home 