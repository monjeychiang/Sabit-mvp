import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const AssetDistribution = ({ assets, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">載入資產分佈數據中...</span>
      </div>
    );
  }

  // 計算資產分佈數據
  const calculateDistribution = () => {
    if (!assets || assets.length === 0) return [];
    
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    return assets.map(asset => ({
      ...asset,
      percentage: parseFloat(((asset.currentValue / totalValue) * 100).toFixed(2))
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const distributionData = calculateDistribution();
  
  // 生成隨機顏色（實際開發時可使用固定的顏色方案）
  const getRandomColor = (index) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-orange-500', 'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div>
      <Tabs defaultValue="by-coin">
        <TabsList className="mb-6">
          <TabsTrigger value="by-coin">按幣種</TabsTrigger>
          <TabsTrigger value="by-exchange">按交易所</TabsTrigger>
          <TabsTrigger value="by-type">按類型</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-coin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 餅圖 */}
            <Card>
              <CardHeader>
                <CardTitle>幣種分佈</CardTitle>
                <CardDescription>各幣種佔總資產的比例</CardDescription>
              </CardHeader>
              <CardContent>
                {distributionData.length > 0 ? (
                  <div className="aspect-square relative flex items-center justify-center">
                    {/* 簡易餅圖（實際開發時使用圖表庫） */}
                    <div className="w-48 h-48 rounded-full overflow-hidden flex flex-wrap">
                      {distributionData.map((asset, index) => (
                        <div 
                          key={asset.id}
                          className={`${getRandomColor(index)}`}
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            clipPath: `conic-gradient(from 0deg, transparent ${index * 100 / distributionData.length}%, currentColor ${index * 100 / distributionData.length}%, currentColor ${(index + 1) * 100 / distributionData.length}%, transparent ${(index + 1) * 100 / distributionData.length}%)` 
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-background rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-muted-foreground">無資產數據</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 列表 */}
            <Card>
              <CardHeader>
                <CardTitle>幣種佔比</CardTitle>
                <CardDescription>各幣種資產價值與佔比</CardDescription>
              </CardHeader>
              <CardContent>
                {distributionData.length > 0 ? (
                  <div className="space-y-4">
                    {distributionData.map((asset, index) => (
                      <div key={asset.id} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getRandomColor(index)} mr-2`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{asset.symbol}</span>
                            <span>{asset.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getRandomColor(index)}`} 
                              style={{ width: `${asset.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-muted-foreground">無資產數據</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="by-exchange">
          <Card>
            <CardHeader>
              <CardTitle>交易所分佈</CardTitle>
              <CardDescription>各交易所資產分佈情況</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">交易所分佈資料（開發中）</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="by-type">
          <Card>
            <CardHeader>
              <CardTitle>資產類型分佈</CardTitle>
              <CardDescription>按資產類型（現貨/合約/理財等）的分佈</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">資產類型分佈資料（開發中）</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 風險評估卡片 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>投資組合風險評估</CardTitle>
          <CardDescription>資產組合的風險指標與評估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">波動率</h4>
              <p className="text-2xl font-bold">12.4%</p>
              <p className="text-xs text-muted-foreground">過去 30 天</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">最大回撤</h4>
              <p className="text-2xl font-bold">18.7%</p>
              <p className="text-xs text-muted-foreground">過去 30 天</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">風險評級</h4>
              <p className="text-2xl font-bold">中等</p>
              <p className="text-xs text-muted-foreground">基於資產配置與市場表現</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDistribution; 