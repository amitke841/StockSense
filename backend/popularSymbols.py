from dbConnection import get_db_connection
from stockSentiment import get_stock_sentiment
from stockData import get_stock_data
import json

popular_symbols = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD"]

def update_sentiments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        for symbol in popular_symbols:
            sent = get_stock_sentiment(symbol)['sentiment']
            price = get_stock_data(symbol)['currentPrice']
            sql = "UPDATE Daily_Sen SET sentiment = %s, price = %s WHERE symbol = %s"
            cursor.execute(sql, (sent, price, symbol))
            print(f"Updated {symbol}")

        # Commit all updates
        conn.commit()

    except Exception as e:
        print("Error:", e)
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        
    def get_popular_stocks():
        import json

def get_popular_json(limit=8):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT symbol, name, sentiment, price
        FROM stocks
        ORDER BY recommendation_score DESC
        LIMIT %s
    """
    cursor.execute(query, (limit,))
    rows = cursor.fetchall()

    stocks_list = []
    for row in rows:
        stock = {
            "symbol": row["symbol"],
            "name": row["name"],
            "sentiment": int(row["sentiment"]),
            "current_price": float(row["price"]),
        }
        stocks_list.append(stock)

    return json.dumps(stocks_list, indent=2)
    
    
if (__name__ == "__main__"):
    update_sentiments()