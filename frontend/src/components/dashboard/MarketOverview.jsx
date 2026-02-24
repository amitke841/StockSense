import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getMarketStatus } from "@/api";

async function fetchMarketData() {
  try {
    const data = await getMarketStatus();
    return data;
  } catch (err) {
    console.error("Failed to fetch market data:", err);
    return null;
  }
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMarket() {
      setIsLoading(true);
      const data = await fetchMarketData();
      if (data && data.indexes) {
        // Transform API dict to array for mapping
        const arr = Object.entries(data.indexes).map(([name, info]) => {
          const change = info.change ?? 0;
          return {
            name,
            value: info.price?.toLocaleString() ?? "-",
            change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
            changePercent:
              info.price && info.change
                ? `${((change / (info.price - change)) * 100).toFixed(2)}%`
                : "-",
            isPositive: change >= 0
          };
        });
        setMarketData(arr);
      } else {
        setMarketData([]);
      }
      setIsLoading(false);
    }

    loadMarket();
  }, []);

  if (isLoading) {
    return <p className="text-slate-600">Loading market data...</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {marketData.map((item, index) => (
        <Card
          key={index}
          className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-600">{item.name}</h4>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-800">{item.value}</p>
              <div className="flex items-center gap-1">
                {item.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    item.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.change} ({item.changePercent})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}