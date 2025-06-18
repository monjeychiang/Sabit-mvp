import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowUpDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TransactionHistory = ({ portfolioId, isLoading: parentLoading }) => {
  const [isLoading, setIsLoading] = useState(parentLoading);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    symbol: "",
    dateRange: "all",
  });
  const { toast } = useToast();

  // 獲取交易記錄
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // 模擬 API 調用，實際開發時替換為真實 API
      // const response = await axios.get(`http://localhost:8000/api/portfolios/${portfolioId}/transactions`);
      // setTransactions(response.data);
      
      // 模擬數據
      setTimeout(() => {
        const mockTransactions = [
          { 
            id: 1, 
            symbol: "BTC", 
            type: "buy", 
            amount: 0.5, 
            price: 44000, 
            value: 22000, 
            fee: 22, 
            timestamp: "2023-11-10T08:30:00Z",
            exchange: "Binance"
          },
          { 
            id: 2, 
            symbol: "ETH", 
            type: "buy", 
            amount: 5, 
            price: 2000, 
            value: 10000, 
            fee: 10, 
            timestamp: "2023-11-05T12:45:00Z",
            exchange: "Coinbase"
          },
          { 
            id: 3, 
            symbol: "BNB", 
            type: "buy", 
            amount: 10, 
            price: 250, 
            value: 2500, 
            fee: 2.5, 
            timestamp: "2023-10-28T15:20:00Z",
            exchange: "Binance"
          },
          { 
            id: 4, 
            symbol: "SOL", 
            type: "buy", 
            amount: 50, 
            price: 80, 
            value: 4000, 
            fee: 4, 
            timestamp: "2023-10-15T09:10:00Z",
            exchange: "Kraken"
          },
          { 
            id: 5, 
            symbol: "BTC", 
            type: "sell", 
            amount: 0.2, 
            price: 45000, 
            value: 9000, 
            fee: 9, 
            timestamp: "2023-11-15T14:25:00Z",
            exchange: "Binance"
          }
        ];
        setTransactions(mockTransactions);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('獲取交易記錄失敗:', error);
      toast({
        title: "獲取交易記錄失敗",
        description: error.message || "請稍後再試",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // 初始加載
  useEffect(() => {
    if (portfolioId) {
      fetchTransactions();
    }
  }, [portfolioId]);

  // 處理篩選變更
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 篩選交易記錄
  const filteredTransactions = transactions.filter(transaction => {
    // 按類型篩選
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    
    // 按幣種篩選
    if (filters.symbol && !transaction.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false;
    }
    
    // 按日期範圍篩選
    if (filters.dateRange !== "all") {
      const now = new Date();
      const txDate = new Date(transaction.timestamp);
      const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
      
      if (filters.dateRange === "7days" && daysDiff > 7) {
        return false;
      } else if (filters.dateRange === "30days" && daysDiff > 30) {
        return false;
      } else if (filters.dateRange === "90days" && daysDiff > 90) {
        return false;
      }
    }
    
    return true;
  });

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 交易類型標籤
  const getTransactionBadge = (type) => {
    switch (type) {
      case 'buy':
        return <Badge variant="success">買入</Badge>;
      case 'sell':
        return <Badge variant="destructive">賣出</Badge>;
      case 'transfer_in':
        return <Badge variant="outline">轉入</Badge>;
      case 'transfer_out':
        return <Badge variant="outline">轉出</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>交易歷史</CardTitle>
          <CardDescription>您的加密貨幣交易記錄</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 篩選工具列 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center">
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="交易類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有類型</SelectItem>
                  <SelectItem value="buy">買入</SelectItem>
                  <SelectItem value="sell">賣出</SelectItem>
                  <SelectItem value="transfer_in">轉入</SelectItem>
                  <SelectItem value="transfer_out">轉出</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="日期範圍" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有時間</SelectItem>
                  <SelectItem value="7days">最近 7 天</SelectItem>
                  <SelectItem value="30days">最近 30 天</SelectItem>
                  <SelectItem value="90days">最近 90 天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋幣種..."
                className="pl-8"
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
              />
            </div>
            
            <Button variant="outline" onClick={fetchTransactions} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpDown className="h-4 w-4 mr-2" />}
              排序
            </Button>
          </div>
          
          {/* 交易記錄表格 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">載入交易記錄中...</span>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>幣種</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead>價格</TableHead>
                  <TableHead>價值</TableHead>
                  <TableHead>手續費</TableHead>
                  <TableHead>交易所</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.timestamp)}</TableCell>
                    <TableCell>{getTransactionBadge(tx.type)}</TableCell>
                    <TableCell>{tx.symbol}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>${tx.price.toLocaleString()}</TableCell>
                    <TableCell>${tx.value.toLocaleString()}</TableCell>
                    <TableCell>${tx.fee.toLocaleString()}</TableCell>
                    <TableCell>{tx.exchange}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">無交易記錄</h3>
              <p className="text-muted-foreground mt-2">
                {filters.type !== "all" || filters.symbol || filters.dateRange !== "all" ? 
                  "沒有符合篩選條件的交易記錄" : 
                  "尚未有任何交易記錄"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 交易統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>交易總數</CardTitle>
            <CardDescription>所有交易活動數量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactions.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              買入: {transactions.filter(tx => tx.type === 'buy').length} | 
              賣出: {transactions.filter(tx => tx.type === 'sell').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>總交易額</CardTitle>
            <CardDescription>所有交易的總價值</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${transactions.reduce((sum, tx) => sum + tx.value, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              總手續費: ${transactions.reduce((sum, tx) => sum + tx.fee, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>最活躍幣種</CardTitle>
            <CardDescription>交易次數最多的幣種</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <>
                <div className="text-3xl font-bold">
                  {Object.entries(
                    transactions.reduce((acc, tx) => {
                      acc[tx.symbol] = (acc[tx.symbol] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  共 {Object.entries(
                    transactions.reduce((acc, tx) => {
                      acc[tx.symbol] = (acc[tx.symbol] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} 筆交易
                </p>
              </>
            ) : (
              <div className="text-3xl font-bold">N/A</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory; 