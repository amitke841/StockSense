from flask import Flask, render_template, request, jsonify
from algoForFlask import get_stock_sentiment

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("inde.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    stock_symbol = request.form.get("stock_symbol", "")
    if not stock_symbol:
        return jsonify({"error": "No stock symbol provided."})
    
    sentiment = get_stock_sentiment(stock_symbol)
    return jsonify({
        "stock_symbol": stock_symbol.upper(),
        "sentiment": sentiment
    })

if __name__ == "__main__":
    app.run(debug=True)