import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const marketData = [
  {
    name: "S&P 500",
    value: "4,567.89",
    change: "+12.45",
    changePercent: "+0.27%",
    isPositive: true
  },
  {
    name: "NASDAQ",
    value: "14,234.56",
    change: "-23.67",
    changePercent: "-0.17%",
    isPositive: false
  },
  {
    name: "DOW",
    value: "35,678.12",
    change: "+89.34",
    changePercent: "+0.25%",
    isPositive: true
  },
  {
    name: "VIX",
    value: "18.45",
    change: "-1.23",
    changePercent: "-6.25%",
    isPositive: true
  }
];

export default function MarketOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {marketData.map((item, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
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
                <span className={`text-xs font-semibold ${
                  item.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
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