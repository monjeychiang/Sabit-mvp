import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Settings, Key, BarChart3, Cpu, Component } from "lucide-react";

const OperationsMenu = () => {
  const location = useLocation();
  
  // 檢查當前路徑是否匹配
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // 判斷是否在操作頁面
  const isInOperations = () => {
    const operationPaths = ['/dashboard', '/exchange-keys', '/trading', '/components'];
    return operationPaths.includes(location.pathname);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={isInOperations() ? "default" : "outline"} 
          className="flex items-center gap-1"
        >
          <Settings className="w-4 h-4 mr-1" />
          操作中心
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>操作選項</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/dashboard">
          <DropdownMenuItem className={`cursor-pointer ${isActive('/dashboard') ? 'bg-accent' : ''}`}>
            <Settings className="w-4 h-4 mr-2" />
            <span>操作中心首頁</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/exchange-keys">
          <DropdownMenuItem className={`cursor-pointer ${isActive('/exchange-keys') ? 'bg-accent' : ''}`}>
            <Key className="w-4 h-4 mr-2" />
            <span>API 密鑰管理</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/trading">
          <DropdownMenuItem className={`cursor-pointer ${isActive('/trading') ? 'bg-accent' : ''}`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            <span>交易操作</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <Link to="/components">
          <DropdownMenuItem className={`cursor-pointer ${isActive('/components') ? 'bg-accent' : ''}`}>
            <Component className="w-4 h-4 mr-2" />
            <span>組件庫</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OperationsMenu; 