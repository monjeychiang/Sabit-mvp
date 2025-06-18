import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// 取得 API base url（從 .env 設定，預設為 http://localhost:8000）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 訂單表單驗證架構
const orderFormSchema = z.object({
  key_id: z.string().min(1, "必須選擇交易所"),
  symbol: z.string().min(1, "必須提供交易對"),
  order_type: z.string().min(1, "必須選擇訂單類型"),
  side: z.string().min(1, "必須選擇交易方向"),
  position_side: z.string().optional(),  // 持倉方向（合約模式使用）
  amount: z.string().min(1, "必須提供數量")
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, "數量必須大於 0"),
  price: z.string()
    .transform(val => val ? parseFloat(val) : undefined)
    .refine(val => val === undefined || (!isNaN(val) && val > 0), "價格必須大於 0")
    .optional(),
});

// 槓桿表單驗證架構
const leverageFormSchema = z.object({
  key_id: z.string().min(1, "必須選擇交易所"),
  symbol: z.string().min(1, "必須提供交易對")
    .refine(val => val.includes('-PERP') || val.includes('USDT-SWAP') || val.includes(':') || tradingMode === "contract", 
    "請使用合約交易對格式，例如：BTC/USDT:USDT 或 BTC-PERP"),
  leverage: z.string().min(1, "必須提供槓桿倍數")
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 125, "槓桿倍數必須在 1-125 之間"),
});

