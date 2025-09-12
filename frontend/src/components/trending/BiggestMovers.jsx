import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function BiggestMovers({ stocks, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array(4).fill(0).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const gainers = stocks.filter(s => s.price_change_percent > 0).slice(0, 4);
  const losers = stocks.filter(s => s.price_change_percent < 0).slice(0, 4);

  const MoverCard = ({ title, stocks, isGainers }) => (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
          {isGainers ? (
            <>
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-green-600">{title}</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-red-600">{title}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stocks.map((stock, index) => (
          <motion.div
            key={stock.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all duration-300 ${
              isGainers ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
              isGainers ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              {stock.symbol.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-800">{stock.symbol}</h4>
                <Badge variant="outline" className="text-xs">
                  {stock.sector}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">${stock.current_price?.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-xs">
                <Activity className="w-3 h-3 text-slate-400" />
                <span className="text-slate-500">Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold flex items-center gap-1 ${
                isGainers ? 'text-green-600' : 'text-red-600'
              }`}>
                {isGainers ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stock.price_change_percent)?.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">
                {isGainers ? '+' : ''}{stock.price_change?.toFixed(2)}
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Top Movers Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Biggest Market Movers</h2>
        <p className="text-slate-600">Stocks with the most significant price movements today</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <MoverCard title="Top Gainers" stocks={gainers} isGainers={true} />
        <MoverCard title="Top Losers" stocks={losers} isGainers={false} />
      </div>
    </div>
  );
}