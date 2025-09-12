import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const popularStocks = [
  "AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "NFLX"
];

export default function QuickSearch({ onSearch }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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
            {value ? value : "Search stocks..."}
          </div>
          <TrendingUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search stocks..." />
          <CommandList>
            <CommandEmpty>No stocks found.</CommandEmpty>
            <CommandGroup heading="Popular Stocks">
              {popularStocks.map((stock) => (
                <CommandItem
                  key={stock}
                  value={stock}
                  onSelect={(currentValue) => {
                    setValue(currentValue.toUpperCase());
                    setOpen(false);
                    onSearch(currentValue.toUpperCase());
                  }}
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