import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Brain, Star, Info } from 'lucide-react';import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { metricDefinitions } from './metricDefinitions'; 

const MetricItem = ({ label, value, format, onLabelClick }) => {
    const formattedValue = format ? format(value) : value;
    return (
        <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200 last:border-b-0">
            <button onClick={() => onLabelClick(label)} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors group">
                <span className="group-hover:underline">{label}</span>
                <Info className="w-3 h-3" />
            </button>
            <span className="font-semibold text-slate-800">{formattedValue || 'N/A'}</span>
        </div>
    );
};

export default function StockAnalysisCard({ analysisData }) {
  const [isWatched, setIsWatched] = useState(false);
  const [user, setUser] = useState(null);
    const [infoAlert, setInfoAlert] = useState({ open: false, title: "", description: "" });

  const handleShowInfo = (metricLabel) => {
    if (metricDefinitions[metricLabel]) {
      setInfoAlert({
        open: true,
        title: metricLabel,
        description: metricDefinitions[metricLabel],
      });
    }
  };

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
    await User.updateMyUserData({ watchlist: newWatchlist });
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

  const formatNumber = (num) => num ? num.toLocaleString() : 'N/A';
  const formatCurrency = (num) => num ? `$${num.toFixed(2)}` : 'N/A';
  const formatLargeNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
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
                  {formatCurrency(analysisData.current_price)}
                </span>
                <div className="flex items-center gap-1">
                  {analysisData.current_price >= analysisData.last_close ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    analysisData.current_price >= analysisData.last_close ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysisData.change_ps.toFixed(1)}%
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
                  {/* Graph Placeholder */}
                  <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">graph</span>
                  </div>

                  {/* Analysis Summary */}
                    <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              AI Analysis Summary
            </h4>
            <p className="text-slate-700">{analysisData.analysis_summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Core Price Metrics</h4>
              <div className="bg-white p-3 rounded-lg border">
                <MetricItem label="Open" value={analysisData?.open} format={formatCurrency} onLabelClick={handleShowInfo} />
                <MetricItem label="Last Close" value={analysisData?.last_close} format={formatCurrency} onLabelClick={handleShowInfo} />
                <MetricItem label="High" value={analysisData?.high} format={formatCurrency} onLabelClick={handleShowInfo} />
                <MetricItem label="Low" value={analysisData?.low} format={formatCurrency} onLabelClick={handleShowInfo} />
                <MetricItem label="Day Range" value={analysisData?.range} onLabelClick={handleShowInfo} />
                <MetricItem label="Volume" value={analysisData?.volume} format={formatNumber} onLabelClick={handleShowInfo} />
                <MetricItem label="Bid" value={analysisData?.bid} onLabelClick={handleShowInfo} />
                <MetricItem label="Ask" value={analysisData?.ask} onLabelClick={handleShowInfo} />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Key Metrics</h4>
              <div className="bg-white p-3 rounded-lg border">
                <MetricItem label="Market Cap" value={analysisData?.market_cap} format={formatLargeNumber} onLabelClick={handleShowInfo} />
                <MetricItem label="P/E Ratio" value={analysisData?.pe_ratio?.toFixed(2)} onLabelClick={handleShowInfo} />
                <MetricItem label="EPS" value={analysisData?.eps} format={formatCurrency} onLabelClick={handleShowInfo} />
                <MetricItem label="Revenue Growth (YoY)" value={analysisData?.revenue_growth} onLabelClick={handleShowInfo} />
                <MetricItem label="Profit Margin" value={analysisData?.profit_margin} onLabelClick={handleShowInfo} />
                <MetricItem label="ROE" value={analysisData?.roe} onLabelClick={handleShowInfo} />
                <MetricItem label="Debt-to-Equity" value={analysisData?.debt_to_equity?.toFixed(2)} onLabelClick={handleShowInfo} />
                <MetricItem label="Beta" value={analysisData?.beta?.toFixed(2)} onLabelClick={handleShowInfo} />
              </div>
            </div>
          </div>

          {analysisData.key_highlights && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
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

          {analysisData.risk_factors && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Risk Factors
              </h4>
              <div className="grid gap-2">
                {analysisData.risk_factors.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
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
                className="absolute w-4 h-4 bg-white rounded-full border-2 border-slate-700 transform -translate-x-1/2"
                style={{ left: `${((analysisData.recommendation_score + 100) / 200) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={infoAlert.open} onOpenChange={(open) => setInfoAlert({ ...infoAlert, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{infoAlert.title}</AlertDialogTitle>
            <AlertDialogDescription className="pt-4 text-base text-slate-700">
              {infoAlert.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
