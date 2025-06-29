import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import axios from "axios";

// 子頁面組件
import AssetOverview from "@/components/asset-management/AssetOverview";
import AssetDistribution from "@/components/asset-management/AssetDistribution";
import TransactionHistory from "@/components/asset-management/TransactionHistory";
import PerformanceAnalysis from "@/components/asset-management/PerformanceAnalysis";
import ReportCenter from "@/components/asset-management/ReportCenter";

const AssetManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [assets, setAssets] = useState([]);
  const [assetSummary, setAssetSummary] = useState({
    totalValue: 0,
    dailyChange: 0,
    percentChange: 0,
  });

  const { toast } = useToast();

  // 獲取用戶資產組合
  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      // 模擬 API 調用，實際開發時替換為真實 API
      // const response = await axios.get('http://localhost:8000/api/portfolios');
      // setPortfolios(response.data);

      // 模擬數據
      setTimeout(() => {
        const mockPortfolios = [
          {
            id: 1,
            name: "主要投資組合",
            description: "長期持有的加密貨幣資產",
          },
          { id: 2, name: "交易組合", description: "短期交易用資產" },
          { id: 3, name: "穩定幣組合", description: "穩定幣儲備" },
        ];

        setPortfolios(mockPortfolios);
        setSelectedPortfolio(mockPortfolios[0]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("獲取資產組合失敗:", error);
      toast({
        title: "獲取資產組合失敗",
        description: error.message || "請稍後再試",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 獲取選定資產組合的資產
  const fetchAssets = async (portfolioId) => {
    if (!portfolioId) return;

    try {
      setIsLoading(true);
      // 模擬 API 調用，實際開發時替換為真實 API
      // const response = await axios.get(`http://localhost:8000/api/portfolios/${portfolioId}/assets`);
      // setAssets(response.data);

      // 模擬數據
      setTimeout(() => {
        const mockAssets = [
          {
            id: 1,
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.5,
            currentValue: 25000,
            costBasis: 22000,
            changePercent: 13.64,
          },
          {
            id: 2,
            symbol: "ETH",
            name: "Ethereum",
            amount: 5,
            currentValue: 9000,
            costBasis: 10000,
            changePercent: -10,
          },
          {
            id: 3,
            symbol: "USDT",
            name: "Tether",
            amount: 10000,
            currentValue: 10000,
            costBasis: 10000,
            changePercent: 0,
          },
          {
            id: 4,
            symbol: "BNB",
            name: "Binance Coin",
            amount: 10,
            currentValue: 3000,
            costBasis: 2500,
            changePercent: 20,
          },
          {
            id: 5,
            symbol: "SOL",
            name: "Solana",
            amount: 50,
            currentValue: 5000,
            costBasis: 4000,
            changePercent: 25,
          },
        ];

        setAssets(mockAssets);

        // 計算總資產價值和變化
        const totalValue = mockAssets.reduce(
          (sum, asset) => sum + asset.currentValue,
          0,
        );
        const totalCost = mockAssets.reduce(
          (sum, asset) => sum + asset.costBasis,
          0,
        );
        const totalChange = totalValue - totalCost;
        const percentChange =
          totalCost > 0 ? (totalChange / totalCost) * 100 : 0;

        setAssetSummary({
          totalValue,
          dailyChange: totalChange,
          percentChange: parseFloat(percentChange.toFixed(2)),
        });

        setIsLoading(false);
      }, 700);
    } catch (error) {
      console.error("獲取資產失敗:", error);
      toast({
        title: "獲取資產失敗",
        description: error.message || "請稍後再試",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 同步資產數據
  const syncAssets = async () => {
    if (!selectedPortfolio) return;

    try {
      setIsLoading(true);
      toast({
        title: "資產同步中",
        description: "正在從交易所同步最新資產數據...",
      });

      // 模擬 API 調用，實際開發時替換為真實 API
      // await axios.post(`http://localhost:8000/api/assets/sync`, { portfolio_id: selectedPortfolio.id });

      // 模擬同步延遲
      setTimeout(() => {
        fetchAssets(selectedPortfolio.id);
        toast({
          title: "資產同步完成",
          description: "已成功同步最新資產數據",
          variant: "success",
        });
      }, 1500);
    } catch (error) {
      console.error("同步資產失敗:", error);
      toast({
        title: "同步資產失敗",
        description: error.message || "請稍後再試",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    fetchPortfolios();
  }, []);

  // 當選擇的資產組合變更時
  useEffect(() => {
    if (selectedPortfolio) {
      fetchAssets(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  // 處理資產組合切換
  const handlePortfolioChange = (portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">資產管理</h1>

      {/* 資產組合選擇器 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">資產組合</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={syncAssets}
            disabled={isLoading || !selectedPortfolio}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                同步中
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                同步資產數據
              </>
            )}
          </Button>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {portfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className={`w-64 cursor-pointer transition-all hover:shadow-md ${
                selectedPortfolio?.id === portfolio.id ? "border-primary" : ""
              }`}
              onClick={() => handlePortfolioChange(portfolio)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                <CardDescription>{portfolio.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}

          {/* 新增資產組合卡片 */}
          <Card
            className="w-64 cursor-pointer border-dashed hover:border-primary hover:shadow-md flex items-center justify-center"
            onClick={() =>
              toast({
                title: "功能開發中",
                description: "新增資產組合功能即將推出",
              })
            }
          >
            <CardContent className="p-4 text-center">
              <span className="text-3xl block mb-2">+</span>
              <span className="text-sm text-muted-foreground">
                新增資產組合
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 資產總覽卡片 */}
      {selectedPortfolio && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>資產總覽</CardTitle>
            <CardDescription>
              {selectedPortfolio.name} 的總資產價值與變動
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">總資產價值</p>
                <h3 className="text-2xl font-bold">
                  ${assetSummary.totalValue.toLocaleString()}
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">總體盈虧</p>
                <h3
                  className={`text-2xl font-bold ${
                    assetSummary.dailyChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {assetSummary.dailyChange >= 0 ? "+" : ""}$
                  {assetSummary.dailyChange.toLocaleString()}
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">收益率</p>
                <h3
                  className={`text-2xl font-bold ${
                    assetSummary.percentChange >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {assetSummary.percentChange >= 0 ? "+" : ""}
                  {assetSummary.percentChange}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 功能標籤頁 */}
      {selectedPortfolio && (
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="overview">資產總覽</TabsTrigger>
            <TabsTrigger value="distribution">資產分佈</TabsTrigger>
            <TabsTrigger value="transactions">交易歷史</TabsTrigger>
            <TabsTrigger value="performance">績效分析</TabsTrigger>
            <TabsTrigger value="reports">報表中心</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <AssetOverview
              assets={assets}
              isLoading={isLoading}
              portfolioId={selectedPortfolio?.id}
            />
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            <AssetDistribution assets={assets} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <TransactionHistory
              portfolioId={selectedPortfolio?.id}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <PerformanceAnalysis
              portfolioId={selectedPortfolio?.id}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportCenter
              portfolioId={selectedPortfolio?.id}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* 無資產組合時顯示提示 */}
      {!isLoading && portfolios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">尚未創建資產組合</h3>
            <p className="text-muted-foreground mb-4">
              創建您的第一個資產組合來開始追蹤您的加密貨幣資產
            </p>
            <Button>創建資產組合</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetManagementPage;
