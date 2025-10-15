import yfinance as yf

def get_stock_data(stock_symbol): 
    
    tckr = yf.Ticker(stock_symbol)
    stockData = {}
    
    stockData['currentPrice'] = tckr.info['currentPrice']
    
    return stockData
