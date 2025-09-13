import yfinance as yf

apple = yf.Ticker("aapl")

# print(apple.info.get('currentPrice'))
print(apple.history_metadata)