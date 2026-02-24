import yfinance as yf

def get_market_status():
    symbols = {
        "S&P 500": "^GSPC",
        "Nasdaq": "^IXIC",
        "Dow": "^DJI",
        "VIX": "^VIX"
    }

    result = {
        "market_open": False,
        "indexes": {}
    }

    # Check market state using Nasdaq ticker as reference
    nasdaq_ticker = yf.Ticker(symbols["Nasdaq"])
    market_state = nasdaq_ticker.info.get("marketState", "CLOSED")
    result["market_open"] = market_state == "REGULAR"

    # Fetch info for each index
    for name, symbol in symbols.items():
        ticker = yf.Ticker(symbol)
        info = ticker.info

        price = info.get("regularMarketPrice", None)
        previous_close = info.get("previousClose", None)
        change = None
        if price is not None and previous_close is not None:
            change = price - previous_close

        result["indexes"][name] = {
            "symbol": symbol,
            "price": price,
            "change": change
        }

    return result