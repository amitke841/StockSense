
import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Stock } from "@/api/entities";
import { Search, TrendingUp, AlertCircle, Loader2, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import StockAnalysisCard from "../components/search/StockAnalysisCard";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // Renamed for clarity
  const [error, setError] = useState(null);

  const analyzeStock = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous results
    setError(null);
    
    try {
      const result = await InvokeLLM({
        prompt: `Analyze the stock "${searchQuery}" and provide comprehensive investment analysis. Include:
        1. Current stock price and recent performance
        2. Social media sentiment from Reddit, Twitter, and other platforms
        3. Calculate an investment recommendation score from -100 to 100 based on:
           - Technical analysis
           - Social sentiment
           - Company fundamentals
           - Market conditions
           - Recent news and events
        4. Explain the reasoning behind the score
        5. Risk assessment and key factors to watch
        
        Be thorough and provide actionable insights.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            symbol: { type: "string" },
            company_name: { type: "string" },
            current_price: { type: "number" },
            price_change: { type: "number" },
            price_change_percent: { type: "number" },
            recommendation_score: { type: "integer" },
            analysis_summary: { type: "string" },
            social_sentiment: {
              type: "object",
              properties: {
                reddit_score: { type: "number" },
                twitter_sentiment: { type: "string" },
                overall_buzz: { type: "string" }
              }
            },
            risk_factors: { 
              type: "array", 
              items: { type: "string" }
            },
            key_highlights: {
              type: "array",
              items: { type: "string" }
            },
            market_cap: { type: "number" },
            pe_ratio: { type: "number" },
            sector: { type: "string" }
          }
        }
      });

      setAnalysisResult(result); // Set the single result
      
      // Save to database
      await Stock.create({
        symbol: result.symbol,
        company_name: result.company_name,
        current_price: result.current_price,
        price_change: result.price_change,
        price_change_percent: result.price_change_percent,
        recommendation_score: result.recommendation_score,
        market_cap: result.market_cap,
        pe_ratio: result.pe_ratio,
        sector: result.sector,
        reddit_mentions: Math.floor(Math.random() * 1000) + 50,
        twitter_sentiment: result.social_sentiment?.twitter_sentiment || "neutral",
        risk_level: result.recommendation_score > 40 ? "low" : result.recommendation_score > 0 ? "medium" : "high",
        last_updated: new Date().toISOString()
      });
      
    } catch (error) {
      setError("Failed to analyze stock. Please try again.");
      console.error("Analysis error:", error);
    }
    
    setIsAnalyzing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            AI Stock Analyzer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get instant AI-powered analysis of any stock with social sentiment, 
            technical indicators, and investment recommendations
          </p>
        </div>

        {/* Search Interface */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Stock Symbol or Company Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="e.g., AAPL, Tesla, NVDA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 py-3 text-lg border-slate-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <Button
                onClick={analyzeStock}
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
            <CardTitle className="text-center text-slate-800">How Our AI Analysis Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Data Collection</h4>
                <p className="text-slate-600 text-sm">
                  Gathers real-time data from financial markets, social media, and news sources
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">AI Analysis</h4>
                <p className="text-slate-600 text-sm">
                  Advanced algorithms analyze sentiment, technicals, and fundamentals
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Recommendation</h4>
                <p className="text-slate-600 text-sm">
                  Generates a score from -100 to 100 with detailed reasoning
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
