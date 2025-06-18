import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReportCenter = ({ portfolioId, isLoading: parentLoading }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("profit-loss");
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState({
    start: "2023-01-01",
    end: new Date().toISOString().split('T')[0]
  });
  const [reportOptions, setReportOptions] = useState({
    includeTransactions: true,
    includeFees: true,
    includeUnrealizedGains: true,
    groupByExchange: false,
    groupByCurrency: true
  });
  const { toast } = useToast();

  // 處理報表選項變更
  const handleOptionChange = (option) => {
    setReportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // 處理日期範圍變更
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 生成報表
  const generateReport = async () => {
    if (!portfolioId) {
      toast({
        title: "無法生成報表",
        description: "請先選擇資產組合",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 模擬 API 調用，實際開發時替換為真實 API
      // const response = await axios.post(`http://localhost:8000/api/reports/${reportType}`, {
      //   portfolio_id: portfolioId,
      //   format: reportFormat,
      //   start_date: dateRange.start,
      //   end_date: dateRange.end,
      //   options: reportOptions
      // }, { responseType: 'blob' });
      
      // 模擬報表生成延遲
      setTimeout(() => {
        toast({
          title: "報表生成成功",
          description: `已成功生成${reportType === 'profit-loss' ? '盈虧報表' : '稅務報告'}`,
          variant: "success"
        });
        setIsGenerating(false);
      }, 2000);
      
      // 實際開發時下載檔案
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `${reportType}-report.${reportFormat}`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } catch (error) {
      console.error('生成報表失敗:', error);
      toast({
        title: "生成報表失敗",
        description: error.message || "請稍後再試",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  // 獲取報表格式圖標
  const getFormatIcon = () => {
    switch (reportFormat) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>報表中心</CardTitle>
          <CardDescription>生成資產盈虧和稅務報表</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profit-loss" onValueChange={setReportType}>
            <TabsList className="mb-6">
              <TabsTrigger value="profit-loss">盈虧報表</TabsTrigger>
              <TabsTrigger value="tax">稅務報告</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profit-loss">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">盈虧報表</h3>
                  <p className="text-sm text-muted-foreground">
                    生成詳細的資產盈虧報表，包括已實現和未實現的收益/損失，交易費用等。
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="start-date">開始日期</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="end-date">結束日期</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="report-format">報表格式</Label>
                      <Select value={reportFormat} onValueChange={setReportFormat}>
                        <SelectTrigger id="report-format">
                          <SelectValue placeholder="選擇格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF 文件</SelectItem>
                          <SelectItem value="csv">CSV 檔案</SelectItem>
                          <SelectItem value="xlsx">Excel 檔案</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">報表選項</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-transactions"
                        checked={reportOptions.includeTransactions}
                        onCheckedChange={() => handleOptionChange('includeTransactions')}
                      />
                      <Label htmlFor="include-transactions">包含交易明細</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-fees"
                        checked={reportOptions.includeFees}
                        onCheckedChange={() => handleOptionChange('includeFees')}
                      />
                      <Label htmlFor="include-fees">包含手續費</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-unrealized"
                        checked={reportOptions.includeUnrealizedGains}
                        onCheckedChange={() => handleOptionChange('includeUnrealizedGains')}
                      />
                      <Label htmlFor="include-unrealized">包含未實現盈虧</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="group-by-exchange"
                        checked={reportOptions.groupByExchange}
                        onCheckedChange={() => handleOptionChange('groupByExchange')}
                      />
                      <Label htmlFor="group-by-exchange">按交易所分組</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="group-by-currency"
                        checked={reportOptions.groupByCurrency}
                        onCheckedChange={() => handleOptionChange('groupByCurrency')}
                      />
                      <Label htmlFor="group-by-currency">按幣種分組</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tax">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">稅務報告</h3>
                  <p className="text-sm text-muted-foreground">
                    生成符合稅務申報要求的報表，包括資本利得、收入和可扣除費用等。
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tax-year">稅務年度</Label>
                      <Select defaultValue="2023">
                        <SelectTrigger id="tax-year">
                          <SelectValue placeholder="選擇稅務年度" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tax-region">稅務地區</Label>
                      <Select defaultValue="tw">
                        <SelectTrigger id="tax-region">
                          <SelectValue placeholder="選擇稅務地區" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tw">台灣</SelectItem>
                          <SelectItem value="us">美國</SelectItem>
                          <SelectItem value="hk">香港</SelectItem>
                          <SelectItem value="sg">新加坡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tax-report-format">報表格式</Label>
                      <Select value={reportFormat} onValueChange={setReportFormat}>
                        <SelectTrigger id="tax-report-format">
                          <SelectValue placeholder="選擇格式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF 文件</SelectItem>
                          <SelectItem value="csv">CSV 檔案</SelectItem>
                          <SelectItem value="xlsx">Excel 檔案</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">稅務報表選項</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked id="include-capital-gains" />
                      <Label htmlFor="include-capital-gains">包含資本利得</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked id="include-income" />
                      <Label htmlFor="include-income">包含收入（挖礦、質押等）</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked id="include-deductions" />
                      <Label htmlFor="include-deductions">包含可扣除費用</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox defaultChecked id="use-fifo" />
                      <Label htmlFor="use-fifo">使用先進先出法（FIFO）</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-form-examples" />
                      <Label htmlFor="include-form-examples">包含申報表範例</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center">
            {getFormatIcon()}
            <span className="ml-2">
              {reportType === 'profit-loss' ? '盈虧報表' : '稅務報告'} - 
              {reportFormat === 'pdf' ? ' PDF 文件' : 
               reportFormat === 'csv' ? ' CSV 檔案' : ' Excel 檔案'}
            </span>
          </div>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                生成並下載
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* 報表預覽 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>報表預覽</CardTitle>
          <CardDescription>報表生成前的預覽</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                點擊「生成並下載」按鈕以生成報表
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 報表歷史 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>報表歷史</CardTitle>
          <CardDescription>之前生成的報表記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              尚無報表歷史記錄
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCenter; 