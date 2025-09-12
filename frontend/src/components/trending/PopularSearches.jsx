import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularSearches({ stocks, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border animate-pulse">
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const popularStocks = stocks
    .sort((a, b) => (b.reddit_mentions + (b.recommendation_score * 10)) - (a.reddit_mentions + (a.recommendation_score * 10)))
    .slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Eye className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Most Watched Stocks</h2>
        <p className="text-slate-600">Stocks getting the most attention from investors</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Search className="w-5 h-5 text-indigo-500" />
            Popular Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularStocks.map((stock, index) => (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 bg-white/60"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{stock.symbol}</h4>
                    <p className="text-xs text-slate-500 truncate">{stock.company_name}</p>
                  </div>
                  <Badge className="text-xs bg-indigo-100 text-indigo-700">
                    #{index + 1}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Price</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">${stock.current_price?.toFixed(2)}</span>
                      <div className={`flex items-center ${
                        stock.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">
                          {stock.price_change_percent?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">AI Score</span>
                    <span className={`font-bold ${
                      stock.recommendation_score > 50 ? 'text-green-600' : 
                      stock.recommendation_score > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stock.recommendation_score}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Mentions</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{stock.reddit_mentions}</span>
                      <Eye className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-indigo-600 hover:bg-indigo-50"
                >
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-slate-800">Trending Topics</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {["AI Revolution", "EV Market", "Tech Earnings", "Federal Reserve", "Crypto Adoption", "Green Energy"].map((topic, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-white/60 hover:bg-white/80 cursor-pointer transition-colors"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}