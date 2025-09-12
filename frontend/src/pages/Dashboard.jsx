import React, { useState, useEffect } from "react";
import { Stock } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { TrendingUp, TrendingDown, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import MarketOverview from "../components/dashboard/MarketOverview";
import TopRecommendations from "../components/dashboard/TopRecommendations";
import RecentAnalysis from "../components/dashboard/RecentAnalysis";
import QuickSearch from "../components/dashboard/QuickSearch";

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const stockData = await Stock.list("-recommendation_score", 20);
      setStocks(stockData);
    } catch (error) {
      console.error("Error loading stocks:", error);
    }
    setIsLoading(false);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API refresh with AI analysis
    try {
      const result = await InvokeLLM({
        prompt: `Provide current stock market analysis for popular stocks including AAPL, TSLA, NVDA, MSFT, GOOGL. For each stock, provide:
        - Current price and change
        - Social sentiment analysis
        - Investment recommendation score (-100 to 100)
        - Key factors affecting the stock`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_update: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  analysis: { type: "string" },
                  sentiment_change: { type: "string" }
                }
              }
            }
          }
        }
      });
      console.log("Market refresh:", result);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setIsRefreshing(false);
  };

  const topGainers = stocks.filter(s => s.recommendation_score > 50).slice(0, 5);
  const watchList = stocks.filter(s => s.recommendation_score > 20).slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Market Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              AI-powered stock analysis and recommendations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshData}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh Data'}
            </Button>
            <QuickSearch onSearch={setSearchQuery} />
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Top Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            <TopRecommendations 
              stocks={topGainers} 
              isLoading={isLoading}
              title="🚀 Top AI Recommendations"
            />
            
            <RecentAnalysis 
              stocks={watchList}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Highlights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Analyzed Stocks</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {stocks.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Strong Buys</span>
                  <Badge className="bg-green-100 text-green-700">
                    {stocks.filter(s => s.recommendation_score > 60).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avoid</span>
                  <Badge className="bg-red-100 text-red-700">
                    {stocks.filter(s => s.recommendation_score < -20).length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Market Sentiment</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Reddit Activity</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-semibold">High</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Twitter Buzz</span>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 font-semibold">Medium</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Overall Mood</span>
                  <Badge className="bg-green-100 text-green-700">Bullish</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}