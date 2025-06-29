import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import DataFlow from "@/components/ui/data-flow";
import { Logo } from "@/components/ui/logo";

// 定義表單模式
const formSchema = z.object({
  username: z.string().min(3, {
    message: "用戶名至少需要3個字符",
  }),
  password: z.string().min(6, {
    message: "密碼至少需要6個字符",
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  // 初始化表單
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 表單提交
  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/login", values);

      // 保存令牌和用戶信息到本地存儲
      localStorage.setItem("auth_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 更新 AuthContext 中的用戶狀態
      updateUser(response.data.user);

      // 顯示成功提示
      toast({
        title: "登入成功",
        description: `歡迎回來，${response.data.user.username}！`,
      });

      // 跳轉到儀表板
      navigate("/dashboard");
    } catch (error) {
      console.error("登入失敗:", error);

      let errorMessage = "登入失敗，請檢查您的憑據";
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }

      // 顯示錯誤提示
      toast({
        title: "登入失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 z-0 opacity-20">
        <DataFlow height="100%" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              登入
            </CardTitle>
            <CardDescription className="text-center">
              輸入您的憑據以訪問交易中心
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用戶名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="輸入您的用戶名"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密碼</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="輸入您的密碼"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "登入中..." : "登入"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              還沒有帳戶？
              <Button
                variant="link"
                className="pl-1 h-auto p-0"
                onClick={() => navigate("/register")}
                disabled={isLoading}
              >
                註冊
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
              disabled={isLoading}
            >
              返回首頁
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
