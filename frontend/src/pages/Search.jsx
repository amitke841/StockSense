import React, { useEffect, useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Stock } from "@/api/entities";
import { Search, TrendingUp, AlertCircle, Loader2, Gauge, TrendingUpDown, BadgeInfo  } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { analyzeStock as analyzeStockApi } from "@/api";
import { getData as getDataApi } from "@/api";
import { getGraphData } from "@/api";

import StockAnalysisCard from "../components/search/StockAnalysisCard";
import { calculateConfidence } from "../utils/confidence";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // Renamed for clarity
  const [error, setError] = useState(null);
  // const [scoreResult, setScoreResult] = useState(null);
  // const [stockData, setStockData] = useState(null);
  // const [graphData, setGraphData] = useState(null);

  const analyzeStock = async (inputSymbol = searchQuery) => {
    const querySource = typeof inputSymbol === "string" ? inputSymbol : searchQuery;
    if (!querySource?.trim()) return;

    const query = querySource.trim().toUpperCase();
    setSearchQuery(query);

    // keep URL in sync
    const url = new URL(window.location.href);
    url.searchParams.set("symbol", query);
    window.history.replaceState({}, "", url);

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      // Run all API calls sequentially in one try block, STOCK DATA WITH STOCK SEN INSIDE, ONE FILE
      const score = await analyzeStockApi(query);
      const data = await getDataApi(query);
      const dataForGraph = await getGraphData(query);

      console.log(score.confidence);
      console.log(dataForGraph);
      console.log(score.sentiment);

      const confidence = await calculateConfidence(
        score.confidence,
        dataForGraph,
        score.sentiment
      );

      const result = {
        symbol: score.stock_symbol.toUpperCase(),
        score: score.sentiment,
        confidence: confidence,
        company_name: data.longName,
        current_price: data.currentPrice,
        open: data.open,
        last_close: data.lastClose,
        high: data.high,
        low: data.low,
        range: data.dayRange,
        volume: data.volume,
        bid: data.bid,
        ask: data.ask,
        market_cap: data.marketCap,
        pe_ratio: data.peRatio,
        eps: data.eps,
        revenue_growth: data.revenueGrowth,
        profit_margin: data.profitMargin,
        roe: data.roe,
        debt_to_equity: data.dte,
        beta: data.beta,
        analysis_summary: data.summary,
        //change:
        change_ps: data.changePS,
        graphData: dataForGraph // Added graphData here
      };

      console.log(result);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error during stock analysis:", error); // Log exact error
      setError("Failed to analyze stock. Please try again.");
    }

    setIsAnalyzing(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbolFromUrl = params.get("symbol") || params.get("q");

    if (symbolFromUrl && symbolFromUrl.trim()) {
      analyzeStock(symbolFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      analyzeStock();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Analyze smarter, trade wiser
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get real-time sentiment scores, tomorrow’s price predictions, detailed stock insights with interactive 
            graphs, and latest news—everything you need to make informed decisions.
          </p>
        </div>

        {/* Search Interface */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Please Enter Stock Symbol:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="e.g., AAPL, Tesla, NVDA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pl-10 py-3 text-lg border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button
                onClick={() => analyzeStock()}
                disabled={isAnalyzing || !searchQuery.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 px-8 text-lg font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analyze Stock
                  </>
                )}
              </Button>
            </div>

            {/* Popular suggestions */}
            <div className="mt-6">
              <p className="text-sm text-slate-600 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "NFLX"].map((symbol) => (
                  <Badge
                    key={symbol}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 px-3 py-1"
                    onClick={() => setSearchQuery(symbol)}
                  >
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" /> {/* Corrected className */}
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <StockAnalysisCard analysisData={analysisResult} />
        )}

        {/* How it works */}
        <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/20 mt-12">
          <CardHeader>
            <CardTitle className="text-center text-slate-800">How Our Smart Analysis Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gauge className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Sentiment Insights</h4>
                <p className="text-slate-600 text-sm">
                  Gauge market mood instantly with our sentiment scores, helping you understand how investors feel about each stock.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUpDown className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Predictive Analytics</h4>
                <p className="text-slate-600 text-sm">
                  See tomorrow’s stock value predictions at a glance, so you can plan smarter trades with confidence.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BadgeInfo className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Comprehensive Stock Details</h4>
                <p className="text-slate-600 text-sm">
                  Dive into detailed charts, graphs, and news updates to get the full picture before making decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
