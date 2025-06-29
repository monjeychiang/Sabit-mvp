import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ExchangeKeyForm from "@/components/ExchangeKeyForm";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreHorizontal, RefreshCw, Wifi, WifiOff } from "lucide-react";

const ExchangeKeysPage = () => {
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreheatLoading, setPreheatLoading] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [isStatusLoading, setIsStatusLoading] = useState({});
  const { toast } = useToast();

  // 獲取所有密鑰
  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/exchange/keys",
      );
      setKeys(response.data);
      // 獲取每個密鑰的連線狀態
      response.data.forEach((key) => {
        fetchConnectionStatus(key.id);
      });
    } catch (error) {
      console.error("獲取 API 密鑰失敗:", error);
      toast({
        title: "錯誤",
        description: "獲取 API 密鑰列表失敗",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取連線狀態
  const fetchConnectionStatus = async (keyId) => {
    setIsStatusLoading((prev) => ({ ...prev, [keyId]: true }));
    try {
      const response = await axios.get(
        `http://localhost:8000/api/exchange/keys/${keyId}/connection-status`,
      );
      setConnectionStatus((prev) => ({
        ...prev,
        [keyId]: response.data,
      }));
    } catch (error) {
      console.error(`獲取連線狀態失敗 (ID: ${keyId}):`, error);
    } finally {
      setIsStatusLoading((prev) => ({ ...prev, [keyId]: false }));
    }
  };

  // 初始加載
  useEffect(() => {
    fetchKeys();

    // 每 30 秒刷新一次連線狀態
    const intervalId = setInterval(() => {
      keys.forEach((key) => {
        fetchConnectionStatus(key.id);
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 處理新增密鑰成功
  const handleKeyAdded = () => {
    fetchKeys();
  };

  // 切換密鑰狀態
  const toggleKeyStatus = async (keyId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/exchange/keys/${keyId}/toggle`,
      );
      toast({
        title: "成功",
        description: "已更新 API 密鑰狀態",
      });
      fetchKeys();
      // 更新連線狀態
      setTimeout(() => fetchConnectionStatus(keyId), 1000);
    } catch (error) {
      console.error("更新 API 密鑰狀態失敗:", error);
      toast({
        title: "錯誤",
        description: "更新 API 密鑰狀態失敗",
        variant: "destructive",
      });
    }
  };

  // 刪除密鑰
  const deleteKey = async () => {
    if (!selectedKeyId) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/exchange/keys/${selectedKeyId}`,
      );
      toast({
        title: "成功",
        description: "已刪除 API 密鑰",
      });
      fetchKeys();
    } catch (error) {
      console.error("刪除 API 密鑰失敗:", error);
      toast({
        title: "錯誤",
        description: "刪除 API 密鑰失敗",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedKeyId(null);
    }
  };

  // 預熱連線
  const preheatConnection = async (keyId) => {
    setPreheatLoading((prev) => ({ ...prev, [keyId]: true }));
    try {
      await axios.post(
        `http://localhost:8000/api/exchange/keys/${keyId}/preheat`,
      );
      toast({
        title: "成功",
        description: "交易所連線預熱成功",
      });
      // 更新連線狀態
      setTimeout(() => fetchConnectionStatus(keyId), 1000);
    } catch (error) {
      console.error("預熱連線失敗:", error);
      toast({
        title: "錯誤",
        description: "預熱連線失敗",
        variant: "destructive",
      });
    } finally {
      setPreheatLoading((prev) => ({ ...prev, [keyId]: false }));
    }
  };

  // 預熱所有連線
  const preheatAllConnections = async () => {
    setPreheatLoading((prev) => ({ ...prev, all: true }));
    try {
      await axios.post("http://localhost:8000/api/exchange/preheat-all");
      toast({
        title: "成功",
        description: "所有交易所連線預熱成功",
      });
      // 更新所有連線狀態
      keys.forEach((key) => {
        setTimeout(() => fetchConnectionStatus(key.id), 1000);
      });
    } catch (error) {
      console.error("預熱所有連線失敗:", error);
      toast({
        title: "錯誤",
        description: "預熱所有連線失敗",
        variant: "destructive",
      });
    } finally {
      setPreheatLoading((prev) => ({ ...prev, all: false }));
    }
  };

  // 格式化最後使用時間
  const formatLastUsed = (timestamp) => {
    if (!timestamp) return "未知";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">交易所 API 密鑰管理</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">已保存的密鑰</TabsTrigger>
          <TabsTrigger value="add">新增密鑰</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">載入中...</div>
          ) : keys.length > 0 ? (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={preheatAllConnections}
                  disabled={isPreheatLoading.all}
                >
                  {isPreheatLoading.all ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      預熱中...
                    </>
                  ) : (
                    "預熱所有連線"
                  )}
                </Button>
              </div>
              <Table>
                <TableCaption>已保存的交易所 API 密鑰列表</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名稱</TableHead>
                    <TableHead>交易所</TableHead>
                    <TableHead>模式</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>連線</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.id}</TableCell>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>{key.exchange_id}</TableCell>
                      <TableCell>
                        {key.test_mode ? (
                          <Badge variant="outline">測試模式</Badge>
                        ) : (
                          <Badge variant="default">正式模式</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {key.is_active ? (
                          <Badge variant="success">啟用</Badge>
                        ) : (
                          <Badge variant="secondary">停用</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                {isStatusLoading[key.id] ? (
                                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : connectionStatus[key.id]?.connected ? (
                                  <Wifi className="h-4 w-4 text-green-500" />
                                ) : (
                                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {connectionStatus[key.id]?.connected
                                ? `已連線，最後活動: ${formatLastUsed(connectionStatus[key.id]?.last_used)}`
                                : "未連線"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => preheatConnection(key.id)}
                            disabled={isPreheatLoading[key.id]}
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${isPreheatLoading[key.id] ? "animate-spin" : ""}`}
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                API 密鑰操作
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleKeyStatus(key.id)}
                              >
                                {key.is_active ? "禁用密鑰" : "啟用密鑰"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => preheatConnection(key.id)}
                              >
                                預熱連線
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => fetchConnectionStatus(key.id)}
                              >
                                刷新連線狀態
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedKeyId(key.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                刪除密鑰
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">尚未添加任何 API 密鑰</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => document.querySelector('[value="add"]').click()}
              >
                添加第一個 API 密鑰
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <div className="flex justify-center">
            <ExchangeKeyForm onSuccess={handleKeyAdded} />
          </div>
        </TabsContent>
      </Tabs>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除此 API 密鑰嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteKey}
              className="bg-red-600 hover:bg-red-700"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExchangeKeysPage;
