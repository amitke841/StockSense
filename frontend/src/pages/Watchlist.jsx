import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Stock } from "@/api/entities";
import { Star, TrendingUp, TrendingDown, Search, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const WatchlistCard = ({ stock, onRemove }) => {
  const isPositive = stock.price_change_percent >= 0;
  return (
    <Card className="bg-white hover:bg-slate-50 transition-all duration-200">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
            isPositive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            {stock.symbol.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-lg text-slate-800">{stock.symbol}</h4>
            <p className="text-sm text-slate-600 truncate max-w-[150px]">{stock.company_name}</p>
          </div>
        </div>
        <div className="hidden md:block">
          <Badge className="text-xs" variant="outline">{stock.sector}</Badge>
        </div>
        <div className="hidden lg:block text-center">
          <p className="font-semibold text-lg">${stock.current_price?.toFixed(2)}</p>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{stock.price_change_percent?.toFixed(2)}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className={`font-bold text-2xl ${
            stock.recommendation_score > 60 ? 'text-green-600' :
            stock.recommendation_score > 20 ? 'text-yellow-600' : 'text-red-600'
          }`}>{stock.recommendation_score}</p>
          <p className="text-xs text-slate-500">AI Score</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(stock.symbol)}>
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default function WatchlistPage() {
  const [user, setUser] = useState(null);
  const [watchedStocks, setWatchedStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWatchlist = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser.watchlist && currentUser.watchlist.length > 0) {
          const stocks = await Stock.filter({ symbol: { '$in': currentUser.watchlist } });
          setWatchedStocks(stocks);
        } else {
          setWatchedStocks([]);
        }
      } catch (error) {
        console.error("Failed to load watchlist", error);
        setUser(null); // Not logged in
      }
      setIsLoading(false);
    };
    loadWatchlist();
  }, []);

  const handleRemoveFromWatchlist = async (symbol) => {
    if (!user) return;
    const newWatchlist = user.watchlist.filter(s => s !== symbol);
    setUser(prev => ({ ...prev, watchlist: newWatchlist }));
    setWatchedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    await User.updateMyUserData({ watchlist: newWatchlist });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">My Watchlist</h1>
            <p className="text-slate-600 text-lg">Your personally tracked stocks.</p>
          </div>
        </div>

        {watchedStocks.length === 0 ? (
          <Card className="text-center p-12 bg-white border-dashed">
            <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Your Watchlist is Empty</h3>
            <p className="text-slate-600 mb-6">
              Add stocks to your watchlist to track their performance here.
            </p>
            <Link to={createPageUrl("Search")}>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Find Stocks to Watch
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {watchedStocks.map(stock => (
              <WatchlistCard
                key={stock.id}
                stock={stock}
                onRemove={handleRemoveFromWatchlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}