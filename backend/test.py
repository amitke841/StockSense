from stockSentiment import get_stock_sentiment
from stockData import get_stock_data
from predictStock import train_or_predict
import sys
from colorama import Fore, Back, Style, init

init(autoreset=True)

if len(sys.argv) > 1:
    stock = sys.argv[1]
else:
    print("No variable provided")
    exit(1)

sentiment = (get_stock_sentiment(stock))
prediction = (train_or_predict(stock))

print(Fore.GREEN + f"Sentiment for {stock} is with a score of {sentiment}, prediction for 1 day: {prediction}")    
print(get_stock_data(stock))