from pydoc import text
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os
import praw
import pandas as pd
import numpy as np
from colorama import Fore, Back, Style, init
import yfinance as yf

init(autoreset=True)
load_dotenv()
required_vars = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT']
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print(f"Missing environment variables: {', '.join(missing_vars)}")
    print("Please update your .env file with the missing values.")
    exit(2)

nltk.download('vader_lexicon')

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

    def get_posts(self, stock_symbol):
        posts = []
        try:
            submissions = self.reddit.subreddit("stocks+investing+wallstreetbets").search(
                f"{stock_symbol} stock", limit=100, sort="top", time_filter="week"
            )
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
            'rekt': -3.5,
            'bullish': 3.0,
            'bearish': -3.0,
            'downgrade': -2.0,
            'upgrade': 2.0,
            'pump': 2.0,
            'dump': -3.0
        })

    def analyze_sentiment(self, text):
        return self.sia.polarity_scores(text)['compound']

    def predict_trend(self, posts_df):
        # Safety: check if DataFrame has required columns
        if posts_df.empty or 'title' not in posts_df or 'text' not in posts_df:
            return 0

        # Merge title + body
        posts_df['title'] = posts_df['title'].fillna('')
        posts_df['text'] = posts_df['text'].fillna('')
        posts_df['content'] = posts_df['title'] + " " + posts_df['text']

        # Filter out very short posts
        posts_df = posts_df[posts_df['content'].str.len() > 5]
        if posts_df.empty:
            return 0

        # Compute weighted sentiment
        def sentiment_row(row):
            title_score = self.sia.polarity_scores(row['title'])['compound']
            text_score = self.sia.polarity_scores(row['text'])['compound']
            return (0.7 * title_score) + (0.3 * text_score)

        posts_df['sentiment'] = posts_df.apply(sentiment_row, axis=1)
        posts_df['weight'] = posts_df['score'] + 1  # add 1 to avoid zero division
        weighted_sum = (posts_df['sentiment'] * posts_df['weight']).sum()
        total_weight = posts_df['weight'].sum()

        avg_sentiment = weighted_sum / total_weight if total_weight != 0 else 0
        return avg_sentiment

def stock_exists(symbol: str):
    """Check if stock symbol exists using yfinance."""
    ticker = yf.Ticker(symbol)
    info = ticker.info
    return 'regularMarketPrice' in info

def main():
    try:
        stock_symbol = input("Enter the stock symbol: ").upper()

        if not stock_exists(stock_symbol):
            print(Fore.YELLOW + f"Stock symbol {stock_symbol} does not exist.")
            return

        reddit_data = redditPostData()
        posts_df = reddit_data.get_posts(stock_symbol)
        if posts_df.empty:
            print("DataFrame is empty")
            return
        analyzer = sentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)
        sentiment = round(sentiment * 100)

        if sentiment > 0:
            print(Fore.GREEN + f"Sentiment for {stock_symbol} is positive with a score of {sentiment}")
        elif sentiment < 0:
            print(Fore.RED + f"Sentiment for {stock_symbol} is negative with a score of {sentiment}")
        else:
            print(Fore.YELLOW + f"Sentiment for {stock_symbol} is neutral. (0)")

    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    main()
