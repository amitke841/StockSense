import React, { useState, useEffect } from "react";
import { Stock } from "@/api/entities";

import MarketOverview from "../components/dashboard/MarketOverview";
import TopRecommendations from "../components/dashboard/TopRecommendations";
import QuickSearch from "../components/dashboard/QuickSearch";

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const topGainers = stocks.filter((s) => s.recommendation_score > 50).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Market Dashboard</h1>
            <p className="text-slate-600 text-lg">AI-powered stock analysis and recommendations</p>
          </div>
          <div className="flex items-center gap-4">
            <QuickSearch />
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Only Top Recommendations below Market Overview */}
        <TopRecommendations stocks={topGainers} isLoading={isLoading} title="Top Stocks" />
      </div>
    </div>
  );
}