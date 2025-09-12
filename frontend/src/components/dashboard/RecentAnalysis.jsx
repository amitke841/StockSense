import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentAnalysis({ stocks, isLoading }) {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Recent Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stocks.slice(0, 6).map((stock) => (
            <div 
              key={stock.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {stock.symbol.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-800">{stock.symbol}</h4>
                  <Badge className={getRiskColor(stock.risk_level)} variant="outline">
                    {stock.risk_level} risk
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Updated 2 hours ago</span>
                  <span>•</span>
                  <span>{stock.analyst_rating?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">
                  {stock.recommendation_score > 0 ? '+' : ''}{stock.recommendation_score}
                </div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}