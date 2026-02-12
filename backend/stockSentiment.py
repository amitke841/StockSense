import os
import nltk
import praw
import yfinance as yf
import pandas as pd
import numpy as np
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import itertools
from abc import ABC, abstractmethod

# --- Load environment variables ---
load_dotenv()
required_vars = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT']
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing environment variables: {', '.join(missing_vars)}")

# --- NLTK setup ---
nltk.download('vader_lexicon', quiet=True)

# --- StockInfo ---
class StockInfo:
    def symbol_exists(self, symbol):
        try:
            ticker = yf.Ticker(symbol)
            price = ticker.info.get("currentPrice")
            return price is not None
        except Exception as e:
            raise RuntimeError(f"Stock symbol '{symbol}' lookup failed: {e}") from e

# --- Interface ---
class DataFetcher(ABC):
    @abstractmethod
    def fetch_data(self, stock: str, time_period: str):
        pass
    
    @abstractmethod
    def data_to_DF(self, stock_symbol: str) -> pd.DataFrame:
        pass

# --- Reddit Fetcher ---
class RedditPostData(DataFetcher):
    def __init__(self):
        try:
            self.reddit = praw.Reddit(
                client_id=os.getenv('REDDIT_CLIENT_ID'),
                client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
                user_agent=os.getenv('REDDIT_USER_AGENT')
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Reddit client: {e}") from e

    def fetch_data(self, stock: str, time_period: str):
        try:
            listing = self.reddit.subreddit("stocks+investing+wallstreetbets").search(
                f"{stock} stock", limit=100, sort="hot", time_filter=time_period
            )
            first_item = next(listing, None)
            if first_item is None:
                return None
            return itertools.chain([first_item], listing)
        except Exception as e:
            raise RuntimeError(f"Failed to fetch submissions for {stock} ({time_period}): {e}") from e

    def data_to_DF(self, stock_symbol: str) -> pd.DataFrame:
        posts = []
        print("Starting to extract posts...")

        for period in ["day", "week", "month", "year"]:
            print(f"Extracting posts for: {period}")
            submissions = self.fetch_data(stock_symbol, period)
            if submissions:
                for post in submissions:
                    try:
                        posts.append({
                            "title": getattr(post, "title", "") or "",
                            "text": getattr(post, "selftext", "") or "",
                            "score": getattr(post, "score", 0) or 0,
                            "created_utc": getattr(post, "created_utc", None)
                        })
                    except Exception:
                        # Skip malformed posts but continue processing others
                        continue

                    # Stop fetching if we have at least 2 posts
                    if len(posts) >= 2:
                        break

                if len(posts) >= 2:
                    break
            else:
                print("Resuming search with a larger period...")

        if len(posts) < 2:
            raise RuntimeError(f"Insufficient Reddit posts found for '{stock_symbol}'. At least 2 posts are required.")

        return pd.DataFrame(posts)

# --- Sentiment Analysis ---
class SentimentAnalysis:
    def __init__(self):
        try:
            self.sia = SentimentIntensityAnalyzer()
        except Exception as e:
            raise RuntimeError(f"Failed to initialize SentimentIntensityAnalyzer: {e}") from e

        self.last_df = None

        # extend lexicon, examples
        self.sia.lexicon.update({
            'bagholder': -3.0,
            'scam': -4.0,
            'overvalued': -2.5,
            'undervalued': 2.5,
            'moon': 3.0,
            'rekt': -3.5
        })

    # ---- Trend Score ----
    def predict_trend(self, posts_df):

        if posts_df is None or posts_df.empty:
            return 0.0

        posts_df['title'] = posts_df['title'].fillna('')
        posts_df['text'] = posts_df['text'].fillna('')
        posts_df['content'] = posts_df['title'] + " " + posts_df['text']

        posts_df = posts_df[posts_df['content'].str.len() > 5] # remove short posts
        if posts_df.empty:
            return 0.0

        def sentiment_row(row):
            title_score = self.sia.polarity_scores(row['title'])['compound']
            text_score = self.sia.polarity_scores(row['text'])['compound']
            return (0.7 * title_score) + (0.3 * text_score)

        posts_df['sentiment'] = posts_df.apply(sentiment_row, axis=1)
        posts_df['weight'] = posts_df['score'] + 1 # avoid zero weight

        weighted_sum = (posts_df['sentiment'] * posts_df['weight']).sum()
        total_weight = posts_df['weight'].sum()
        trend = (weighted_sum / total_weight) if total_weight != 0 else 0.0 

        self.last_df = posts_df
        return trend

    # ---- Confidence Score ----
    def confidence_score(self) -> float:

        posts_df = self.last_df
        if posts_df is None or posts_df.empty or 'sentiment' not in posts_df:
            return 0.0

        n = len(posts_df)

        # volume confidence
        volume_score = min(1.0, np.log10(n + 1) / 2.3)

        # agreement confidence (variance)
        variance = posts_df['sentiment'].var()
        agreement_score = 1 / (1 + variance * 5)

        # vote confidence
        avg_upvotes = posts_df['score'].mean()
        vote_score = min(1.0, np.log10(avg_upvotes + 1) / 2)

        # strength confidence
        avg_sentiment = abs(posts_df['sentiment'].mean())
        strength_score = min(1.0, avg_sentiment * 1.5)

        confidence = (
            0.35 * volume_score +
            0.30 * agreement_score +
            0.20 * vote_score +
            0.15 * strength_score
        )

        return float(round(confidence, 3))

# --- Main API ---
def get_stock_sentiment(stock_symbol: str):
    """
    Returns:
    {
        "sentiment": -100..100,
        "confidence": 0.0..1.0
    }
    """

    try:
        stock_symbol = stock_symbol.upper().strip()

        info = StockInfo()
        if not info.symbol_exists(stock_symbol):
            raise RuntimeError(f"Stock symbol '{stock_symbol}' wasn't found.")

        reddit_data = RedditPostData() #DataFetcher
        posts_df = reddit_data.data_to_DF(stock_symbol)

        analyzer = SentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)
        confidence = analyzer.confidence_score()

        result = {
            "sentiment": round(sentiment * 100),
            "confidence": confidence
        }

        print(f"SUCCEED {stock_symbol} → {result}")
        return result

    except Exception as e:
        print(f"[ERROR] {e}")
        return {"error": str(e)}
