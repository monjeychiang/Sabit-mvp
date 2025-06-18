import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PerformanceAnalysis = ({ portfolioId, isLoading: parentLoading }) => {
  const [isLoading, setIsLoading] = useState(parentLoading);
  const [performanceData, setPerformanceData] = useState({
    totalReturn: 15.8,
    dailyReturn: 2.3,
    weeklyReturn: 5.7,
    monthlyReturn: 8.4,
    yearlyReturn: 25.2,
    volatility: 12.4,
    maxDrawdown: 18.7,
    sharpeRatio: 1.2,
    bestPerforming: {
      symbol: "SOL",
      return: 25
    },
    worstPerforming: {
      symbol: "ETH",
      return: -10
    }
  });
  const [timeRange, setTimeRange] = useState("1month");
  const { toast } = useToast();

  // 獲取績效數據
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      // 模擬 API 調用，實際開發時替換為真實 API
      // const response = await axios.get(`http://localhost:8000/api/portfolios/${portfolioId}/performance?timeRange=${timeRange}`);
      // setPerformanceData(response.data);
      
      // 模擬數據
      setTimeout(() => {
        // 根據選擇的時間範圍返回不同的模擬數據
        const mockData = {
          "1week": {
            totalReturn: 5.2,
            dailyReturn: 1.1,
            weeklyReturn: 5.2,
            monthlyReturn: null,
            yearlyReturn: null,
            volatility: 8.6,
            maxDrawdown: 7.3,
            sharpeRatio: 0.9,
            bestPerforming: {
              symbol: "BTC",
              return: 8.5
            },
            worstPerforming: {
              symbol: "ETH",
              return: -3.2
            }
          },
          "1month": {
            totalReturn: 15.8,
            dailyReturn: 0.7,
            weeklyReturn: 3.8,
            monthlyReturn: 15.8,
            yearlyReturn: null,
            volatility: 12.4,
            maxDrawdown: 18.7,
            sharpeRatio: 1.2,
            bestPerforming: {
              symbol: "SOL",
              return: 25
            },
            worstPerforming: {
              symbol: "ETH",
              return: -10
            }
          },
          "3months": {
            totalReturn: 28.5,
            dailyReturn: 0.5,
            weeklyReturn: 2.9,
            monthlyReturn: 9.5,
            yearlyReturn: null,
            volatility: 15.2,
            maxDrawdown: 22.4,
            sharpeRatio: 1.5,
            bestPerforming: {
              symbol: "SOL",
              return: 42
            },
            worstPerforming: {
              symbol: "ETH",
              return: -5
            }
          },
          "1year": {
            totalReturn: 68.3,
            dailyReturn: 0.3,
            weeklyReturn: 1.8,
            monthlyReturn: 5.7,
            yearlyReturn: 68.3,
            volatility: 18.7,
            maxDrawdown: 35.2,
            sharpeRatio: 1.8,
            bestPerforming: {
              symbol: "BTC",
              return: 85
            },
            worstPerforming: {
              symbol: "USDT",
              return: 0.2
            }
          },
          "all": {
            totalReturn: 125.7,
            dailyReturn: 0.2,
            weeklyReturn: 1.2,
            monthlyReturn: 4.2,
            yearlyReturn: 32.5,
            volatility: 22.3,
            maxDrawdown: 42.8,
            sharpeRatio: 1.6,
            bestPerforming: {
              symbol: "BTC",
              return: 150
            },
            worstPerforming: {
              symbol: "XRP",
              return: -25
            }
          }
        };
        
        setPerformanceData(mockData[timeRange]);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('獲取績效數據失敗:', error);
      toast({
        title: "獲取績效數據失敗",
        description: error.message || "請稍後再試",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    if (portfolioId) {
      fetchPerformanceData();
    }
  }, [portfolioId, timeRange]);

  // 處理時間範圍變更
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // 獲取趨勢圖標
  const getTrendIcon = (value) => {
    if (value > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (value < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  // 獲取趨勢顏色
  const getTrendColor = (value) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "";
  };

  // 格式化百分比
  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div>
      {/* 時間範圍選擇器 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">績效分析</h2>
        <Select 
          value={timeRange} 
          onValueChange={handleTimeRangeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="選擇時間範圍" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1week">過去 1 週</SelectItem>
            <SelectItem value="1month">過去 1 個月</SelectItem>
            <SelectItem value="3months">過去 3 個月</SelectItem>
            <SelectItem value="1year">過去 1 年</SelectItem>
            <SelectItem value="all">所有時間</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">載入績效數據中...</span>
        </div>
      ) : (
        <>
          {/* 績效概覽卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">總回報率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {getTrendIcon(performanceData.totalReturn)}
                  <span className={`text-2xl font-bold ml-1 ${getTrendColor(performanceData.totalReturn)}`}>
                    {formatPercent(performanceData.totalReturn)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {timeRange === "1week" ? "每日平均" : 
                   timeRange === "1month" ? "每週平均" : 
                   timeRange === "3months" ? "每月平均" : "年化回報"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {getTrendIcon(
                    timeRange === "1week" ? performanceData.dailyReturn : 
                    timeRange === "1month" ? performanceData.weeklyReturn : 
                    timeRange === "3months" ? performanceData.monthlyReturn : 
                    performanceData.yearlyReturn
                  )}
                  <span className={`text-2xl font-bold ml-1 ${getTrendColor(
                    timeRange === "1week" ? performanceData.dailyReturn : 
                    timeRange === "1month" ? performanceData.weeklyReturn : 
                    timeRange === "3months" ? performanceData.monthlyReturn : 
                    performanceData.yearlyReturn
                  )}`}>
                    {formatPercent(
                      timeRange === "1week" ? performanceData.dailyReturn : 
                      timeRange === "1month" ? performanceData.weeklyReturn : 
                      timeRange === "3months" ? performanceData.monthlyReturn : 
                      performanceData.yearlyReturn
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">表現最佳</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold ml-1 text-green-500">
                    {performanceData.bestPerforming.symbol} {formatPercent(performanceData.bestPerforming.return)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">表現最差</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {performanceData.worstPerforming.return < 0 && (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-2xl font-bold ml-1 ${
                    performanceData.worstPerforming.return < 0 ? 'text-red-500' : ''
                  }`}>
                    {performanceData.worstPerforming.symbol} {formatPercent(performanceData.worstPerforming.return)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 績效圖表 */}
          <Tabs defaultValue="returns">
            <TabsList className="mb-6">
              <TabsTrigger value="returns">收益率</TabsTrigger>
              <TabsTrigger value="comparison">市場對比</TabsTrigger>
              <TabsTrigger value="risk">風險分析</TabsTrigger>
            </TabsList>
            
            <TabsContent value="returns">
              <Card>
                <CardHeader>
                  <CardTitle>收益率走勢</CardTitle>
                  <CardDescription>
                    {timeRange === "1week" ? "過去 7 天" : 
                     timeRange === "1month" ? "過去 30 天" : 
                     timeRange === "3months" ? "過去 90 天" : 
                     timeRange === "1year" ? "過去 365 天" : 
                     "所有時間"}
                    的投資組合收益率變化
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">收益率走勢圖（此為示意圖，實際開發時將整合圖表庫）</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>市場對比</CardTitle>
                  <CardDescription>與主要市場指數的績效對比</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">市場對比圖（此為示意圖，實際開發時將整合圖表庫）</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="risk">
              <Card>
                <CardHeader>
                  <CardTitle>風險指標</CardTitle>
                  <CardDescription>投資組合的風險評估指標</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">波動率</h4>
                      <p className="text-2xl font-bold">{performanceData.volatility.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {timeRange === "1week" ? "過去 7 天" : 
                         timeRange === "1month" ? "過去 30 天" : 
                         timeRange === "3months" ? "過去 90 天" : 
                         timeRange === "1year" ? "過去 365 天" : 
                         "所有時間"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">最大回撤</h4>
                      <p className="text-2xl font-bold text-red-500">-{performanceData.maxDrawdown.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {timeRange === "1week" ? "過去 7 天" : 
                         timeRange === "1month" ? "過去 30 天" : 
                         timeRange === "3months" ? "過去 90 天" : 
                         timeRange === "1year" ? "過去 365 天" : 
                         "所有時間"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">夏普比率</h4>
                      <p className="text-2xl font-bold">{performanceData.sharpeRatio.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {timeRange === "1week" ? "過去 7 天" : 
                         timeRange === "1month" ? "過去 30 天" : 
                         timeRange === "3months" ? "過去 90 天" : 
                         timeRange === "1year" ? "過去 365 天" : 
                         "所有時間"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 h-60">
                    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">風險分析圖表（此為示意圖，實際開發時將整合圖表庫）</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PerformanceAnalysis; 