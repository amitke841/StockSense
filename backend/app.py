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
def getStockSentiment():
    stock_symbol = request.form.get("stock_symbol", "")
    if not stock_symbol:
        return jsonify({"error": "No stock symbol provided."})
    
    sentiment = get_stock_sentiment(stock_symbol)
    return jsonify({
        "stock_symbol": stock_symbol,
        "sentiment": sentiment
    })
    
@app.route("/getstockdata")
def getStockData():
    stock_symbol = request.form.get("stock_symbol", "")
    if not stock_symbol:
        return jsonify({"error": "No stock symbol provided."})
    data = get_stock_data(stock_symbol)
    return jsonify(data) 


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)