from flask import Flask, request, jsonify
from flask_cors import CORS
from stockSentiment import get_stock_sentiment
from stockData import get_stock_data

app = Flask(__name__)
CORS(app)

@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok"})

@app.route("/getstocksentiment", methods=["POST"])
def get_sentiment():
    stock = request.args.get('symbol')
    if not stock:
        return jsonify(success=False, error="Missing stock symbol"), 400

    try:
        sentiment = get_stock_sentiment(stock)

        # Check if numeric result is NaN → means error occurred internally
        if sentiment != sentiment:  # NaN check
            raise RuntimeError("Internal error while processing sentiment")

        return jsonify({"success":True, "score":stock, "sentiment":sentiment}), 200

    except RuntimeError as e:
        return jsonify(success=False, error=str(e)), 500
    except Exception as e:
        print(f"[Unexpected Error] {e}")  # Log exact error
        return jsonify(success=False, error=f"Unexpected error: {str(e)}"), 500
    
@app.route("/getstockdata", methods=["POST"])
def getStockData():
    stock_symbol = request.form.get("stock_symbol", "")
    if not stock_symbol:
        return jsonify({"error": "No stock symbol provided."})
    try:
        data = get_stock_data(stock_symbol)
        return jsonify(data)
    except Exception as e:
        print(f"[Error in getStockData] {e}")  # Log exact error
        return jsonify({"error": "Failed to fetch stock data."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)