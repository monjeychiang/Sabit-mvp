import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // 點擊時循環切換主題：light -> dark -> system -> light
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // 根據當前主題顯示對應的圖標和提示
  const getThemeIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-4 w-4" />;
    } else if (theme === 'dark') {
      return <Moon className="h-4 w-4" />;
    } else {
      return (
        <div className="h-4 w-4 flex items-center justify-center">
          <span className="text-xs">💻</span>
        </div>
      );
    }
  };

  const getThemeTooltip = () => {
    if (theme === 'light') {
      return "切換至深色模式";
    } else if (theme === 'dark') {
      return "切換至系統模式";
    } else {
      return "切換至淺色模式";
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-8 w-8 rounded-full"
      onClick={toggleTheme}
      title={getThemeTooltip()}
    >
      {getThemeIcon()}
      <span className="sr-only">{getThemeTooltip()}</span>
    </Button>
  );
} 