import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Search, BarChart3, Star, Activity, TrendingDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getMarketStatus } from "@/api";


const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3 },
  { title: "Search Stocks", url: createPageUrl("Search"), icon: Search },
];

// Fetch market data from your Python API
async function fetchMarketData() {
  try {
    const data = await getMarketStatus();
    return data;
  } catch (err) {
    console.error("Failed to fetch market data:", err);
    return null;
  }
}

export default function Layout({ children }) {
  const location = useLocation();
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    async function loadMarket() {
      const data = await fetchMarketData();
      setMarketData(data);
    }
    loadMarket();
  }, []);

  const indexesArray = marketData?.indexes
    ? Object.entries(marketData.indexes).map(([name, info]) => {
        const change = info.change ?? 0;
        return {
          name,
          value: info.price?.toLocaleString() ?? "-",
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          isPositive: change >= 0,
        };
      })
    : [];

  return (
    <SidebarProvider>
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/50 glass-effect">
          <SidebarHeader className="border-b border-slate-200/50 p-6">
            <div className="flex items-center gap-3">
              {/* Gradient Icon */}
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StockSense
                </h2>
                <p className="text-xs text-slate-500 font-medium">Smart Stock Analytics</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4 flex flex-col h-full">
            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl px-4 py-3 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-semibold">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Market Status */}
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Market Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  {/* Market Open / Closed */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Market Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        marketData?.market_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {marketData?.market_open ? "OPEN" : "CLOSED"}
                    </span>
                  </div>

                  {/* Indexes: show only percent change */}
                  {indexesArray.map((item) => {
                    // Calculate percent change
                    const percentChange =
                      marketData?.indexes[item.name]?.price && marketData?.indexes[item.name]?.change
                        ? ((marketData.indexes[item.name].change /
                            (marketData.indexes[item.name].price - marketData.indexes[item.name].change)) *
                            100
                          ).toFixed(2)
                        : "-";

                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{item.name}</span>
                        <span className={`font-semibold ${item.isPositive ? "text-green-600" : "text-red-600"}`}>
                          {percentChange !== "-" ? `${percentChange}%` : "-"}
                        </span>
                      </div>
                    );
                  })}

                  {!marketData && <p className="text-xs text-slate-400">Loading...</p>}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto px-4 py-3">
              <p className="text-[10px] text-slate-400 tracking-wide">by Amit Keshet</p>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StockSense
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}