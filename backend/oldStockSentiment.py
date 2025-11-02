from pydoc import text
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os
import praw
import yfinance as yf
import pandas as pd
import numpy as np
from yfinance import shared
import itertools
        
load_dotenv()
required_vars = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT']
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print(f"Missing environment variables: {', '.join(missing_vars)}")
    raise RuntimeError(".env file is not configured properly")

nltk.download('vader_lexicon', quiet= True)

class stockInfo:
    def __init__(self):
        pass

    def symbol_exists(self, symbol):
        try:
            ticker = yf.Ticker(symbol)
            price = ticker.info.get("currentPrice")
            return price is not None
        except Exception:
            raise RuntimeError("Stock Symbol wasn't found.")

class postData:
    def __init__(self):
        pass

    def get_posts(self):
        raise NotImplementedError("Subclasses must implement get_posts")

class redditPostData(postData):
    def __init__(self):
        super().__init__()
        self.reddit = praw.Reddit(
            client_id=os.getenv('REDDIT_CLIENT_ID'),
            client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
            user_agent=os.getenv('REDDIT_USER_AGENT')
        )

    def get_submissions(self, stock, time_period):
        print("Starting Post Extract...")
        print(f"Trying tp extract Reddit posts for {stock} last {time_period}")
        listing = self.reddit.subreddit("stocks+investing+wallstreetbets").search(
                f"{stock} stock", limit=100, sort="hot", time_filter=time_period)
        # try to extract the first element in the listing
        _exhausted = object()  # Unique sentinel
        first_item = next(listing, _exhausted)
        if first_item is _exhausted:
            return None
        else:
            return itertools.chain([first_item], listing)
            
        
    def get_posts(self, stock_symbol):
        posts = []
        submissions = None
        try:
            submissions = self.get_submissions(stock_symbol, "day")
            if submissions is None:
                submissions = self.get_submissions(stock_symbol,"week")
                if submissions is None:
                    submissions = self.get_submissions(stock_symbol,"month")
                    if submissions is None:
                        submissions = self.get_submissions(stock_symbol,"year")
                        if submissions is None:
                            raise RuntimeError("No Reddit posts from the last year were found for {stock_symbol}.")
                            return pd.DataFrame()

            for post in submissions:
                try:
                    posts.append({
                        "title": getattr(post, "title", "") or "",
                        "text": getattr(post, "selftext", "") or "",
                        "score": getattr(post, "score", 0) or 0,
                        "created_utc": getattr(post, "created_utc", None)
                    })
                except Exception as inner_e:
                    print(f"Skipping a post due to error: {inner_e}")
                    continue
        except Exception as outer_e:
            print(f"Reddit fetch failed: {outer_e}")
            return pd.DataFrame()

        return pd.DataFrame(posts)

class sentimentAnalysis:
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.sia.lexicon.update({
            'bagholder': -3.0,
            'scam': -4.0,
            'overvalued': -2.5,
            'undervalued': 2.5,
            'moon': 3.0,
            'rekt': -3.5
        }) 

    # def which_site(self, stock_symbol):
        # only reddit for now

    def analyze_sentiment(self, text):
        return self.sia.polarity_scores(text)['compound']
    
    def predict_trend(self, posts_df):
        if posts_df.empty or 'title' not in posts_df or 'text' not in posts_df:
            return 0


    # Combine title + text into one content field
        posts_df['title'] = posts_df['title'].fillna('')
        posts_df['text'] = posts_df['text'].fillna('')
        posts_df['content'] = posts_df['title'] + " " + posts_df['text']

    # Filter out very short / low-content posts
        posts_df = posts_df[posts_df['content'].str.len() > 5]
        if posts_df.empty:
            return 0  # no useful posts -> neutral

    # Compute sentiment with weighted title/text
        def sentiment_row(row):
            title_score = self.sia.polarity_scores(row['title'])['compound']
            text_score = self.sia.polarity_scores(row['text'])['compound']
            return (0.7 * title_score) + (0.3 * text_score)

        posts_df['sentiment'] = posts_df.apply(sentiment_row, axis=1)

    # Weight by Reddit score (upvotes)
        posts_df['weight'] = posts_df['score'] + 1  # avoid zero division
        weighted_sum = (posts_df['sentiment'] * posts_df['weight']).sum()
        total_weight = posts_df['weight'].sum()

        avg_sentiment = weighted_sum / total_weight if total_weight != 0 else 0
        return avg_sentiment

    
def get_stock_sentiment(stock_symbol: str):
    try:
        stock_symbol = stock_symbol.upper().strip()
        info = stockInfo()
        if not info.symbol_exists(stock_symbol):
            raise RuntimeError("Stock Symbol wasn't found.")
            exit(2)
        reddit_data = redditPostData()
        posts_df = reddit_data.get_posts(stock_symbol)
        analyzer = sentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)
        sentiment = round(sentiment * 100)
        return sentiment

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return "ERORR"
