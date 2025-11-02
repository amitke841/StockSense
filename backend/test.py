from stockSentiment import get_stock_sentiment
from stockData import get_stock_data
import sys
from colorama import Fore, Back, Style, init

init(autoreset=True)

if len(sys.argv) > 1:
    stock = sys.argv[1]
else:
    print("No variable provided")
    exit(1)

sentiment = (get_stock_sentiment(stock))

if sentiment == 999:
    print(Fore.MAGENTA + "A")
elif sentiment > 0: 
    print(Fore.GREEN + f"Sentiment for {stock} is positive with a score of {sentiment}")
elif sentiment < 0:
    print(Fore.RED + f"Sentiment for {stock} is negative with a score of {sentiment}")
else:
    print(Fore.YELLOW + f"Sentiment for {stock} is neutral. (0)")
    
print(get_stock_data(stock))