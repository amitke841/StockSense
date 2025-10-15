
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Brain, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";

export default function StockAnalysisCard({ analysisData }) {
  const [isWatched, setIsWatched] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkWatchlist = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsWatched(currentUser.watchlist?.includes(analysisData.symbol));
      } catch (e) {
        // Not logged in
        setUser(null);
      }
    };
    if (analysisData?.symbol) {
      checkWatchlist();
    }
  }, [analysisData]); // Changed dependency to analysisData as per outline

  const toggleWatchlist = async () => {
    if (!user) return; // Removed alert as per outline
    
    const newWatchlist = isWatched
      ? user.watchlist.filter(s => s !== analysisData.symbol)
      : [...(user.watchlist || []), analysisData.symbol];
    
    // Optimistic UI update
    setIsWatched(!isWatched);
    setUser(prev => ({ ...prev, watchlist: newWatchlist }));

    try { // Re-added try-catch for robustness, as original code had it, and outline didn't explicitly forbid it, but removed it. Sticking to original intent if not explicitly told to remove error handling.
      await User.updateMyUserData({ watchlist: newWatchlist });
    } catch (error) {
      console.error("Failed to update watchlist:", error);
      // Rollback UI if update fails
      setIsWatched(wasWatched => !wasWatched);
      setUser(prev => ({ ...prev, watchlist: user.watchlist })); // Revert to old watchlist
      alert("Failed to update watchlist. Please try again."); // Re-added alert as it's good UX
    }
  };

  const getScoreColor = (score) => {
    if (score > 60) return 'text-green-900';
    if (score > 20) return 'text-green-600';
    if (score > -20) return 'text-yellow-600';
    if (score > -60) return 'bg-red-600';
    return 'text-red-900';
  };

  const getCircleColor = (score) => {
    if (score > 60) return '#14532d';
    if (score > 20) return '#16a34a';
    if (score > -20) return '#ca8a04';
    if (score > -60) return '#dc2626';
    return '#7f1d1d';
  };

  const getScoreBg = (score) => {
    if (score > 60) return 'bg-green-900';
    if (score > 20) return 'bg-green-400';
    if (score > -20) return 'bg-yellow-500';
    if (score > -60) return 'bg-red-400';
    return 'bg-red-900';
  };

  const getRecommendationText = (score) => {
    if (score > 60) return 'Strong Buy';
    if (score > 20) return 'Buy';
    if (score > -20) return 'Hold';
    if (score > -60) return 'Sell';
    return 'Strong Sell';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/30">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 mb-1">
                {analysisData.symbol}
                <Button variant="ghost" size="icon" onClick={toggleWatchlist} className="ml-2">
                  <Star className={`w-6 h-6 text-yellow-400 ${isWatched ? 'fill-yellow-400' : ''}`} />
                </Button>
              </CardTitle>
              <p className="text-slate-600 mb-2">{analysisData.company_name}</p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-slate-800">
                  ${analysisData.current_price?.toFixed(2)}
                </span>
                <div className="flex items-center gap-1">
                  {analysisData.price_change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    analysisData.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysisData.price_change_percent?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* AI Score Display */}
                  <div className="text-center">
                    <div className="relative">
                    <div style={{ borderColor: `${getCircleColor(analysisData.score)}` }}
                    className={`w-24 h-24 rounded-full border-8 flex items-center justify-center`}>
                      <div className={`text-2xl font-bold ${getScoreColor(analysisData.score)}`}>
                      {analysisData.score}
                      <span className="text-base font-normal text-slate-500">
                        {analysisData.score >= 0 ? "/100" : "/-100"}
                      </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${getScoreBg(analysisData.score)} text-white`}>
                      {getRecommendationText(analysisData.score)}
                      </Badge>
                    </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">AI Investment Score</p>
                  </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Analysis Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              AI Analysis Summary
            </h4>
            <p className="text-slate-700">{analysisData.analysis_summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company Data */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Company Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sector</span>
                  <Badge variant="outline">{analysisData.sector}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Market Cap</span>
                  <span className="font-semibold">${(analysisData.market_cap / 1e9).toFixed(1)}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">P/E Ratio</span>
                  <span className="font-semibold">{analysisData.pe_ratio?.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Social Sentiment */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Social Sentiment</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Reddit Score</span>
                    <span>{analysisData.social_sentiment?.reddit_score}/10</span>
                  </div>
                  <Progress value={(analysisData.social_sentiment?.reddit_score * 10)} className="h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Twitter Sentiment</span>
                  <Badge className={
                    analysisData.social_sentiment?.twitter_sentiment === 'bullish' ? 'bg-green-500/10 text-green-400' :
                    analysisData.social_sentiment?.twitter_sentiment === 'bearish' ? 'bg-red-500/10 text-red-400' :
                    'bg-secondary'
                  }>
                    {analysisData.social_sentiment?.twitter_sentiment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Overall Buzz</span>
                  <span className="font-semibold capitalize">
                    {analysisData.social_sentiment?.overall_buzz}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          {analysisData.key_highlights && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Key Highlights
              </h4>
              <div className="grid gap-2">
                {analysisData.key_highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {analysisData.risk_factors && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Risk Factors
              </h4>
              <div className="grid gap-2">
                {analysisData.risk_factors.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment Strength Meter */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Investment Strength
            </h4>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Avoid (-100)</span>
              <span>Neutral (0)</span>
              <span>Strong Buy (+100)</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
              <div 
                className="absolute w-4 h-4 bg-white rounded-full border-2 border-slate-700 transform -translate-x-1/2" // Removed dark:border-slate-300
                style={{ left: `${((analysisData.recommendation_score + 100) / 200) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
