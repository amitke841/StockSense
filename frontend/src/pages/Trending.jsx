
import React, { useState, useEffect } from "react";
import { Stock } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { TrendingUp, TrendingDown, Flame, MessageCircle, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TrendingStocks from "../components/trending/TrendingStocks";
import SocialBuzz from "../components/trending/SocialBuzz";
import BiggestMovers from "../components/trending/BiggestMovers";
import PopularSearches from "../components/trending/PopularSearches";

export default function TrendingPage() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("social");

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    setIsLoading(true);
    try {
      const stockData = await Stock.list("-reddit_mentions", 50);
      setStocks(stockData);
    } catch (error) {
      console.error("Error loading trending data:", error);
    }
    setIsLoading(false);
  };

  const refreshTrendingData = async () => {
    setIsRefreshing(true);
    try {
      const result = await InvokeLLM({
        prompt: `Provide current trending analysis for popular stocks based on social media activity, news mentions, and market movements. Focus on stocks that are currently getting the most attention on Reddit, Twitter, and financial news. Include sentiment analysis and what's driving the buzz.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trending_analysis: {
              type: "object",
              properties: {
                top_social_stocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      symbol: { type: "string" },
                      buzz_reason: { type: "string" },
                      sentiment: { type: "string" }
                    }
                  }
                },
                market_sentiment: { type: "string" },
                key_events: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });
      console.log("Trending refresh:", result);
    } catch (error) {
      console.error("Error refreshing trending data:", error);
    }
    setIsRefreshing(false);
  };

  const socialTrending = stocks
    .sort((a, b) => (b.reddit_mentions || 0) - (a.reddit_mentions || 0))
    .slice(0, 10);

  const biggestMovers = stocks
    .sort((a, b) => Math.abs(b.price_change_percent || 0) - Math.abs(a.price_change_percent || 0))
    .slice(0, 8);

  const topRecommended = stocks
    .filter(s => s.recommendation_score > 50)
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Trending Stocks
              </h1>
              <p className="text-slate-600 text-lg">
                Discover what's hot in the market right now
              </p>
            </div>
          </div>
          <Button
            onClick={refreshTrendingData}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2 border-orange-200 hover:bg-orange-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh Trends'}
          </Button>
        </div>

        {/* Trending Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="social" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Social Buzz
            </TabsTrigger>
            <TabsTrigger value="movers" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Big Movers
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              AI Picks
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SocialBuzz stocks={socialTrending} isLoading={isLoading} />
              </div>
              <div>
                <TrendingStocks 
                  stocks={topRecommended.slice(0, 5)} 
                  isLoading={isLoading}
                  title="🔥 Hottest Picks"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="movers" className="mt-8">
            <BiggestMovers stocks={biggestMovers} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="recommended" className="mt-8">
            <TrendingStocks 
              stocks={topRecommended} 
              isLoading={isLoading}
              title="🚀 AI Top Recommendations"
            />
          </TabsContent>

          <TabsContent value="popular" className="mt-8">
            <PopularSearches stocks={stocks.slice(0, 12)} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* Market Pulse */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            📊 Market Pulse
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stocks.filter(s => s.recommendation_score > 60).length}
              </div>
              <p className="text-slate-600">Strong Buy Signals</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stocks.filter(s => s.price_change_percent > 0).length}
              </div>
              <p className="text-slate-600">Stocks Up Today</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stocks.reduce((sum, s) => sum + (s.reddit_mentions || 0), 0).toLocaleString()}
              </div>
              <p className="text-slate-600">Total Social Mentions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
