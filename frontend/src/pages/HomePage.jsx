import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                SABIT-LOCAL
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                本地加密貨幣自動化交易工具，安全、高效、易用
              </p>
            </div>
            <div className="space-x-4">
              <Link to="/exchange-keys">
                <Button>開始使用</Button>
              </Link>
              <Link to="/trading">
                <Button variant="outline">交易操作</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <CardTitle>市場數據分析</CardTitle>
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
                <Link to="/trading" className="w-full">
                  <Button variant="outline" className="w-full">查看詳情</Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>交易策略管理</CardTitle>
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
                <Link to="/trading" className="w-full">
                  <Button variant="outline" className="w-full">查看詳情</Button>
                </Link>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>自動化交易執行</CardTitle>
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
                <Link to="/trading" className="w-full">
                  <Button variant="outline" className="w-full">查看詳情</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">安全與隱私</h2>
              <p className="text-gray-500 dark:text-gray-400">
                SABIT-LOCAL 完全在本地運行，您的 API 密鑰和交易數據都經過加密存儲在本地數據庫中，不會上傳到任何外部服務器。
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">高效能設計</h2>
              <p className="text-gray-500 dark:text-gray-400">
                採用多核心處理與非同步技術，充分利用現代硬體資源，提供高效能的交易體驗。即使在處理大量數據和複雜策略時，也能保持流暢運行。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">準備好開始交易了嗎？</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mb-8">
            添加您的交易所 API 密鑰，立即開始使用 SABIT-LOCAL 進行自動化交易
          </p>
          <Link to="/exchange-keys">
            <Button size="lg">立即開始</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 