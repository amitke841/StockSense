from datetime import datetime, timedelta
import yfinance as yf
from predictStock import train_or_predict

def get_graph_data(ticker: str) -> dict:
    """
    Returns a dictionary in the API format:
    - past 6 calendar days (filled from history)
    - today (from ticker.info current price)
    - tomorrow (prediction)
    """
    today = datetime.utcnow().date()
    today_str = today.isoformat()

    stock = yf.Ticker(ticker)

    # Get historical closes (past days)
    hist = stock.history(period="10d", interval="1d")

    # Take last available trading days
    hist = hist.tail(6)

    result = {}

    for date, row in hist.iterrows():
        date_str = date.date().isoformat()
        result[date_str] = round(float(row["Close"]), 2)

    # Get current price from ticker.info
    info = stock.info
    current_price = (
        info.get("regularMarketPrice")
        or info.get("currentPrice")
        or info.get("previousClose")
    )

    if current_price is None:
        raise ValueError("Could not retrieve current price from ticker.info")

    result[today_str] = round(float(current_price), 2)

    # Predict tomorrow
    tomorrow = today + timedelta(days=1)
    prediction = train_or_predict(ticker)
    result[tomorrow.isoformat()] = prediction

    return result