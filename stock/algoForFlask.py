from pydoc import text
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os
import praw
import pandas as pd
import numpy as np
from colorama import Fore, Back, Style, init

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
        for post in self.reddit.subreddit('stocks+investing+wallstreetbets').search(
            f'{stock_symbol} stock', limit=100, sort='new'
        ):
            posts.append({'title': post.title, 'text': post.selftext, 'score': post.score, 'created_utc': post.created_utc})
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
        # Most Reddit posts in finance subs have an empty body (selftext == "") and only a title.
        posts_df['content'] = posts_df['title'].fillna('') + " " + posts_df['text'].fillna('')
        posts_df['sentiment'] = posts_df['content'].apply(self.analyze_sentiment)
        avg_sentiment = posts_df['sentiment'].mean()
        return avg_sentiment
    
def get_stock_sentiment(stock_symbol: str):
    try:
        reddit_data = redditPostData()
        posts_df = reddit_data.get_posts(stock_symbol)

        analyzer = sentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)
        sentiment = round(sentiment * 100)
        return sentiment
        # if sentiment > 0:
        #     print(Fore.GREEN + f"Sentiment for {stock_symbol} is positive with a score of {sentiment}")
        # elif sentiment < 0:
        #     print(Fore.RED + f"Sentiment for {stock_symbol} is negative with a score of {sentiment}")
        # else:
        #     print(Fore.YELLOW + f"Sentiment for {stock_symbol} is neutral. (0)")

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return "ERORR"
