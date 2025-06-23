import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, ChevronDown, Cpu, Home, Key, Settings, Wallet, LineChart } from 'lucide-react';

export function MainNavigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/" className={cn(
              navigationMenuTriggerStyle(),
              isActive('/') ? 'bg-primary text-primary-foreground' : ''
            )}>
              <Home className="w-4 h-4 mr-2" />
              首頁
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/dashboard') || isActive('/trading') || isActive('/exchange-keys') || isActive('/price-monitor') ? 'bg-primary text-primary-foreground' : ''}>
            <Settings className="w-4 h-4 mr-2" />
            交易中心
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-2">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link to="/dashboard" className={cn(
                    "flex flex-col h-full w-full justify-start rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md hover:bg-accent",
                    isActive('/dashboard') ? 'bg-accent/50' : ''
                  )}>
                    <div className="mb-2 mt-2 text-lg font-medium text-foreground flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-primary" />
                      操作中心首頁
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground mb-2">
                      交易平台的主控台，集中管理所有交易操作與系統設置
                    </p>
                    <span className="text-sm text-primary">立即進入 →</span>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/exchange-keys" className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isActive('/exchange-keys') ? 'bg-accent' : ''
                  )}>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium leading-none">API 密鑰管理</div>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      添加和管理交易所 API 密鑰
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/trading" className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isActive('/trading') ? 'bg-accent' : ''
                  )}>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium leading-none">交易操作</div>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      創建和管理交易策略、執行自動交易
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/price-monitor" className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isActive('/price-monitor') ? 'bg-accent' : ''
                  )}>
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium leading-none">價格監控</div>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      監控加密貨幣實時價格，支持多交易所
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link to="/asset-management" className={cn(
              navigationMenuTriggerStyle(),
              isActive('/asset-management') ? 'bg-primary text-primary-foreground' : ''
            )}>
              <Wallet className="w-4 h-4 mr-2" />
              資產管理
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/components') ? 'bg-primary text-primary-foreground' : ''}>
            <Cpu className="w-4 h-4 mr-2" />
            進階功能
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              <li>
                <NavigationMenuLink asChild>
                  <Link to="/components" className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isActive('/components') ? 'bg-accent' : ''
                  )}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium leading-none">組件庫</div>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      瀏覽所有可用的 UI 組件和示例
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
} 