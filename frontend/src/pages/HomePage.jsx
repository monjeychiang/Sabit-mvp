import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TechCard } from "@/components/ui/tech-card";
import { Typewriter } from "@/components/ui/typewriter";
import GridBackground from "@/components/ui/grid-background";
import DataFlow from "@/components/ui/data-flow";
import { Logo } from "@/components/ui/logo";

const HomePage = () => {
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    // 依序顯示各元素
    setTimeout(() => setShowTitle(true), 300);
    setTimeout(() => setShowSubtitle(true), 1500);
    setTimeout(() => setShowButtons(true), 2500);
    setTimeout(() => setShowCards(true), 3000);
  }, []);

  return (
    <div className="w-full px-4 py-8 relative overflow-hidden">
      {/* 背景網格動畫 */}
      <GridBackground />

      <section className="py-12 md:py-24 lg:py-32 w-full relative">
        <div className="w-full px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              {showTitle ? (
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl animate-fade-in">
                  <Typewriter 
                    text="SABIT" 
                    delay={80}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400"
                  />
                </h1>
              ) : (
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl opacity-0">
                  SABIT
                </h1>
              )}
              
              {showSubtitle ? (
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 animate-fade-in">
                  本地加密貨幣自動化交易工具，安全、高效、易用
                </p>
              ) : (
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 opacity-0">
                  本地加密貨幣自動化交易工具，安全、高效、易用
                </p>
              )}
            </div>
            
            <div className={`space-x-4 transition-opacity duration-500 ${showButtons ? 'opacity-100' : 'opacity-0'}`}>
              <Link to="/dashboard">
                <Button className="animate-pulse-glow">開始使用</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="backdrop-blur-sm">進入操作中心</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`py-12 md:py-24 lg:py-32 w-full transition-opacity duration-500 ${showCards ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="animate-slide-in-left" style={{ animationDelay: '0ms' }}>
              <TechCard glowColor="rgba(59, 130, 246, 0.5)" borderColor="hsl(213, 94%, 60%)">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">市場數據分析</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>即時獲取與分析加密貨幣市場數據</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>多時間週期價格走勢圖表</li>
                    <li>主要技術指標計算與顯示</li>
                    <li>市場深度與成交量分析</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">查看詳情</Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>
            
            <div className="animate-slide-in-left" style={{ animationDelay: '200ms' }}>
              <TechCard glowColor="rgba(16, 185, 129, 0.5)" borderColor="hsl(160, 84%, 39%)">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">交易策略管理</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>創建與管理自動化交易策略</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>自定義交易策略創建與編輯</li>
                    <li>內建常用交易策略模板</li>
                    <li>策略回測與優化</li>
                    <li>基於機器學習的市場預測模型</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">查看詳情</Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>
            
            <div className="animate-slide-in-left" style={{ animationDelay: '400ms' }}>
              <TechCard glowColor="rgba(236, 72, 153, 0.5)" borderColor="hsl(330, 86%, 60%)">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">自動化交易執行</span>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>安全可靠的自動化交易執行系統</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>基於策略的自動交易執行</li>
                    <li>風險管理與止損設置</li>
                    <li>交易執行報告與分析</li>
                    <li>多交易所 API 整合</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">查看詳情</Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 w-full">
        <div className="w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4 animate-scale-in">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">安全與隱私</span>
                <div className="w-3 h-3 rounded-full bg-blue-500 ml-2 animate-pulse"></div>
              </h2>
              <div className="relative h-40 mb-4">
                <DataFlow className="absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/30 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 p-4">
                    SABIT 完全在本地運行，您的 API 密鑰和交易數據都經過加密存儲在本地數據庫中，不會上傳到任何外部服務器。
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-400">高效能設計</span>
                <div className="w-3 h-3 rounded-full bg-purple-500 ml-2 animate-pulse"></div>
              </h2>
              <div className="relative h-40 mb-4">
                <DataFlow className="absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/30 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 p-4">
                    採用多核心處理與非同步技術，充分利用現代硬體資源，提供高效能的交易體驗。即使在處理大量數據和複雜策略時，也能保持流暢運行。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50 w-full relative overflow-hidden">
        <div className="w-full px-4 md:px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4 animate-float">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              準備好開始交易了嗎？
            </span>
          </h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mb-8">
            添加您的交易所 API 密鑰，立即開始使用 SABIT 進行自動化交易
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="animate-pulse-glow">進入操作中心</Button>
          </Link>
        </div>
        
        {/* 背景效果 */}
        <div className="absolute inset-0 opacity-10">
          <DataFlow />
        </div>
      </section>
    </div>
  );
};

export default HomePage; 