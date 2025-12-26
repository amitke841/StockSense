from datetime import datetime, timedelta
import yfinance as yf
from predictStock import train_or_predict

def get_graph_data(ticker: str) -> dict:
    today = datetime.utcnow().date()
    today_str = today.isoformat()

    stock = yf.Ticker(ticker)

    # We need enough history to cover the range
    hist = stock.history(period="15d", interval="1d")

    result = {}

    # Convert historical data to date -> close
    hist_map = {
        d.date(): round(float(row["Close"]), 2)
        for d, row in hist.iterrows()
    }

    # Build exactly 8 calendar days back (including today)
    start_date = today - timedelta(days=8)
    current_date = start_date

    while current_date <= today:
        result[current_date.isoformat()] = hist_map.get(current_date)
        current_date += timedelta(days=1)

    # Get current price (overwrite today's value)
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
    result[tomorrow.isoformat()] = round(prediction, 2)

    return result
