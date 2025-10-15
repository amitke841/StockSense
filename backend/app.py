from flask import Flask, request, jsonify
from flask_cors import CORS
from stockSentiment import get_stock_sentiment
import yfinance as yf

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
    tckr = yf.Ticker(stock_symbol)
    return jsonify(tckr.info) 

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)