import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCcw } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

// 取得 API base url（從 .env 設定，預設為 http://localhost:8000）
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// 訂閱表單驗證架構
const subscribeFormSchema = z.object({
  symbols: z.array(z.string()).min(1, "必須選擇至少一個交易對"),
  marketType: z.string().default("spot"),
});

const PriceMonitorPage = () => {
  const [priceData, setPriceData] = useState({});
  const [subscriptions, setSubscriptions] = useState({});
  const [exchangeStatus, setExchangeStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 預設5秒刷新一次
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [availableSymbols, setAvailableSymbols] = useState({});
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState([]);
  const [symbolInputValue, setSymbolInputValue] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState([]); // 儲存已選擇的交易對
  const { toast } = useToast();

  // 初始化表單
  const subscribeForm = useForm({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      symbols: [],
      marketType: "spot", // 預設值為現貨
    },
  });

  // 支持的交易所
  const SUPPORTED_EXCHANGES = ["binance", "okx"];

  // 獲取所有可用交易對
  const fetchAvailableSymbols = async (marketType) => {
    setLoadingSymbols(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/price/symbols/${marketType}`,
      );
      if (response.data.success) {
        setAvailableSymbols(response.data.symbols || {});

        // 合併所有交易所的交易對，並去重
        const allSymbols = [];
        Object.values(response.data.symbols).forEach((symbols) => {
          symbols.forEach((symbol) => {
            if (!allSymbols.includes(symbol)) {
              allSymbols.push(symbol);
            }
          });
        });

        // 按字母順序排序
        allSymbols.sort();

        // 直接顯示所有交易對，而不是只顯示常用交易對
        setFilteredSymbols(allSymbols);

        console.log(`已載入 ${allSymbols.length} 個交易對`);
      }
    } catch (error) {
      console.error("獲取可用交易對失敗:", error);
      toast({
        title: "錯誤",
        description: "獲取可用交易對失敗",
        variant: "destructive",
      });
    } finally {
      setLoadingSymbols(false);
    }
  };

  // 監聽市場類型變更
  useEffect(() => {
    const subscription = subscribeForm.watch((value, { name }) => {
      if (name === "marketType") {
        fetchAvailableSymbols(value.marketType);
      }
    });

    return () => subscription.unsubscribe();
  }, [subscribeForm.watch]);

  // 初始加載時獲取交易對
  useEffect(() => {
    fetchAvailableSymbols(subscribeForm.getValues("marketType"));
  }, []);

  // 修改篩選交易對函數
  const handleSymbolFilter = (inputValue) => {
    setSymbolInputValue(inputValue);

    if (!inputValue || inputValue.trim() === "") {
      // 如果沒有輸入值，顯示所有交易對
      const allSymbols = [];
      Object.values(availableSymbols).forEach((symbols) => {
        symbols.forEach((symbol) => {
          if (!allSymbols.includes(symbol)) {
            allSymbols.push(symbol);
          }
        });
      });

      // 按字母順序排序
      allSymbols.sort();

      setFilteredSymbols(allSymbols);
      return;
    }

    // 其餘篩選邏輯保持不變
    const input = inputValue.toLowerCase().trim();
    const mergedSymbols = [];

    // 從所有交易所合併交易對
    Object.values(availableSymbols).forEach((symbols) => {
      symbols.forEach((symbol) => {
        if (
          !mergedSymbols.includes(symbol) &&
          symbol.toLowerCase().includes(input)
        ) {
          mergedSymbols.push(symbol);
        }
      });
    });

    // 先顯示精確匹配的結果
    const exactMatches = mergedSymbols.filter(
      (symbol) =>
        symbol.toLowerCase().startsWith(input) ||
        symbol.toLowerCase().includes(`/${input}`),
    );

    // 再顯示部分匹配的結果
    const partialMatches = mergedSymbols.filter(
      (symbol) =>
        !exactMatches.includes(symbol) && symbol.toLowerCase().includes(input),
    );

    // 合併結果，確保精確匹配優先顯示
    const sortedSymbols = [...exactMatches, ...partialMatches];

    // 設置完整的篩選結果
    setFilteredSymbols(sortedSymbols);
  };

  // 優化處理符號選擇的函數
  const handleSymbolSelect = (symbol) => {
    console.log("處理交易對選擇:", symbol);

    // 如果沒有提供有效的交易對，則返回
    if (!symbol || symbol === "") {
      console.warn("無效的交易對選擇");
      return;
    }

    try {
      // 獲取當前已選交易對
      const currentSymbols = subscribeForm.getValues("symbols") || [];

      // 檢查是否已經選擇了這個交易對
      if (currentSymbols.includes(symbol)) {
        console.log("交易對已存在於選擇列表中:", symbol);
        toast({
          title: "注意",
          description: `交易對 ${symbol} 已在選擇列表中`,
          variant: "default",
        });
        return;
      }

      // 添加新選擇的交易對
      console.log("添加新交易對到選擇列表:", symbol);
      const newSelectedSymbols = [...selectedSymbols, symbol];
      setSelectedSymbols(newSelectedSymbols);
      subscribeForm.setValue("symbols", [...currentSymbols, symbol]);

      // 顯示成功提示
      toast({
        title: "已添加",
        description: `已將 ${symbol} 添加到選擇列表`,
        variant: "default",
      });
    } catch (error) {
      console.error("添加交易對時出錯:", error);
      toast({
        title: "錯誤",
        description: "添加交易對失敗，請重試",
        variant: "destructive",
      });
    }
  };

  // 移除已選擇的交易對
  const removeSelectedSymbol = (symbol) => {
    const currentSymbols = subscribeForm.getValues("symbols");
    const filteredSymbols = currentSymbols.filter((s) => s !== symbol);
    setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    subscribeForm.setValue("symbols", filteredSymbols);
  };

  // 獲取所有訂閱
  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/price/subscriptions`,
      );
      if (response.data.success) {
        setSubscriptions(response.data.subscriptions || {});
      }
    } catch (error) {
      console.error("獲取訂閱列表失敗:", error);
      toast({
        title: "錯誤",
        description: "獲取訂閱列表失敗",
        variant: "destructive",
      });
    }
  };

  // 獲取服務狀態
  const fetchServiceStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/price/status`);
      if (response.data.success) {
        setExchangeStatus(response.data.status || {});
      }
    } catch (error) {
      console.error("獲取服務狀態失敗:", error);
      toast({
        title: "錯誤",
        description: "獲取服務狀態失敗",
        variant: "destructive",
      });
    }
  };

  // 獲取所有已訂閱交易對的價格
  const fetchAllPrices = async () => {
    if (!Object.keys(subscriptions).length) return;

    const newPriceData = { ...priceData };

    for (const symbol of Object.keys(subscriptions)) {
      try {
        // 處理 URL 路徑中的 '/'
        const [base, quote] = symbol.split("/");
        const response = await axios.get(
          `${API_BASE_URL}/api/price/latest/${base}/${quote}`,
        );
        newPriceData[symbol] = response.data;
      } catch (error) {
        console.error(`獲取${symbol}價格失敗:`, error);
      }
    }

    setPriceData(newPriceData);
  };

  // 訂閱交易對
  const handleSubscribe = async (data) => {
    if (data.symbols.length === 0) {
      toast({
        title: "錯誤",
        description: "請選擇至少一個交易對進行訂閱",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 為每個選擇的交易對創建訂閱請求
      const subscribePromises = data.symbols.map((symbol) =>
        axios.post(`${API_BASE_URL}/api/price/subscribe`, {
          symbol: symbol,
          exchanges: SUPPORTED_EXCHANGES, // 使用所有支持的交易所
          marketType: data.marketType,
        }),
      );

      const results = await Promise.all(subscribePromises);

      // 檢查結果
      const allSuccess = results.every((response) => response.data.success);

      if (allSuccess) {
        toast({
          title: "訂閱成功",
          description: `已成功訂閱 ${data.symbols.length} 個交易對`,
        });
      } else {
        toast({
          title: "部分訂閱失敗",
          description: "部分交易對訂閱失敗，請檢查日誌",
          variant: "warning",
        });
      }

      // 清空選擇
      setSelectedSymbols([]);
      subscribeForm.setValue("symbols", []);

      // 刷新訂閱列表
      fetchSubscriptions();
    } catch (error) {
      console.error("訂閱失敗:", error);
      toast({
        title: "訂閱失敗",
        description: error.response?.data?.detail || "訂閱請求失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 取消訂閱交易對
  const handleUnsubscribe = async (symbol, exchange = null) => {
    setIsLoading(true);
    try {
      // 準備請求參數
      const requestData = {
        symbol,
      };

      // 如果指定了交易所，則添加到請求中
      if (exchange) {
        requestData.exchanges = [exchange];
      }

      // 發送取消訂閱請求
      const response = await axios.post(
        `${API_BASE_URL}/api/price/unsubscribe`,
        requestData,
      );

      if (response.data.success) {
        toast({
          title: "取消訂閱成功",
          description: `已取消訂閱 ${symbol}${exchange ? ` (${exchange})` : ""}`,
        });

        // 從價格數據中移除
        const newPriceData = { ...priceData };
        delete newPriceData[symbol];
        setPriceData(newPriceData);

        // 刷新訂閱列表
        fetchSubscriptions();
      } else {
        toast({
          title: "取消訂閱失敗",
          description: response.data.message || "請求未成功完成",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("取消訂閱失敗:", error);
      toast({
        title: "取消訂閱失敗",
        description: error.response?.data?.detail || "取消訂閱請求失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    fetchSubscriptions();
    fetchServiceStatus();

    return () => {
      // 組件卸載時清理所有計時器
      if (window.priceRefreshTimer) {
        clearInterval(window.priceRefreshTimer);
      }
    };
  }, []);

  // 監控訂閱變化，更新價格
  useEffect(() => {
    if (Object.keys(subscriptions).length > 0) {
      fetchAllPrices();
    }
  }, [subscriptions]);

  // 設置自動刷新
  useEffect(() => {
    if (window.priceRefreshTimer) {
      clearInterval(window.priceRefreshTimer);
    }

    if (
      autoRefresh &&
      refreshInterval > 0 &&
      Object.keys(subscriptions).length > 0
    ) {
      console.log(`設置自動刷新，間隔 ${refreshInterval}ms`);
      window.priceRefreshTimer = setInterval(() => {
        console.log("自動刷新價格數據");
        fetchAllPrices();
      }, refreshInterval);
    }

    return () => {
      if (window.priceRefreshTimer) {
        clearInterval(window.priceRefreshTimer);
      }
    };
  }, [autoRefresh, refreshInterval, subscriptions]);

  // 格式化時間戳
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  // 優化顯示全部交易對的函數
  const handleShowAllSymbols = () => {
    // 根據當前市場類型獲取所有交易對
    const marketType = subscribeForm.getValues("marketType");
    setLoadingSymbols(true);

    try {
      // 合併所有交易所的交易對，並去重
      const allSymbols = [];
      Object.values(availableSymbols).forEach((symbols) => {
        symbols.forEach((symbol) => {
          if (!allSymbols.includes(symbol)) {
            allSymbols.push(symbol);
          }
        });
      });

      // 按字母順序排序
      allSymbols.sort();

      // 設置篩選結果為所有交易對
      setFilteredSymbols(allSymbols);

      // 顯示提示
      toast({
        title: "已載入所有交易對",
        description: `共載入 ${allSymbols.length} 個交易對，請在下拉列表中選擇`,
        variant: "default",
      });
    } catch (error) {
      console.error("載入所有交易對失敗:", error);
      toast({
        title: "錯誤",
        description: "載入所有交易對失敗",
        variant: "destructive",
      });
    } finally {
      setLoadingSymbols(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        價格監控系統
      </h1>

      <div className="mb-4 sm:mb-6 bg-muted p-3 sm:p-4 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-2">使用說明</h2>
        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
          <li>選擇市場類型（現貨、期貨或永續合約）</li>
          <li>從下拉選單中選擇多個交易對進行監控</li>
          <li>可使用搜尋功能快速找到所需交易對</li>
          <li>所有交易對會同時監控 Binance 和 OKX 兩個交易所</li>
          <li>支持自動刷新價格數據，可自訂刷新間隔</li>
        </ul>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* 左側：訂閱表單和服務狀態 */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>多交易對訂閱</CardTitle>
              <CardDescription>
                選擇需要監控的市場類型和多個交易對
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...subscribeForm}>
                <form
                  onSubmit={subscribeForm.handleSubmit(handleSubscribe)}
                  className="space-y-4"
                >
                  <FormField
                    control={subscribeForm.control}
                    name="marketType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>交易類型</FormLabel>
                          <Badge variant="outline" className="text-xs">
                            {field.value === "spot" && "現貨"}
                            {field.value === "futures" && "幣安合約"}
                            {field.value === "swap" && "OKX永續合約"}
                            {": "}
                            {Object.values(availableSymbols).reduce(
                              (total, symbols) => total + symbols.length,
                              0,
                            )}{" "}
                            個交易對
                          </Badge>
                        </div>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // 清空已選擇的交易對，因為市場類型改變後應該重新選擇
                            setSelectedSymbols([]);
                            subscribeForm.setValue("symbols", []);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus:ring-2 focus:ring-offset-2 focus:ring-ring">
                              <SelectValue placeholder="選擇交易類型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="spot">現貨</SelectItem>
                            <SelectItem value="futures">幣安合約</SelectItem>
                            <SelectItem value="swap">OKX永續合約</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>選擇現貨或合約交易</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subscribeForm.control}
                    name="symbols"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>交易對選擇</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="relative">
                              {loadingSymbols && (
                                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10">
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <div className="w-full">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs text-muted-foreground">
                                      下拉選單中已顯示所有交易對，可直接選擇或使用搜尋功能
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-secondary/20"
                                    >
                                      總計:{" "}
                                      {Object.values(availableSymbols).reduce(
                                        (total, symbols) =>
                                          total + symbols.length,
                                        0,
                                      )}{" "}
                                      個交易對
                                    </Badge>
                                  </div>
                                  <Combobox
                                    items={filteredSymbols.map((symbol) => ({
                                      value: symbol,
                                      label: symbol,
                                    }))}
                                    onValueChange={(value) => {
                                      console.log(
                                        "Combobox 觸發選擇事件:",
                                        value,
                                      );
                                      if (value) {
                                        handleSymbolSelect(value);
                                      }
                                    }}
                                    onInputChange={(value) => {
                                      console.log("Combobox 輸入變更:", value);
                                      handleSymbolFilter(value);
                                    }}
                                    placeholder="搜尋交易對..."
                                    showSelectedItem={false}
                                    className="w-full focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
                                    value=""
                                    disabled={loadingSymbols}
                                    emptyMessage={
                                      symbolInputValue
                                        ? "找不到符合的交易對"
                                        : "所有交易對已顯示，可直接選擇"
                                    }
                                  />

                                  {symbolInputValue && (
                                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                      <span>
                                        {filteredSymbols.length === 0
                                          ? "找不到符合的交易對，請嘗試其他關鍵字"
                                          : `找到 ${filteredSymbols.length} 個符合的交易對`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      fetchAvailableSymbols(
                                        subscribeForm.getValues("marketType"),
                                        true,
                                      )
                                    }
                                    disabled={loadingSymbols}
                                    className="whitespace-nowrap hover:bg-primary/10"
                                  >
                                    {loadingSymbols ? (
                                      <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />{" "}
                                        載入中
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCcw className="mr-1 h-3 w-3" />{" "}
                                        刷新列表
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* 顯示已選交易對 */}
                            <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/30 rounded-md border border-dashed">
                              {selectedSymbols.length > 0 && (
                                <div className="mb-2 w-full flex justify-between items-center">
                                  <div className="text-sm font-medium flex items-center">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs mr-2">
                                      {selectedSymbols.length}
                                    </span>
                                    已選交易對
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSymbols([]);
                                      subscribeForm.setValue("symbols", []);
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    清空選擇
                                  </Button>
                                </div>
                              )}
                              {selectedSymbols.map((symbol) => (
                                <Badge
                                  key={symbol}
                                  variant="secondary"
                                  className="px-3 py-1 hover:bg-secondary/80 transition-colors"
                                >
                                  {symbol}
                                  <button
                                    type="button"
                                    className="ml-1 text-xs hover:text-destructive transition-colors"
                                    onClick={() => removeSelectedSymbol(symbol)}
                                    aria-label={`移除 ${symbol}`}
                                  >
                                    ✕
                                  </button>
                                </Badge>
                              ))}
                              {selectedSymbols.length === 0 && (
                                <div className="text-sm text-muted-foreground flex items-center justify-center w-full py-4">
                                  <span className="mr-2">⚠️</span>{" "}
                                  尚未選擇交易對，請從上方選擇
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          從下拉選單選擇多個交易對，每個交易對都會使用所有支持的交易所
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        訂閱處理中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        訂閱所選交易對
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <span className="mr-2">🔌</span> 服務狀態
              </CardTitle>
              <CardDescription>
                查看交易所連接狀態與設置自動刷新
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/20 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                    交易所連接狀態
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(exchangeStatus).map(([key, connected]) => (
                      <div
                        key={key}
                        className="flex items-center p-2 bg-background rounded-md shadow-sm"
                      >
                        <Badge
                          variant={connected ? "success" : "destructive"}
                          className="mr-2"
                        >
                          {connected ? "已連接" : "未連接"}
                        </Badge>
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                    {Object.keys(exchangeStatus).length === 0 && (
                      <p className="text-muted-foreground text-sm p-2">
                        暫無連接資訊
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/20 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                    自動刷新設置
                  </h3>
                  <div className="flex items-center space-x-2 mb-3 p-2 bg-background rounded-md">
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="checkbox"
                        id="autoRefresh"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />

                      <label htmlFor="autoRefresh" className="text-sm">
                        啟用自動刷新
                      </label>
                    </div>
                    <Select
                      value={String(refreshInterval)}
                      onValueChange={(value) =>
                        setRefreshInterval(Number(value))
                      }
                      disabled={!autoRefresh}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="刷新間隔" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1秒</SelectItem>
                        <SelectItem value="3000">3秒</SelectItem>
                        <SelectItem value="5000">5秒</SelectItem>
                        <SelectItem value="10000">10秒</SelectItem>
                        <SelectItem value="30000">30秒</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2 justify-end">
                  <Button
                    onClick={fetchServiceStatus}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RefreshCcw className="mr-1 h-3 w-3" /> 刷新狀態
                  </Button>
                  <Button
                    onClick={fetchAllPrices}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-primary/10"
                  >
                    手動刷新價格
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側：價格顯示 */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl text-primary">價格監控</CardTitle>
                <CardDescription>已訂閱交易對的實時價格</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {Object.keys(subscriptions).length} 個交易對
              </Badge>
            </CardHeader>
            <CardContent>
              {Object.keys(subscriptions).length === 0 ? (
                <Alert className="bg-muted/50">
                  <AlertTitle className="flex items-center">
                    <span className="mr-2">📊</span> 尚未訂閱任何交易對
                  </AlertTitle>
                  <AlertDescription>
                    請在左側表單中訂閱交易對以開始監控價格
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-medium">交易對</TableHead>
                        <TableHead className="font-medium">交易所</TableHead>
                        <TableHead className="font-medium">市場類型</TableHead>
                        <TableHead className="font-medium">最新價格</TableHead>
                        <TableHead className="font-medium">更新時間</TableHead>
                        <TableHead className="font-medium">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(subscriptions).map(
                        ([symbol, exchanges]) =>
                          exchanges.map((exchange) => {
                            const price = priceData[symbol]?.prices?.[exchange];
                            const timestamp = priceData[symbol]?.timestamp;
                            const marketType =
                              priceData[symbol]?.marketTypes?.[exchange] ||
                              "spot";

                            // 市場類型中文顯示
                            const marketTypeText =
                              {
                                spot: "現貨",
                                futures: "期貨",
                                swap: "永續",
                              }[marketType] || "現貨";

                            // 判斷是否為最近更新（30秒內）
                            const isRecentUpdate =
                              timestamp && Date.now() / 1000 - timestamp < 30;

                            return (
                              <TableRow
                                key={`${symbol}-${exchange}`}
                                className="hover:bg-muted/20"
                              >
                                <TableCell className="font-medium">
                                  {symbol}
                                </TableCell>
                                <TableCell>{exchange}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {marketTypeText}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {price ? (
                                    <span
                                      className={
                                        isRecentUpdate ? "text-primary" : ""
                                      }
                                    >
                                      {price.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground flex items-center">
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />{" "}
                                      載入中...
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {timestamp ? (
                                    <span
                                      className={
                                        isRecentUpdate
                                          ? "text-primary text-xs"
                                          : "text-xs"
                                      }
                                    >
                                      {formatTimestamp(timestamp)}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleUnsubscribe(symbol, exchange)
                                    }
                                    className="hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    取消
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          }),
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 添加一個快速選擇常用交易對的部分 */}
      <div className="mt-6 bg-muted/20 p-4 rounded-lg border">
        <div className="text-sm font-medium mb-3 flex items-center">
          <span className="mr-2">⭐</span> 快速選擇熱門交易對
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            "BTC/USDT",
            "ETH/USDT",
            "SOL/USDT",
            "BNB/USDT",
            "XRP/USDT",
            "ADA/USDT",
            "DOGE/USDT",
            "AVAX/USDT",
          ].map((symbol) => (
            <Button
              key={symbol}
              variant="outline"
              size="sm"
              className="text-xs py-1 justify-start hover:bg-primary/10 transition-colors"
              onClick={() => {
                console.log("快速選擇按鈕點擊:", symbol);
                handleSymbolSelect(symbol);
              }}
            >
              {symbol}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceMonitorPage;
