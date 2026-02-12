import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react"; // Add this import at the top

export default function StockNewsCarousel({ symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const visibleCount = 3;

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);

      try {
        const rssUrl = `https://finance.yahoo.com/rss/headline?s=${symbol}`;
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=shbpiegf6tseejm5i4p4tl881tbgegfhyahtgyqz`
        );

        if (!response.ok) throw new Error("Failed to fetch RSS feed");

        const data = await response.json();

        if (!data.items) throw new Error("No news items found");

        setNews(data.items);
        setStartIndex(0);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [symbol]);

  const next = () => {
    setDirection(1);
    setStartIndex((prev) => (prev + 1) % news.length);
  };

  const prev = () => {
    setDirection(-1);
    setStartIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  if (loading) return <Card className="p-6 rounded-2xl shadow-lg"><CardContent className="text-center">Loading news for {symbol}...</CardContent></Card>;
  if (error) return <Card className="p-6 rounded-2xl shadow-lg"><CardContent className="text-center text-red-500">Error loading news: {error}</CardContent></Card>;
  if (!news.length) return <Card className="p-6 rounded-2xl shadow-lg"><CardContent className="text-center">No news found for {symbol}</CardContent></Card>;

  const displayedNews = [];
  for (let i = 0; i < visibleCount; i++) {
    displayedNews.push(news[(startIndex + i) % news.length]);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-muted-foreground" />
          Latest News · {symbol}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={next}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          key={startIndex}
          className="flex gap-4"
          initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
          transition={{ type: "tween", duration: 0.5 }}
        >
          {displayedNews.map((current, idx) => (
            <CardContent key={idx} className="flex-1 p-4 border rounded-xl hover:shadow-md transition-shadow">
              <a href={current.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                <h3 className="text-md font-medium mb-2 line-clamp-3 group-hover:underline">{current.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(current.pubDate).toLocaleDateString()}</span>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </div>
              </a>
            </CardContent>
          ))}
        </motion.div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {news.map((_, i) => (
          <span
            key={i}
            onClick={() => setStartIndex(i)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-all ${i >= startIndex && i < startIndex + visibleCount ? 'bg-foreground w-4' : 'bg-foreground/50'}`}
          ></span>
        ))}
      </div>
    </Card>
  );
}
