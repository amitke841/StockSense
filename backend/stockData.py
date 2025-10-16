import yfinance as yf

def get_stock_data(stock_symbol): 
    
    tckr = yf.Ticker(stock_symbol)
    stockData = {}
    
    stockData['currentPrice'] = tckr.info['currentPrice']
    stockData['longName'] = tckr.info['longName']
    stockData['sector'] = tckr.info['sector'] #
    
    stockData['open'] = tckr.info['open']
    stockData['lastClose'] = tckr.info['previousClose']
    stockData['high'] = tckr.info['dayHigh']
    stockData['low'] = tckr.info['dayLow']
    stockData['dayRange'] = tckr.info['regularMarketDayRange']
    stockData['volume'] = tckr.info['volume']
    stockData['avgVolume'] = tckr.info['averageVolume'] #
    stockData['bid'] = tckr.info['bid']
    stockData['ask'] = tckr.info['ask']
    
    stockData['marketCap'] = tckr.info['marketCap']
    stockData['peRatio'] = tckr.info['trailingPE']
    stockData['eps'] = tckr.info['trailingEps']
    stockData['revenueGrowth'] = tckr.info['revenueGrowth']
    stockData['profitMargin'] = tckr.info['profitMargins']
    stockData['roe'] = tckr.info['returnOnEquity']
    stockData['dte'] = tckr.info['debtToEquity']
    stockData['beta'] = tckr.info['beta']
    
    stockData['change'] = tckr.info['currentPrice'] - tckr.info['previousClose'] #
    stockData['changePS'] = (stockData['change']/tckr.info['previousClose'])*100 #
    stockData['summary'] = tckr.info['longBusinessSummary'] #
    
    return stockData
