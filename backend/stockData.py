import yfinance as yf

def get_stock_data(stock_symbol):
    try:
        tckr = yf.Ticker(stock_symbol)
        info = tckr.info

        # Verify that data is valid
        if not info or 'currentPrice' not in info:
            raise RuntimeError(f"Could not fetch data for symbol '{stock_symbol}'")

        def safe_get(key):
            """Return value if exists and not None, else '---'"""
            val = info.get(key, "---")
            return "---" if val is None else val

        stockData = {
            'currentPrice': safe_get('currentPrice'),
            'longName': safe_get('longName'),
            'sector': safe_get('sector'),

            'open': safe_get('open'),
            'lastClose': safe_get('previousClose'),
            'high': safe_get('dayHigh'),
            'low': safe_get('dayLow'),
            'dayRange': safe_get('regularMarketDayRange'),
            'volume': safe_get('volume'),
            'avgVolume': safe_get('averageVolume'),
            'bid': safe_get('bid'),
            'ask': safe_get('ask'),

            'marketCap': safe_get('marketCap'),
            'peRatio': safe_get('trailingPE'),
            'eps': safe_get('trailingEps'),
            'revenueGrowth': safe_get('revenueGrowth'),
            'profitMargin': safe_get('profitMargins'),
            'roe': safe_get('returnOnEquity'),
            'dte': safe_get('debtToEquity'),
            'beta': safe_get('beta'),

            'summary': safe_get('longBusinessSummary')
        }

        # Calculate change & change percentage safely
        price = info.get('currentPrice')
        prev_close = info.get('previousClose')
        if price is not None and prev_close:
            stockData['change'] = round(price - prev_close, 2)
            stockData['changePS'] = round(((price - prev_close) / prev_close) * 100, 2)
        else:
            stockData['change'] = '---'
            stockData['changePS'] = '---'

        return stockData

    except Exception as e:
        raise RuntimeError(f"Error fetching stock data for '{stock_symbol}': {e}")
