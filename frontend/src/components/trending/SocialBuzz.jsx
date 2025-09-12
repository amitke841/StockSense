import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function SocialBuzz({ stocks, isLoading }) {
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'bullish': return 'bg-green-100 text-green-700 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBuzzLevel = (mentions) => {
    if (mentions > 1500) return { level: 'Viral', color: 'text-red-600', bg: 'bg-red-50' };
    if (mentions > 1000) return { level: 'Hot', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (mentions > 500) return { level: 'Trending', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Rising', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
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
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Social Media Buzz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {stocks.map((stock, index) => {
            const buzz = getBuzzLevel(stock.reddit_mentions);
            return (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${buzz.bg} border-opacity-30`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-slate-800">{stock.symbol}</h4>
                      <Badge className={`${buzz.color} ${buzz.bg} border`}>
                        {buzz.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{stock.company_name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold">{stock.reddit_mentions} mentions</span>
                      </div>
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
                    <div className="text-xl font-bold text-slate-800">
                      {stock.recommendation_score}
                    </div>
                    <div className="text-xs text-slate-500">AI Score</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Social Activity</span>
                    <span>{Math.min(100, (stock.reddit_mentions / 20))}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (stock.reddit_mentions / 20))} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={`${getSentimentColor(stock.twitter_sentiment)} border`}>
                    {stock.twitter_sentiment} sentiment
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3 h-3" />
                    <span>High engagement</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}