import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import ExchangeKeyForm from '@/components/ExchangeKeyForm';
import axios from 'axios';

const ExchangeKeysPage = () => {
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 獲取所有密鑰
  const fetchKeys = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    fetchKeys();
  }, []);

  // 處理新增密鑰成功
  const handleKeyAdded = () => {
    fetchKeys();
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
            <Table>
              <TableCaption>已保存的交易所 API 密鑰列表</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead>交易所</TableHead>
                  <TableHead>模式</TableHead>
                  <TableHead>狀態</TableHead>
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
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
};

export default ExchangeKeysPage; 