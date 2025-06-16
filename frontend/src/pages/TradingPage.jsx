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

// 訂單表單驗證架構
const orderFormSchema = z.object({
  key_id: z.string().min(1, "必須選擇交易所"),
  symbol: z.string().min(1, "必須提供交易對"),
  order_type: z.string().min(1, "必須選擇訂單類型"),
  side: z.string().min(1, "必須選擇交易方向"),
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
  symbol: z.string().min(1, "必須提供交易對"),
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
  const { toast } = useToast();

  // 初始化訂單表單
  const orderForm = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      key_id: "",
      symbol: "",
      order_type: "limit",
      side: "buy",
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
      leverage: "1",
    },
  });

  // 獲取所有密鑰
  const fetchKeys = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/exchange/keys');
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
      const response = await axios.get(`http://localhost:8000/api/exchange/${keyId}/positions`);
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
      const response = await axios.get(`http://localhost:8000/api/exchange/${keyId}/open-orders`);
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

  // 初始加載
  useEffect(() => {
    fetchKeys();
  }, []);

  // 當選擇的密鑰變更時，獲取持倉和未成交訂單
  useEffect(() => {
    if (selectedKeyId) {
      fetchPositions(selectedKeyId);
      fetchOpenOrders(selectedKeyId);
      
      // 更新表單中的密鑰 ID
      orderForm.setValue('key_id', selectedKeyId);
      leverageForm.setValue('key_id', selectedKeyId);
    }
  }, [selectedKeyId]);

  // 提交訂單表單
  const onOrderSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        symbol: data.symbol,
        order_type: data.order_type,
        side: data.side,
        amount: data.amount,
        price: data.order_type === 'limit' ? data.price : undefined,
      };
      
      const response = await axios.post(`http://localhost:8000/api/exchange/${data.key_id}/orders`, payload);
      
      toast({
        title: "成功",
        description: `${data.side === 'buy' ? '買入' : '賣出'} ${data.amount} ${data.symbol} 訂單已提交`,
      });
      
      // 重新獲取數據
      fetchOpenOrders(data.key_id);
      fetchPositions(data.key_id);
      
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

  // 提交槓桿表單
  const onLeverageSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        symbol: data.symbol,
        leverage: data.leverage,
      };
      
      const response = await axios.post(`http://localhost:8000/api/exchange/${data.key_id}/leverage`, payload);
      
      toast({
        title: "成功",
        description: `${data.symbol} 槓桿已設置為 ${data.leverage}x`,
      });
      
      // 重新獲取持倉
      fetchPositions(data.key_id);
      
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
      await axios.delete(`http://localhost:8000/api/exchange/${selectedKeyId}/orders/${orderId}?symbol=${symbol}`);
      
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
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>創建訂單</CardTitle>
            <CardDescription>
              創建新的交易訂單
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
                          <Input placeholder="BTC/USDT" {...field} />
                        </FormControl>
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

                  <FormField
                    control={orderForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !selectedKeyId}
                >
                  {isLoading ? "提交中..." : "提交訂單"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>設置槓桿</CardTitle>
            <CardDescription>
              設置交易對的槓桿倍數
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...leverageForm}>
              <form onSubmit={leverageForm.handleSubmit(onLeverageSubmit)} className="space-y-4">
                <FormField
                  control={leverageForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>交易對</FormLabel>
                      <FormControl>
                        <Input placeholder="BTC/USDT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={leverageForm.control}
                  name="leverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>槓桿倍數</FormLabel>
                      <FormControl>
                        <Input placeholder="1-125" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !selectedKeyId}
                >
                  {isLoading ? "設置中..." : "設置槓桿"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>未成交訂單</CardTitle>
          <CardDescription>
            當前未成交的訂單列表
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
                {openOrders.map((order) => (
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