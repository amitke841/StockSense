from datetime import datetime, timedelta
import yfinance as yf
from predictStock import train_or_predict


def get_graph_data(ticker: str) -> dict:
    today = datetime.utcnow().date()
    today_str = today.isoformat()

    stock = yf.Ticker(ticker)

    # Pull extra history to handle weekends/holidays
    hist = stock.history(period="30d", interval="1d")

    # Convert historical data to date -> close
    hist_map = {
        d.date(): round(float(row["Close"]), 2)
        for d, row in hist.iterrows()
        if row["Close"] is not None
    }

    if not hist_map:
        raise ValueError("No historical data available")

    # Walk backwards day-by-day until we collect 8 valid trading days
    valid_days = 0
    cursor = today

    while valid_days < 6:
        if cursor in hist_map:
            valid_days += 1
        cursor -= timedelta(days=1)

    # cursor is now one day BEFORE the start
    start_date = cursor + timedelta(days=1)

    result = {}

    # Fill ALL calendar days between start_date and today
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
