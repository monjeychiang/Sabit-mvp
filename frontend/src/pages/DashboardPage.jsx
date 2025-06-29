import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TechCard } from "@/components/ui/tech-card";
import DataFlow from "@/components/ui/data-flow";
import { Logo } from "@/components/ui/logo";

const DashboardPage = () => {
  return (
    <div className="w-full px-4 py-8 relative overflow-hidden">
      <section className="py-6 md:py-10 w-full">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center mb-6">
            <Logo size="medium" withText={false} />
            <h1 className="text-3xl font-bold tracking-tighter ml-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              操作中心
            </h1>
          </div>
          <p className="max-w-[700px] text-gray-500 dark:text-gray-400 mb-8">
            歡迎使用 SABIT 操作中心，您可以在這裡管理交易所 API
            密鑰、設置交易策略、執行自動化交易等操作。
          </p>
        </div>
      </section>

      <section className="py-6 md:py-10 w-full">
        <div className="w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="animate-scale-in" style={{ animationDelay: "0ms" }}>
              <TechCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">API 密鑰管理</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>管理您的交易所 API 密鑰</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>添加新的交易所 API 密鑰</li>
                    <li>查看和編輯現有密鑰</li>
                    <li>安全加密存儲</li>
                    <li>權限管理與測試</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/exchange-keys" className="w-full">
                    <Button variant="default" className="w-full">
                      進入管理
                    </Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>

            <div
              className="animate-scale-in"
              style={{ animationDelay: "100ms" }}
            >
              <TechCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">交易策略</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>管理自動化交易策略</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>創建自定義交易策略</li>
                    <li>使用策略模板快速開始</li>
                    <li>進行策略回測與優化</li>
                    <li>查看策略績效分析</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/trading" className="w-full">
                    <Button variant="default" className="w-full">
                      進入策略
                    </Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>

            <div
              className="animate-scale-in"
              style={{ animationDelay: "200ms" }}
            >
              <TechCard>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">自動交易</span>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                  </CardTitle>
                  <CardDescription>執行與監控自動化交易</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>啟動自動化交易執行</li>
                    <li>即時監控交易狀態</li>
                    <li>設置風險管理參數</li>
                    <li>查看交易執行報告</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/trading" className="w-full">
                    <Button variant="default" className="w-full">
                      進入交易
                    </Button>
                  </Link>
                </CardFooter>
              </TechCard>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-10 w-full">
        <div className="w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div
              className="space-y-4 animate-scale-in"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-2xl font-bold tracking-tighter flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
                  系統狀態
                </span>
                <div className="w-3 h-3 rounded-full bg-blue-500 ml-2 animate-pulse"></div>
              </h2>
              <div className="relative h-40 mb-4">
                <DataFlow className="absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/30 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400 p-4">
                    <div className="flex justify-between mb-2">
                      <span>CPU 使用率:</span>
                      <span>32%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>記憶體使用率:</span>
                      <span>1.2GB / 8GB</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>活動策略:</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運行時間:</span>
                      <span>2小時 35分鐘</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="space-y-4 animate-scale-in"
              style={{ animationDelay: "400ms" }}
            >
              <h2 className="text-2xl font-bold tracking-tighter flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-400">
                  最近交易
                </span>
                <div className="w-3 h-3 rounded-full bg-purple-500 ml-2 animate-pulse"></div>
              </h2>
              <div className="relative h-40 mb-4">
                <DataFlow className="absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/30 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400 p-4 w-full">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2">
                      <span>BTC/USDT</span>
                      <span className="text-green-500">買入 0.05 BTC</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2">
                      <span>ETH/USDT</span>
                      <span className="text-red-500">賣出 1.2 ETH</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>SOL/USDT</span>
                      <span className="text-green-500">買入 10 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
