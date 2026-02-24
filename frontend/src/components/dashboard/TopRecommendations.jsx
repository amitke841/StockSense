import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getPopularStocks } from "@/api";

export default function TopRecommendations({ title }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    async function fetchStocks() {
      try {
        const data = await getPopularStocks();
        setStocks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStocks();
  }, []);

  const getScoreColor = (score) => {
    if (score > 60) return "text-green-600";
    if (score > 20) return "text-yellow-600";
    if (score > -20) return "text-gray-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score > 60) return "bg-green-50 border-green-200";
    if (score > 20) return "bg-yellow-50 border-yellow-200";
    if (score > -20) return "bg-gray-50 border-gray-200";
    return "bg-red-50 border-red-200";
  };

  const handleNavigate = (symbol) => {
    if (!symbol) return;
    navigate(`/Search?symbol=${encodeURIComponent(symbol)}`); 
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
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
        <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stocks.map((stock, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 hover:shadow-md transition-all duration-300 ${getScoreBg(
              stock.sentiment
            )}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg text-slate-800">{stock.symbol}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleNavigate(stock.symbol)} 
                    className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mb-1">{stock.name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-slate-800">
                    ${stock.current_price?.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(stock.sentiment)}`}>
                  {stock.sentiment}
                </div>
                <div className="text-xs text-slate-500 font-semibold">Sentiment Score</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Investment Strength</span>
                <span>{Math.abs(stock.sentiment)}%</span>
              </div>
              <Progress
                value={Math.abs(stock.sentiment)}
                className={`h-2 ${stock.sentiment > 0 ? "text-green-500" : "text-red-500"}`}
              />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}