const TradingPage = () => {
  const [keys, setKeys] = useState([]);
  const [positions, setPositions] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tradingMode, setTradingMode] = useState("spot"); // 預設為現貨模式: spot 或 contract
  const [currentLeverage, setCurrentLeverage] = useState(20); // 預設槓桿倍數
  const [isSettingLeverage, setIsSettingLeverage] = useState(false);
  const [positionMode, setPositionMode] = useState("one-way"); // 預設單向持倉模式: one-way 或 hedge
  const { toast } = useToast();

  // 初始化訂單表單
  const orderForm = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      key_id: "",
      symbol: "",
      order_type: "limit",
      side: "buy",
      position_side: "LONG",  // 默認持倉方向為多頭
      amount: "",
      price: "",
    },
  });

  // 初始化槓桿表單
  const leverageForm = useForm({
    resolver: zodResolver(leverageFormSchema),
    defaultValues: {
      key_id: "",
      symbol: "",
      leverage: "20",
    },
  });

  // 獲取所有密鑰
  const fetchKeys = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/exchange/keys`);
      setKeys(response.data);
    } catch (error) {
      console.error('獲取 API 密鑰失敗:', error);
      toast({
        title: "錯誤",
        description: "獲取 API 密鑰列表失敗",
        variant: "destructive",
      });
    }
  };

  // 獲取持倉
  const fetchPositions = async (keyId) => {
    if (!keyId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/exchange/${keyId}/positions`);
      setPositions(response.data);
    } catch (error) {
      console.error('獲取持倉失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "獲取持倉失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取未成交訂單
  const fetchOpenOrders = async (keyId) => {
    if (!keyId) return;
    
    setIsLoading(true);
    try {
      // 根據當前交易模式設定symbol參數，避免無symbol查詢的速率限制
      let endpoint = `${API_BASE_URL}/api/exchange/${keyId}/open-orders`;
      
      const response = await axios.get(endpoint);
      setOpenOrders(response.data);
    } catch (error) {
      console.error('獲取未成交訂單失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "獲取未成交訂單失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取用戶持倉模式
  const fetchPositionMode = async (keyId) => {
    if (!keyId || tradingMode !== "contract") return;
    
    try {
      // 使用交易所 API 獲取持倉模式
      // 注：此處假設後端提供了這個端點，您可能需要在後端實現它
      const response = await axios.get(`${API_BASE_URL}/api/exchange/${keyId}/position-mode`);
      const isDualSide = response.data.dualSidePosition;
      setPositionMode(isDualSide ? "hedge" : "one-way");
      
      // 如果是單向模式，隱藏持倉方向選擇
      // 如果是雙向模式，顯示持倉方向選擇
    } catch (error) {
      console.error('獲取持倉模式失敗:', error);
      // 默認使用單向模式
      setPositionMode("one-way");
    }
  };

  // 初始加載
  useEffect(() => {
    fetchKeys();
  }, []);

  // 當選擇的密鑰變更時，獲取持倉和未成交訂單
  useEffect(() => {
    if (selectedKeyId) {
      if (tradingMode === "contract") {
        fetchPositions(selectedKeyId);
        fetchPositionMode(selectedKeyId);  // 獲取持倉模式
      }
      fetchOpenOrders(selectedKeyId);
      
      // 更新表單中的密鑰 ID
      orderForm.setValue('key_id', selectedKeyId);
      leverageForm.setValue('key_id', selectedKeyId);
    }
  }, [selectedKeyId, tradingMode]);

  // 當交易模式變更時
  useEffect(() => {
    // 清空表單
    if (tradingMode === "spot") {
      orderForm.setValue('symbol', '');
    } else {
      orderForm.setValue('symbol', '');
      leverageForm.setValue('symbol', '');
    }
    
    // 如果已選擇交易所，則刷新數據
    if (selectedKeyId) {
      if (tradingMode === "contract") {
        fetchPositions(selectedKeyId);
      } else {
        // 清空持倉數據，現貨模式不顯示持倉
        setPositions([]);
      }
      fetchOpenOrders(selectedKeyId);
    }
  }, [tradingMode]);

  // 同步交易對到槓桿表單
  useEffect(() => {
    if (tradingMode === "contract") {
      const symbol = orderForm.watch('symbol');
      if (symbol) {
        leverageForm.setValue('symbol', symbol);
      }
    }
  }, [orderForm.watch('symbol'), tradingMode]);

  // 當交易方向變更時自動設置對應的持倉方向（僅雙向模式下）
  useEffect(() => {
    if (tradingMode === "contract" && positionMode === "hedge") {
      const side = orderForm.watch('side');
      if (side === "buy") {
        orderForm.setValue('position_side', "LONG");
      } else {
        orderForm.setValue('position_side', "SHORT");
      }
    }
  }, [orderForm.watch('side'), positionMode, tradingMode]);

  // 提交訂單表單
  const onOrderSubmit = async (data) => {
    setIsLoading(true);
    try {
      // 如果是合約模式，確保添加適當的後綴
      let symbol = data.symbol;
      if (tradingMode === "contract" && !symbol.includes(':') && !symbol.includes('-PERP') && !symbol.includes('SWAP')) {
        // 提示用戶應使用合約格式
        if (symbol.includes('/')) {
          toast({
            title: "提示",
            description: "您正在合約模式下交易，但未使用合約交易對格式。系統將嘗試轉換格式。",
          });
          // 嘗試轉換為合約格式 (這只是簡單示例，實際情況可能需要更複雜的轉換邏輯)
          symbol = symbol.replace('/', '/USDT:');
        }
      }
      
      const payload = {
        symbol: symbol,
        order_type: data.order_type,
        side: data.side,
        amount: data.amount,
        price: data.order_type === 'limit' ? data.price : undefined,
        // 添加持倉方向參數（僅在合約模式且雙向持倉時使用）
        params: tradingMode === "contract" && positionMode === "hedge" ? 
          { positionSide: data.position_side } : {}
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/exchange/${data.key_id}/orders`, payload);
      
      toast({
        title: "成功",
        description: `${data.side === 'buy' ? '買入' : '賣出'} ${data.amount} ${symbol} 訂單已提交`,
      });
      
      // 重新獲取數據
      fetchOpenOrders(data.key_id);
      if (tradingMode === "contract") {
        fetchPositions(data.key_id);
      }
      
    } catch (error) {
      console.error('創建訂單失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "創建訂單失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 設置槓桿
  const setLeverage = async (leverage) => {
    setIsLoading(true);
    try {
      const symbol = orderForm.watch('symbol');
      if (!symbol) {
        toast({
          title: "錯誤",
          description: "請先輸入交易對",
          variant: "destructive",
        });
        return;
      }
      
      // 更新當前槓桿值
      setCurrentLeverage(leverage);
      
      const payload = {
        symbol: symbol,
        leverage: leverage,
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/exchange/${selectedKeyId}/leverage`, payload);
      
      toast({
        title: "成功",
        description: `${symbol} 槓桿已設置為 ${leverage}x`,
      });
      
      // 重新獲取持倉
      fetchPositions(selectedKeyId);
      
    } catch (error) {
      console.error('設置槓桿失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "設置槓桿失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 取消訂單
  const handleCancelOrder = async (orderId, symbol) => {
    if (!selectedKeyId) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/exchange/${selectedKeyId}/orders/${orderId}?symbol=${symbol}`);
      
      toast({
        title: "成功",
        description: "訂單已取消",
      });
      
      // 重新獲取未成交訂單
      fetchOpenOrders(selectedKeyId);
      
    } catch (error) {
      console.error('取消訂單失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "取消訂單失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 切換持倉模式
  const togglePositionMode = async () => {
    if (!selectedKeyId || tradingMode !== "contract") return;
    
    setIsLoading(true);
    try {
      // 切換為相反的模式
      const newDualSide = positionMode === "one-way";
      
      // 修正請求格式，確保參數名稱正確
      const response = await axios.post(`${API_BASE_URL}/api/exchange/${selectedKeyId}/position-mode`, {
        dual_side: newDualSide
      });
      
      // 更新持倉模式
      setPositionMode(newDualSide ? "hedge" : "one-way");
      
      toast({
        title: "成功",
        description: `已切換為${newDualSide ? '雙向' : '單向'}持倉模式`,
      });
      
      // 如果切換成功，刷新持倉數據
      if (tradingMode === "contract") {
        fetchPositions(selectedKeyId);
      }
    } catch (error) {
      console.error('切換持倉模式失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "切換持倉模式失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">交易操作</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>選擇交易所</CardTitle>
            <CardDescription>
              選擇要操作的交易所帳戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setSelectedKeyId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇交易所帳戶" />
              </SelectTrigger>
              <SelectContent>
                {keys.map((key) => (
                  <SelectItem key={key.id} value={key.id.toString()}>
                    {key.name} ({key.exchange_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {keys.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                尚未添加任何 API 密鑰，請先在 API 密鑰管理頁面添加
              </p>
            )}
            
            {/* 交易模式選擇器 */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">交易模式</h4>
              <Tabs defaultValue="spot" value={tradingMode} onValueChange={setTradingMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="spot">現貨交易</TabsTrigger>
                  <TabsTrigger value="contract">合約交易</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 合約模式下顯示持倉模式切換 */}
            {tradingMode === "contract" && selectedKeyId && (
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">持倉模式</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={togglePositionMode}
                    disabled={isLoading}
                  >
                    {positionMode === "hedge" ? "雙向持倉" : "單向持倉"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {positionMode === "hedge" 
                    ? "雙向持倉：可同時持有多空頭寸" 
                    : "單向持倉：只能持有單一方向頭寸"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>創建訂單</CardTitle>
            <CardDescription>
              創建新的{tradingMode === "spot" ? "現貨" : "合約"}交易訂單
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...orderForm}>
              <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={orderForm.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>交易對</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={tradingMode === "spot" ? "BTC/USDT" : "BTC/USDT:USDT 或 BTC-PERP"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {tradingMode === "contract" && "請使用合約格式，如：BTC/USDT:USDT 或 BTC-PERP"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={orderForm.control}
                    name="order_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>訂單類型</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇訂單類型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="limit">限價單</SelectItem>
                            <SelectItem value="market">市價單</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={orderForm.control}
                    name="side"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>交易方向</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇交易方向" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">買入</SelectItem>
                            <SelectItem value="sell">賣出</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 雙向持倉模式下顯示持倉方向選擇 */}
                  {tradingMode === "contract" && positionMode === "hedge" && (
                    <FormField
                      control={orderForm.control}
                      name="position_side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>持倉方向</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇持倉方向" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LONG">多頭 (LONG)</SelectItem>
                              <SelectItem value="SHORT">空頭 (SHORT)</SelectItem>
                              {/* 有些交易所還支持 BOTH 雙向持倉 */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={orderForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className={tradingMode === "contract" && positionMode === "hedge" ? "col-span-2" : ""}>
                        <FormLabel>數量</FormLabel>
                        <FormControl>
                          <Input placeholder="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {orderForm.watch('order_type') === 'limit' && (
                  <FormField
                    control={orderForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>價格</FormLabel>
                        <FormControl>
                          <Input placeholder="30000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between items-center">
                  {/* 合約模式下顯示槓桿按鈕 */}
                  {tradingMode === "contract" && (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-24"
                        >
                          {currentLeverage}x
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          <DrawerHeader>
                            <DrawerTitle>設置槓桿</DrawerTitle>
                            <DrawerDescription>
                              為 {orderForm.watch('symbol')} 設置槓桿倍數
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-4 pb-0">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="flex-1 text-center">
                                <div className="text-7xl font-bold tracking-tighter mb-2">
                                  {currentLeverage}x
                                </div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground">
                                  槓桿倍數
                                </div>
                              </div>
                            </div>
                            <div className="mt-8 mb-6">
                              <Slider
                                defaultValue={[currentLeverage]}
                                min={1}
                                max={125}
                                step={1}
                                onValueChange={(values) => setCurrentLeverage(values[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <span>1x</span>
                                <span>25x</span>
                                <span>50x</span>
                                <span>75x</span>
                                <span>100x</span>
                                <span>125x</span>
                              </div>
                            </div>
                          </div>
                          <DrawerFooter>
                            <Button 
                              onClick={() => setLeverage(currentLeverage)}
                              disabled={isLoading || !selectedKeyId || !orderForm.watch('symbol')}
                            >
                              設置槓桿
                            </Button>
                            <DrawerClose asChild>
                              <Button variant="outline">取消</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  )}

                  <Button 
                    type="submit" 
                    className={tradingMode === "contract" ? "flex-1 ml-4" : "w-full"}
                    disabled={isLoading || !selectedKeyId}
                  >
                    {isLoading ? "提交中..." : "提交訂單"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* 合約模式下顯示持倉 */}
      {tradingMode === "contract" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>持倉</CardTitle>
            <CardDescription>
              當前持倉信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">載入中...</div>
            ) : !selectedKeyId ? (
              <div className="text-center py-4 text-muted-foreground">
                請先選擇交易所帳戶
              </div>
            ) : positions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>交易對</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>數量</TableHead>
                    <TableHead>槓桿</TableHead>
                    <TableHead className="text-right">盈虧</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position, index) => (
                    <TableRow key={index}>
                      <TableCell>{position.symbol}</TableCell>
                      <TableCell>
                        {position.side === 'long' ? (
                          <Badge variant="success">多</Badge>
                        ) : (
                          <Badge variant="destructive">空</Badge>
                        )}
                      </TableCell>
                      <TableCell>{position.contracts}</TableCell>
                      <TableCell>{position.leverage}x</TableCell>
                      <TableCell className="text-right">
                        <span className={position.unrealizedPnl > 0 ? "text-green-600" : "text-red-600"}>
                          {position.unrealizedPnl > 0 ? "+" : ""}{position.unrealizedPnl}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                無持倉
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>未成交訂單</CardTitle>
          <CardDescription>
            當前未成交的{tradingMode === "spot" ? "現貨" : "合約"}訂單列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">載入中...</div>
          ) : !selectedKeyId ? (
            <div className="text-center py-4 text-muted-foreground">
              請先選擇交易所帳戶
            </div>
          ) : openOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單 ID</TableHead>
                  <TableHead>交易對</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>方向</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead>價格</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openOrders
                  // 根據交易模式過濾訂單
                  .filter(order => {
                    if (tradingMode === "contract") {
                      return order.symbol.includes(':') || 
                             order.symbol.includes('-PERP') || 
                             order.symbol.includes('SWAP');
                    } else {
                      return !order.symbol.includes(':') && 
                             !order.symbol.includes('-PERP') && 
                             !order.symbol.includes('SWAP');
                    }
                  })
                  .map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>{order.symbol}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell>
                        {order.side === 'buy' ? (
                          <Badge variant="success">買入</Badge>
                        ) : (
                          <Badge variant="destructive">賣出</Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>{order.price}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id, order.symbol)}
                          disabled={isLoading}
                        >
                          取消
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              無未成交訂單
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingPage; 