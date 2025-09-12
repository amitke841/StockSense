import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingStocks({ stocks, isLoading, title }) {
  const getScoreColor = (score) => {
    if (score > 60) return 'text-green-600';
    if (score > 20) return 'text-yellow-600';
    if (score > -20) return 'text-gray-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score > 60) return 'bg-green-50 border-green-200';
    if (score > 20) return 'bg-yellow-50 border-yellow-200';
    if (score > -20) return 'bg-gray-50 border-gray-200';
    return 'bg-red-50 border-red-200';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Star className="w-5 h-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stocks.map((stock, index) => (
          <motion.div
            key={stock.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${getScoreBg(stock.recommendation_score)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg text-slate-800">{stock.symbol}</h4>
                  <Badge variant="outline" className="text-xs">
                    {stock.sector}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">{stock.company_name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-slate-800">
                    ${stock.current_price?.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    {stock.price_change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={stock.price_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stock.price_change_percent?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(stock.recommendation_score)}`}>
                  {stock.recommendation_score}
                </div>
                <div className="text-xs text-slate-500 font-semibold">AI Score</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Investment Strength</span>
                <span>{Math.abs(stock.recommendation_score)}%</span>
              </div>
              <Progress 
                value={Math.abs(stock.recommendation_score)} 
                className={`h-2 ${stock.recommendation_score > 0 ? 'text-green-500' : 'text-red-500'}`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="text-xs bg-blue-100 text-blue-700">
                  {stock.reddit_mentions} Reddit
                </Badge>
                <Badge className="text-xs bg-purple-100 text-purple-700">
                  {stock.twitter_sentiment}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Target className="w-3 h-3" />
                <span>{stock.risk_level} risk</span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}