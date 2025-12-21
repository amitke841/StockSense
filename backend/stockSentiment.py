import os
import nltk
import praw
import yfinance as yf
import pandas as pd
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import itertools

# --- Load environment variables ---
load_dotenv()
required_vars = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT']
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing environment variables: {', '.join(missing_vars)}")

# --- NLTK setup ---
nltk.download('vader_lexicon', quiet=True)

# --- StockInfo Superclass? ---
class stockInfo:
    def symbol_exists(self, symbol):
        """
        Returns True if ticker exposes a price, otherwise raises RuntimeError.
        """
        try:
            ticker = yf.Ticker(symbol)
            price = ticker.info.get("currentPrice")
            return price is not None
        except Exception as e:
            # unify to RuntimeError
            raise RuntimeError(f"Stock symbol '{symbol}' lookup failed: {e}") from e

# --- Get Data from Reddit ---
class redditPostData:
    def __init__(self):
        try:
            self.reddit = praw.Reddit(
                client_id=os.getenv('REDDIT_CLIENT_ID'),
                client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
                user_agent=os.getenv('REDDIT_USER_AGENT')
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Reddit client: {e}") from e

    def get_submissions(self, stock: str, time_period: str):
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

    def get_posts(self, stock_symbol: str) -> pd.DataFrame:
        posts = []
        print("Starting to extract posts...")
        # try time windows in descending freshness
        for period in ["day", "week", "month", "year"]:
            print(f"extracting posts for: {period}")
            submissions = self.get_submissions(stock_symbol, period)
            if submissions:
                break
            else:
                print("Resuming search with larger period...")
        else:
            # no submissions found in any window -> raise runtime error
            raise RuntimeError(f"No Reddit posts found for '{stock_symbol}' in the past year.")

        for post in submissions:
            try:
                posts.append({
                    "title": getattr(post, "title", "") or "",
                    "text": getattr(post, "selftext", "") or "",
                    "score": getattr(post, "score", 0) or 0,
                    "created_utc": getattr(post, "created_utc", None)
                })
            except Exception as inner_e:
                # skip malformed post but continue processing others
                print(f"Skipping a post due to inner error: {inner_e}")
                continue

        return pd.DataFrame(posts)

# --- DataFrame Analysis ---
class sentimentAnalysis:
    def __init__(self):
        try:
            self.sia = SentimentIntensityAnalyzer()
        except Exception as e:
            raise RuntimeError(f"Failed to initialize SentimentIntensityAnalyzer: {e}") from e

        # extend lexicon
        self.sia.lexicon.update({
            'bagholder': -3.0,
            'scam': -4.0,
            'overvalued': -2.5,
            'undervalued': 2.5,
            'moon': 3.0,
            'rekt': -3.5
        })

    def predict_trend(self, posts_df):
        # return a float between -1 and 1 (or 0 if no useful posts)
        if posts_df is None or posts_df.empty:
            return 0.0

        posts_df['title'] = posts_df['title'].fillna('')
        posts_df['text'] = posts_df['text'].fillna('')
        posts_df['content'] = posts_df['title'] + " " + posts_df['text']

        posts_df = posts_df[posts_df['content'].str.len() > 5]
        if posts_df.empty:
            return 0.0

        # Weighted Score
        def sentiment_row(row):
            title_score = self.sia.polarity_scores(row['title'])['compound']
            text_score = self.sia.polarity_scores(row['text'])['compound']
            return (0.7 * title_score) + (0.3 * text_score)

        posts_df['sentiment'] = posts_df.apply(sentiment_row, axis=1)
        posts_df['weight'] = posts_df['score'] + 1  # avoid zero weight

        weighted_sum = (posts_df['sentiment'] * posts_df['weight']).sum()
        total_weight = posts_df['weight'].sum()
        return (weighted_sum / total_weight) if total_weight != 0 else 0.0

# --- Main method ---
def get_stock_sentiment(stock_symbol: str) -> float:
    """
    Returns integer sentiment in range -100..100 on success.
    On error, returns float('nan') and prints a unified RuntimeError message.
    All underlying errors are raised as RuntimeError, but this function catches them
    and returns the numeric sentinel float('nan') so callers always receive a numeric result.
    """
    try:
        stock_symbol = stock_symbol.upper().strip()
        info = stockInfo()
        if not info.symbol_exists(stock_symbol):
            raise RuntimeError(f"Stock symbol '{stock_symbol}' wasn't found.")

        reddit_data = redditPostData()
        posts_df = reddit_data.get_posts(stock_symbol)

        analyzer = sentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)  # -1.0 .. 1.0
        print(f"SUCCEED. result for {stock_symbol} is {sentiment*100}")
        return round(sentiment * 100)  # integer in -100..100

    except Exception as e:
        print(f"[ERROR] {e}")
        return str(e)
