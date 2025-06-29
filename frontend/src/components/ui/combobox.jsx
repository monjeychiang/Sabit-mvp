import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Combobox({
  items,
  value,
  onValueChange,
  onInputChange,
  placeholder,
  emptyMessage = "查無交易對",
  className,
  showSelectedItem = true,
  disabled = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleInputChange = (input) => {
    setInputValue(input);
    if (onInputChange) {
      onInputChange(input);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(true)}
        >
          {value && showSelectedItem
            ? items.find((item) => item.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[320px] p-0">
        <div className="max-h-[500px] overflow-y-auto">
          <div className="flex items-center border-b px-3">
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
          </div>
          <div className="p-1">
            {items.length === 0 && (
              <div className="py-6 text-center text-sm">{emptyMessage}</div>
            )}
            <div className="overflow-hidden p-1">
              {items.map((item) => (
                <div
                  key={item.value}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground"
                  onClick={() => {
                    console.log("直接點擊事件:", item.value);
                    if (onValueChange) {
                      onValueChange(item.value);
                    }
                    setInputValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0",
                    )}
                  />

                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
