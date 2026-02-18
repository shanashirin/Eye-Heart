from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"message": "Eye2Heart Backend Running 🚀"})

@app.route("/analyze")
def analyze():
    return jsonify({"prediction": "Low Risk", "confidence": "92%"})

if __name__ == "__main__":
    app.run(debug=True)
