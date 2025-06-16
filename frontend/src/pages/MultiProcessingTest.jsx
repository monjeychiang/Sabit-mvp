import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './MultiProcessingTest.css'

// 重用 ComponentTest.jsx 中的組件
const Button = ({ variant = "default", size = "default", children, ...props }) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = ({ children }) => {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}

const CardTitle = ({ children }) => {
  return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
}

const CardDescription = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

const CardContent = ({ children }) => {
  return <div className="p-6 pt-0">{children}</div>
}

const CardFooter = ({ children }) => {
  return <div className="flex items-center p-6 pt-0">{children}</div>
}

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

function MultiProcessingTest() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processingLoading, setProcessingLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itemCount, setItemCount] = useState(100)
  const [factor, setFactor] = useState(1)
  const [results, setResults] = useState(null)
  const [processingTime, setProcessingTime] = useState(null)
  
  useEffect(() => {
    // 獲取系統資訊
    const fetchSystemInfo = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/processing/system-info')
        setSystemInfo(response.data)
        setError(null)
      } catch (err) {
        setError('無法獲取系統資訊')
        console.error('API 錯誤:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSystemInfo()
  }, [])
  
  const handleProcessing = async () => {
    try {
      setProcessingLoading(true)
      setResults(null)
      setProcessingTime(null)
      
      const startTime = performance.now()
      
      // 創建要處理的項目數組
      const items = Array.from({ length: itemCount }, (_, i) => i + 1)
      
      const response = await axios.post('/api/processing/process-batch', {
        items,
        factor: parseFloat(factor)
      })
      
      const endTime = performance.now()
      setProcessingTime((endTime - startTime) / 1000)
      setResults(response.data)
      setError(null)
    } catch (err) {
      setError('處理數據時發生錯誤')
      console.error('API 錯誤:', err)
    } finally {
      setProcessingLoading(false)
    }
  }
  
  return (
    <div className="multiprocessing-test">
      <h1 className="text-3xl font-bold mb-8">多核心處理測試</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">系統資訊</h2>
        {loading ? (
          <p>正在獲取系統資訊...</p>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : systemInfo ? (
          <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPU 核心數</p>
                  <p className="text-2xl font-bold">{systemInfo.cpu_cores}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">記憶體使用率</p>
                  <p className="text-2xl font-bold">{systemInfo.memory_percent_used}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">總記憶體</p>
                  <p className="text-2xl font-bold">{systemInfo.memory_total_gb} GB</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">可用記憶體</p>
                  <p className="text-2xl font-bold">{systemInfo.memory_available_gb} GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">多核心處理測試</h2>
        <Card>
          <CardHeader>
            <CardTitle>並行處理測試</CardTitle>
            <CardDescription>
              此測試將使用多核心並行處理指定數量的項目。每個項目會模擬一個耗時的計算任務。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="itemCount" className="text-sm font-medium">處理項目數量</label>
                <Input 
                  id="itemCount" 
                  type="number" 
                  value={itemCount} 
                  onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}
                  min="1"
                  max="10000"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="factor" className="text-sm font-medium">處理因子 (影響處理時間)</label>
                <Input 
                  id="factor" 
                  type="number" 
                  value={factor} 
                  onChange={(e) => setFactor(e.target.value)} 
                  step="0.1"
                  min="0.1"
                  max="10"
                />
              </div>
            </div>
            <Button onClick={handleProcessing} disabled={processingLoading}>
              {processingLoading ? '處理中...' : '開始處理'}
            </Button>
          </CardContent>
          {results && (
            <CardFooter className="flex-col items-start">
              <div className="w-full">
                <h4 className="text-lg font-medium mb-2">處理結果</h4>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p><strong>前端處理時間:</strong> {processingTime.toFixed(2)} 秒</p>
                  <p><strong>使用的 CPU 核心數:</strong> {results.cpu_cores_used}</p>
                  <p><strong>處理的項目數:</strong> {results.results.length}</p>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">項目</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">結果</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">處理時間 (秒)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.results.slice(0, 10).map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{result.item}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{result.result}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{result.process_time.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.results.length > 10 && (
                    <div className="px-4 py-2 text-center text-sm text-muted-foreground">
                      顯示前 10 條結果 (共 {results.results.length} 條)
                    </div>
                  )}
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </section>
    </div>
  )
}

export default MultiProcessingTest 