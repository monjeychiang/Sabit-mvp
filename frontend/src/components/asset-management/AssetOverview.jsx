import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";

const AssetOverview = ({ assets, isLoading, portfolioId }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <span className="ml-2">載入資產數據中...</span>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>資產列表</CardTitle>
          <CardDescription>您的加密貨幣資產明細</CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>幣種</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead>目前價值</TableHead>
                  <TableHead>平均成本</TableHead>
                  <TableHead>盈虧</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const isProfitable = asset.changePercent >= 0;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2">
                            {asset.symbol.substring(0, 1)}
                          </div>
                          <div>
                            <div>{asset.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {asset.symbol}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{asset.amount}</TableCell>
                      <TableCell>
                        ${asset.currentValue.toLocaleString()}
                      </TableCell>
                      <TableCell>${asset.costBasis.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {isProfitable ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <Badge
                            variant={isProfitable ? "success" : "destructive"}
                          >
                            {isProfitable ? "+" : ""}
                            {asset.changePercent}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          詳情
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                此資產組合中尚無資產，請添加資產或從交易所同步
              </p>
              <Button>添加資產</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 資產價值趨勢圖 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>資產價值趨勢</CardTitle>
          <CardDescription>過去 30 天資產價值變化</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">
              資產價值趨勢圖（此為示意圖，實際開發時將整合圖表庫）
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetOverview;
