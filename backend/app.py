from flask import Flask, request, jsonify
from flask_cors import CORS
from stockSentiment import get_stock_sentiment
from stockData import get_stock_data
from predictStock import train_or_predict

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
    if (sentiment > -100 and sentiment <100):
        return jsonify({
            "stock_symbol": stock_symbol,
            "sentiment": sentiment
        })
    else: return jsonify({"error": sentiment})
    
@app.route("/getstockdata", methods=["POST"])
def getStockData():
    stock_symbol = request.form.get("stock_symbol", "")
    if not stock_symbol:
        return jsonify({"error": "No stock symbol provided."})
    data = get_stock_data(stock_symbol)
    return jsonify(data) 

@app.route("/predict", methods=["POST"])
def predict():
    symbol = request.form.get("stock_symbol", "")

    if not symbol:
        return jsonify({"error": "symbol is required"}), 400

    try:
        result = train_or_predict(symbol.upper())
        return jsonify({
            "symbol": symbol.upper(),
            "prediction": result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)