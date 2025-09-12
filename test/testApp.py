from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow frontend (React) to call this backend

@app.route("/uppercase", methods=["POST"])
def uppercase():
    data = request.get_json()
    user_input = data.get("text", "")
    return jsonify({"result": user_input.upper()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
