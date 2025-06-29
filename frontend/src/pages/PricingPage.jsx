import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * 訂閱價格頁面
 * 提供不同訂閱方案的價格和功能比較
 */
const PricingPage = () => {
  // 切換每月/每年計費顯示
  const [isAnnual, setIsAnnual] = useState(false);

  // 計算折扣價格
  const calculatePrice = (monthlyPrice) => {
    if (isAnnual) {
      // 年付方案通常提供 20% 折扣，即 10 個月的價格
      const annualPrice = monthlyPrice * 10;
      return {
        price: annualPrice,
        period: "年",
        monthlyEquivalent: Math.round(annualPrice / 12),
      };
    }
    return {
      price: monthlyPrice,
      period: "月",
      monthlyEquivalent: null,
    };
  };

  // 定義訂閱方案
  const plans = [
    {
      name: "免費版",
      description: "適合初學者和個人投資者",
      price: 0,
      features: [
        { name: "基本市場數據", included: true },
        { name: "手動交易執行", included: true },
        { name: "單一交易所連接", included: true },
        { name: "基本技術指標", included: true },
        { name: "1 個自動化交易策略", included: true },
        { name: "社群支援", included: true },
        { name: "優先客戶服務", included: false },
        { name: "進階技術指標", included: false },
        { name: "多交易所連接", included: false },
        { name: "無限自動化交易策略", included: false },
        { name: "API 數據訪問", included: false },
      ],

      highlight: false,
      buttonText: "開始使用",
      buttonVariant: "outline",
    },
    {
      name: "進階版",
      description: "適合活躍交易者和小型投資組合",
      price: 299,
      features: [
        { name: "基本市場數據", included: true },
        { name: "手動交易執行", included: true },
        { name: "單一交易所連接", included: true },
        { name: "基本技術指標", included: true },
        { name: "5 個自動化交易策略", included: true },
        { name: "社群支援", included: true },
        { name: "優先客戶服務", included: true },
        { name: "進階技術指標", included: true },
        { name: "多交易所連接 (最多 3 個)", included: true },
        { name: "無限自動化交易策略", included: false },
        { name: "API 數據訪問", included: false },
      ],

      highlight: true,
      buttonText: "選擇進階版",
      buttonVariant: "default",
    },
    {
      name: "專業版",
      description: "適合專業交易者和機構投資者",
      price: 799,
      features: [
        { name: "基本市場數據", included: true },
        { name: "手動交易執行", included: true },
        { name: "單一交易所連接", included: true },
        { name: "基本技術指標", included: true },
        { name: "無限自動化交易策略", included: true },
        { name: "社群支援", included: true },
        { name: "優先客戶服務", included: true },
        { name: "進階技術指標", included: true },
        { name: "多交易所連接 (無限制)", included: true },
        { name: "無限自動化交易策略", included: true },
        { name: "API 數據訪問", included: true },
      ],

      highlight: false,
      buttonText: "選擇專業版",
      buttonVariant: "default",
    },
  ];

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      {/* 頁面標題 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          選擇適合您的方案
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
          從免費方案開始，隨時可以升級以獲取更多功能和更強大的交易能力。
        </p>

        {/* 切換按鈕 */}
        <div className="mt-10 flex justify-center items-center space-x-3">
          <Label
            htmlFor="billing-toggle"
            className={!isAnnual ? "font-bold" : "text-muted-foreground"}
          >
            月付方案
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />

          <div className="flex items-center">
            <Label
              htmlFor="billing-toggle"
              className={isAnnual ? "font-bold" : "text-muted-foreground"}
            >
              年付方案
            </Label>
            <span className="ml-2 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              省 20%
            </span>
          </div>
        </div>
      </div>

      {/* 價格卡片 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const pricingDetails =
            plan.price === 0
              ? { price: 0, period: "", monthlyEquivalent: null }
              : calculatePrice(plan.price);

          return (
            <Card
              key={index}
              className={`flex flex-col ${plan.highlight ? "border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10 relative overflow-hidden" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rotate-45 transform translate-x-6 -translate-y-1 shadow-sm">
                    最受歡迎
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <div className="text-4xl font-bold">免費</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        NT$ {pricingDetails.price.toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground">
                          /{pricingDetails.period}
                        </span>
                      </div>
                      {pricingDetails.monthlyEquivalent && (
                        <div className="text-sm text-muted-foreground mt-1">
                          相當於每月 NT${" "}
                          {pricingDetails.monthlyEquivalent.toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.buttonVariant} className="w-full">
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 常見問題 */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-10">常見問題</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">如何選擇適合我的方案？</h3>
            <p className="text-muted-foreground">
              如果您是初學者或只需要基本功能，免費版是個不錯的開始。如果您需要更多交易策略和進階分析工具，建議選擇進階版。專業交易者和機構用戶通常會選擇專業版以獲得最大靈活性。
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">我可以隨時更換方案嗎？</h3>
            <p className="text-muted-foreground">
              是的，您可以隨時升級或降級您的訂閱方案。升級後，您將立即獲得新方案的所有功能，並按比例支付剩餘期間的費用差額。
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">付款方式有哪些？</h3>
            <p className="text-muted-foreground">
              我們接受信用卡、PayPal
              和加密貨幣付款。所有交易都是安全加密的，我們不會儲存您的完整卡號資訊。
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">有退款政策嗎？</h3>
            <p className="text-muted-foreground">
              是的，我們提供 14 天的無條件退款保證。如果您在購買後 14
              天內不滿意，可以聯繫我們的客戶支援團隊獲得全額退款。
            </p>
          </div>
        </div>
      </div>

      {/* 行動召喚 */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">還有其他問題？</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          如果您對訂閱方案有任何疑問，或想了解更多關於功能的詳細信息，請聯繫我們的銷售團隊。
        </p>
        <Button asChild variant="outline" className="mr-4">
          <Link to="/faq">查看更多 FAQ</Link>
        </Button>
        <Button asChild>
          <a href={`mailto:${import.meta.env.VITE_SOCIAL_EMAIL}`}>
            聯繫銷售團隊
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PricingPage;
