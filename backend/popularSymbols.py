from dbConnection import get_db_connection
from stockSentiment import get_stock_sentiment
from stockData import get_stock_data

popular_symbols = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD"]

def update_sentiments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        for symbol in popular_symbols:
            sent = get_stock_sentiment(symbol)
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
        
        
if (__name__ == "__main__"):
    update_sentiments()