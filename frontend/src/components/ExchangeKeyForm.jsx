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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';

// 表單驗證架構
const formSchema = z.object({
  exchange_id: z.string().min(1, "必須選擇交易所"),
  name: z.string().min(1, "必須提供名稱"),
  api_key: z.string().min(1, "必須提供 API Key"),
  api_secret: z.string().min(1, "必須提供 API Secret"),
  api_password: z.string().optional(),
  test_mode: z.boolean().default(true),
});

const ExchangeKeyForm = ({ onSuccess }) => {
  const [exchanges, setExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 初始化表單
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exchange_id: "",
      name: "",
      api_key: "",
      api_secret: "",
      api_password: "",
      test_mode: true,
    },
  });

  // 獲取支持的交易所列表
  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/exchange/supported');
        setExchanges(response.data.exchanges || []);
      } catch (error) {
        console.error('獲取交易所列表失敗:', error);
        toast({
          title: "錯誤",
          description: "無法獲取支持的交易所列表",
          variant: "destructive",
        });
      }
    };

    fetchExchanges();
  }, [toast]);

  // 提交表單
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/exchange/keys', data);
      toast({
        title: "成功",
        description: "交易所 API 密鑰已保存",
      });
      
      // 重置表單
      form.reset();
      
      // 調用成功回調
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('保存 API 密鑰失敗:', error);
      toast({
        title: "錯誤",
        description: error.response?.data?.detail || "保存 API 密鑰失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>新增交易所 API 密鑰</CardTitle>
        <CardDescription>
          添加交易所 API 密鑰以進行自動化交易。所有密鑰都將在本地加密存儲。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exchange_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>交易所</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇交易所" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exchanges.map((exchange) => (
                          <SelectItem key={exchange} value={exchange}>
                            {exchange}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      選擇要連接的加密貨幣交易所
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名稱</FormLabel>
                    <FormControl>
                      <Input placeholder="我的 Binance 帳戶" {...field} />
                    </FormControl>
                    <FormDescription>
                      為此 API 密鑰設置一個易記的名稱
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    從交易所獲取的 API Key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="API Secret" {...field} />
                  </FormControl>
                  <FormDescription>
                    從交易所獲取的 API Secret
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API 密碼 (可選)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="API 密碼" {...field} />
                  </FormControl>
                  <FormDescription>
                    某些交易所需要額外的密碼或密碼短語
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_mode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">測試模式</FormLabel>
                    <FormDescription>
                      啟用測試模式以使用交易所的測試環境
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存 API 密鑰"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          您的 API 密鑰將使用主密碼加密後存儲在本地數據庫中
        </p>
      </CardFooter>
    </Card>
  );
};

export default ExchangeKeyForm; 