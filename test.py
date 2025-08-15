import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
import os
import praw
import pandas as pd
import numpy as np

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

    # def which_site(self, stock_symbol):
        # only reddit for now

    def analyze_sentiment(self, text):
        return self.sia.polarity_scores(text)['compound']
    
    def predict_trend(self, posts_df):
        posts_df['sentiment'] = posts_df['title'].apply(self.analyze_sentiment) + posts_df['text'].apply(self.analyze_sentiment)
        avg_sentiment = posts_df['sentiment'].mean()
        return avg_sentiment
    
    
def main():
    try:
        stock_symbol = input("Enter the stock symbol: ").upper()
        reddit_data = redditPostData()
        posts_df = reddit_data.get_posts(stock_symbol)

        analyzer = sentimentAnalysis()
        sentiment = analyzer.predict_trend(posts_df)
        print(sentiment*100)

    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    main()
