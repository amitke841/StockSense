from stockSentiment import get_stock_sentiment
import sys
from colorama import Fore, Back, Style, init

init(autoreset=True)

if len(sys.argv) > 1:
    stock = sys.argv[1]
else:
    print("No variable provided")
    exit(1)

sentiment = (get_stock_sentiment(stock))

if sentiment > 0:
    print(Fore.GREEN + f"Sentiment for {stock} is positive with a score of {sentiment}")
elif sentiment < 0:
    print(Fore.RED + f"Sentiment for {stock} is negative with a score of {sentiment}")
else:
    print(Fore.YELLOW + f"Sentiment for {stock} is neutral. (0)")