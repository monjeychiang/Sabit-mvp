import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * 常見問題頁面
 * 使用手風琴組件展示常見問題與解答
 */
const FAQPage = () => {
  // 常見問題數據
  const faqItems = [
    {
      question: "SABIT 是什麼？",
      answer:
        "SABIT 是一個加密貨幣自動化交易工具，旨在幫助用戶更輕鬆地管理和執行加密貨幣交易策略。它提供了直觀的界面、強大的分析工具和自動化交易功能，適合各種經驗水平的交易者使用。",
    },
    {
      question: "如何開始使用 SABIT？",
      answer:
        "要開始使用 SABIT，首先需要註冊一個帳戶，然後在「交易所密鑰」頁面添加您的交易所 API 密鑰。添加密鑰後，您可以開始設置交易策略，或使用預設的策略模板。完成設置後，您可以在儀表板上監控您的交易活動和資產表現。",
    },
    {
      question: "SABIT 支持哪些交易所？",
      answer:
        "SABIT 目前支持多家主流加密貨幣交易所，包括 Binance、Coinbase Pro、Kraken、Huobi 和 OKEx 等。我們會持續增加更多交易所的支持，以滿足用戶的需求。",
    },
    {
      question: "我的 API 密鑰安全嗎？",
      answer:
        "保護用戶的 API 密鑰安全是我們的首要任務。所有 API 密鑰都經過加密存儲，且僅在執行交易時使用。我們建議用戶創建僅具有交易權限的 API 密鑰（不包括提款權限），以增加安全性。此外，SABIT 是一個本地運行的應用程序，您的密鑰不會傳輸到外部服務器。",
    },
    {
      question: "SABIT 的交易策略是如何工作的？",
      answer:
        "SABIT 提供了多種預設的交易策略模板，包括網格交易、趨勢跟蹤、套利等。您可以根據自己的需求調整這些策略的參數，或者創建完全自定義的策略。系統會根據您設置的策略規則，自動監控市場並執行交易。",
    },
    {
      question: "如何監控我的交易績效？",
      answer:
        "在「儀表板」和「資產管理」頁面，您可以查看詳細的交易績效報告，包括盈虧分析、交易歷史、資產分配等。系統還提供了各種圖表和視覺化工具，幫助您更直觀地了解您的交易表現。",
    },
    {
      question: "SABIT 是否收費？",
      answer:
        "SABIT 目前處於開發階段，提供免費使用。未來可能會推出高級功能的付費訂閱計劃，但核心功能將保持免費。我們致力於提供高性價比的交易工具，幫助用戶在加密貨幣市場中取得成功。",
    },
    {
      question: "如果遇到問題，如何獲取支援？",
      answer:
        "如果您在使用過程中遇到任何問題，可以通過以下方式獲取支援：查閱文檔和教程、在 GitHub 上提交問題、加入我們的 Discord 社群或發送電子郵件至支援團隊。我們的團隊會盡快回應並解決您的問題。",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          常見問題
        </h1>
        <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
          我們收集了用戶最常問的問題及其解答。如果您沒有找到您要尋找的答案，請隨時聯繫我們的支援團隊。
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-medium px-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">還有其他問題？</h2>
        <p className="text-muted-foreground mb-6">
          如果您的問題未在上面列出，請隨時聯繫我們的支援團隊。
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href={import.meta.env.VITE_SOCIAL_DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            加入 Discord 社群
          </a>
          <a
            href={`mailto:${import.meta.env.VITE_SOCIAL_EMAIL}`}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            發送郵件
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
