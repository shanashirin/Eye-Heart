from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ===============================
# DATABASE INITIALIZATION
# ===============================
def init_db():
    conn = sqlite3.connect("contact_messages.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

init_db()

# ===============================
# EXISTING ROUTES
# ===============================

@app.route("/")
def home():
    return jsonify({"message": "Eye2Heart Backend Running 🚀"})

@app.route("/analyze")
def analyze():
    return jsonify({"prediction": "Low Risk", "confidence": "92%"})

# ===============================
# NEW CONTACT ROUTE
# ===============================

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject", "Not Provided")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "Name, Email and Message are required"}), 400

    try:
        conn = sqlite3.connect("contact_messages.db")
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO messages (name, email, subject, message, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            name,
            email,
            subject,
            message,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Message stored successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/messages", methods=["GET"])
def get_messages():
    conn = sqlite3.connect("contact_messages.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM messages")
    rows = cursor.fetchall()

    conn.close()

    return jsonify(rows)


# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)