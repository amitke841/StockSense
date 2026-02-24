import React, { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const popularStocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "NFLX"];

export default function QuickSearch({ onSearch }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const runSearch = (rawSymbol) => {
    const symbol = (rawSymbol || "").trim().toUpperCase();
    if (!symbol) return;

    setValue(symbol);
    setOpen(false);
    onSearch?.(symbol);
    window.location.href = `/search?symbol=${encodeURIComponent(symbol)}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between bg-white/80 backdrop-blur-sm border-slate-200"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            {value || "Search stocks..."}
          </div>
          <TrendingUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0">
        <Command>
          <div className="relative border-b p-2">
            <CommandInput
              placeholder="Search stocks..."
              value={value}
              onValueChange={setValue}
              className="pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSearch(value);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => runSearch(value)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <CommandList>
            <CommandGroup heading="Popular Stocks">
              {popularStocks.map((stock) => (
                <CommandItem
                  key={stock}
                  value={stock}
                  onSelect={(currentValue) => runSearch(currentValue)}
                  className="cursor-pointer"
                >
                  {stock}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}