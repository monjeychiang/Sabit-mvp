import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Cpu, Home, Key, LineChart, LogOut, Menu, Settings, Wallet, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNavigation({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
  };

  const NavItem = ({ to, icon: Icon, children, className }) => (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 p-2 rounded-md hover:bg-accent",
        isActive(to) ? "bg-accent" : "",
        className
      )}
      onClick={() => setOpen(false)}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">開啟選單</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 py-4">
          <h2 className="text-lg font-semibold px-4">選單</h2>
          
          <div className="px-2">
            <NavItem to="/" icon={Home}>首頁</NavItem>
          </div>
          
          <div className="px-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">交易中心</h3>
            <NavItem to="/dashboard" icon={Settings}>操作中心首頁</NavItem>
            <NavItem to="/exchange-keys" icon={Key}>API 密鑰管理</NavItem>
            <NavItem to="/trading" icon={BarChart3}>交易操作</NavItem>
          </div>
          
          <div className="px-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">資產管理</h3>
            <NavItem to="/asset-management" icon={Wallet}>資產管理</NavItem>
          </div>
          
          <div className="px-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">進階功能</h3>
            <NavItem to="/components" icon={BookOpen}>組件庫</NavItem>
          </div>
          
          <div className="px-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">價格監控</h3>
            <NavItem to="/price-monitor" icon={LineChart}>價格監控</NavItem>
          </div>
          
          <div className="px-2">
            <h3 className="text-sm font-medium text-muted-foreground px-2 mb-1">登入登出</h3>
            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <Link to="/login" onClick={onNavigate}>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  登入
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 