import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { BarChart3, BookOpen, Cpu, Github, Home, Key, Settings } from 'lucide-react';
import { Logo } from './ui/logo';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">打開菜單</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center">
            <Logo size="small" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">主要導航</div>
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <Home className="w-4 h-4" />
            首頁
          </Link>

          <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">交易中心</div>
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/dashboard') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <Settings className="w-4 h-4" />
            操作中心首頁
          </Link>
          <Link 
            to="/exchange-keys" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/exchange-keys') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <Key className="w-4 h-4" />
            API 密鑰管理
          </Link>
          <Link 
            to="/trading" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/trading') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <BarChart3 className="w-4 h-4" />
            交易操作
          </Link>
          
          <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">進階功能</div>
          <Link 
            to="/multiprocessing" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/multiprocessing') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <Cpu className="w-4 h-4" />
            多核心處理
          </Link>
          <Link 
            to="/components" 
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive('/components') 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={handleLinkClick}
          >
            <BookOpen className="w-4 h-4" />
            組件庫
          </Link>
          
          <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">外部連結</div>
          <a 
            href="https://github.com/monjeychiang/Sabit-mvp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={handleLinkClick}
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 