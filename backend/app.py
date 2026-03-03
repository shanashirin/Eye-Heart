from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import bcrypt

# ===== AI IMPORTS =====
import cv2
import numpy as np
import pandas as pd
import joblib
from seaborn import heatmap
from tensorflow.keras.models import load_model
import tensorflow as tf
import base64
from io import BytesIO
from PIL import Image

# ===== JWT IMPORTS =====
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

# ===============================
# APP INITIALIZATION
# ===============================
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# ===============================
# JWT CONFIGURATION
# ===============================
app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

jwt = JWTManager(app)

# ===============================
# LOAD AI MODELS
# ===============================
dl_model = load_model("pretrained.keras")
for layer in dl_model.layers:
    try:
        print(layer.name, layer.output_shape)
    except:
        print(layer.name)

ml_model = joblib.load("xgboost_risk_model.pkl")
scaler = joblib.load("scaler.pkl")
feature_names = joblib.load("feature_names.pkl")

IMG_SIZE = 256
THRESHOLD = 0.5
LAST_CONV_LAYER = "convnext_tiny_stage_3_block_2_depthwise_conv"

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

def init_user_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password BLOB NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def init_vitals_db():
    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            image_name TEXT,
            original_image TEXT,
            gradcam_image TEXT,
            heart_rate INTEGER,
            disease_detected INTEGER,
            risk_level TEXT,
            risk_percent REAL,
            confidence REAL,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()
def init_cardiac_db():
    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cardiac_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            heart_disease TEXT,
            bp_history TEXT,
            diabetes TEXT,
            cholesterol TEXT,
            smoking TEXT,
            family_history TEXT,
            surgery TEXT,
            medications TEXT,
            allergies TEXT,
            notes TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()
def init_optical_scan_db():
    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS optical_scan_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            original_image TEXT,
            gradcam_image TEXT,
            disease_detected INTEGER,
            risk_level TEXT,
            risk_percent REAL,
            confidence REAL,
            heart_rate INTEGER,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()
init_user_db()
init_vitals_db()
init_cardiac_db()
init_optical_scan_db()

# ===============================
# IMAGE PREPROCESS
# ===============================
def preprocess_image(img):
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32)
    img = np.expand_dims(img, axis=0)
    return img

# ===============================
# GRAD-CAM
# ===============================
def generate_gradcam(model, img_array, last_conv_layer_name):

    grad_model = tf.keras.models.Model(
        inputs=model.input,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output
        ]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)

        if isinstance(predictions, list):
            predictions = predictions[0]

        pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)

    if grads is None:
        return None

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)

    heatmap = tf.maximum(heatmap, 0)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)

    return heatmap.numpy()

# ===============================
# ROUTES
# ===============================

@app.route("/")
def home():
    return jsonify({"message": "Eye2Heart Backend Running 🚀"})

# CONTACT
@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject", "Not Provided")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({"error": "Name, Email and Message are required"}), 400

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

    return jsonify({"success": True}), 200

@app.route("/api/messages", methods=["GET"])
def get_messages():
    conn = sqlite3.connect("contact_messages.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

# REGISTER
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (data["name"], data["email"], hashed_pw)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True}), 201
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 400

# LOGIN
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, password FROM users WHERE email=?", (data["email"],))
    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user[1]):
        token = create_access_token(identity=str(user[0]))
        return jsonify({"success": True, "token": token})

    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# PROFILE
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name, email FROM users WHERE id=?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"name": user[0], "email": user[1]})

# AI PREDICT
@app.route("/api/predict", methods=["POST"])
@jwt_required()
def predict():

    user_id = get_jwt_identity()

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    filename = file.filename

    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    original_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    original_pil = Image.fromarray(original_resized)
    buffer = BytesIO()
    original_pil.save(buffer, format="PNG")
    original_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    x = preprocess_image(img)
    dl_prob = float(dl_model.predict(x, verbose=0)[0][0])
    disease_detected = dl_prob >= THRESHOLD
    heatmap = generate_gradcam(dl_model, x, LAST_CONV_LAYER)

    gradcam_base64 = None

    if heatmap is not None:
        heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
        heatmap = np.maximum(heatmap, 0)
        heatmap /= (np.max(heatmap) + 1e-8)
        heatmap = np.uint8(255 * heatmap)

        heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_TURBO)
        heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
        overlayed_img = (0.6 * original_resized + 0.4 * heatmap_color).astype(np.uint8)

        gradcam_pil = Image.fromarray(overlayed_img)
        buffer2 = BytesIO()
        gradcam_pil.save(buffer2, format="PNG")
        gradcam_base64 = base64.b64encode(buffer2.getvalue()).decode("utf-8")

    clinical_data = request.form.to_dict()

    input_data = []
    for feature in feature_names:
        input_data.append(float(clinical_data.get(feature, 0)))

    input_df = pd.DataFrame([input_data], columns=feature_names)
    scaled_input = scaler.transform(input_df)
    probs = ml_model.predict_proba(scaled_input)[0]

    p_low, p_medium, p_high = probs.tolist()
    ml_class = int(np.argmax(probs))

    if ml_class == 0:
        risk_level = "Low"
    elif ml_class == 1:
        risk_level = "Medium"
    else:
        risk_level = "High"

    risk_percent = ((p_low * 0.2) +
                    (p_medium * 0.6) +
                    (p_high * 1.0)) * 100

    if risk_level == "Low":
        chd_message = "Low probability of developing heart disease in next 10 years"
    elif risk_level == "Medium":
        chd_message = "Moderate probability of developing heart disease in next 10 years"
    else:
        chd_message = "High probability of developing heart disease in next 10 years"

    confidence = round(dl_prob * 100, 2)

    heart_rate = clinical_data.get("heartRate")
    if heart_rate:
        heart_rate = int(heart_rate)
    else:
        heart_rate = None

    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO vitals (
        user_id,
        image_name,
        original_image,
        gradcam_image,
        heart_rate,
        disease_detected,
        risk_level,
        risk_percent,
        confidence,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        filename,
        original_base64,
        gradcam_base64,
        heart_rate,
        int(disease_detected),
        risk_level,
        round(risk_percent, 2),
        confidence,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "disease_detected": disease_detected,
        "dl_probability": dl_prob,
        "risk_level": risk_level,
        "risk_percent": round(risk_percent, 2),
        "ten_year_chd_prediction": chd_message,
        "confidence": confidence,
        "heart_rate": heart_rate,
        "gradcam_image": gradcam_base64,
        "original_image": original_base64,
        "probabilities": {
            "low": float(p_low),
            "medium": float(p_medium),
            "high": float(p_high)
        },
        "gradcam_legend": {
            "blue": "Low importance (model paying little attention)",
            "green": "Medium importance (moderate attention)",
            "red": "High importance (strong model focus area)"
        }
    })

# GET VITALS
@app.route("/api/vitals", methods=["GET"])
@jwt_required()
def get_vitals():

    user_id = get_jwt_identity()

    conn = sqlite3.connect("vitals.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            image_name,
            original_image,
            gradcam_image,
            heart_rate,
            disease_detected,
            risk_level,
            risk_percent,
            confidence,
            created_at
        FROM vitals
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])
# ===============================
# DASHBOARD SUMMARY
# ===============================
@app.route("/api/dashboard-summary", methods=["GET"])
@jwt_required()
def dashboard_summary():

    user_id = get_jwt_identity()

    conn = sqlite3.connect("vitals.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Total scans
    cursor.execute("SELECT COUNT(*) as total FROM vitals WHERE user_id=?", (user_id,))
    total_scans = cursor.fetchone()["total"]

    # High risk count
    cursor.execute("SELECT COUNT(*) as high FROM vitals WHERE user_id=? AND risk_level='High'", (user_id,))
    high_risk = cursor.fetchone()["high"]

    # Latest record
    cursor.execute("""
        SELECT risk_level, risk_percent, confidence, created_at
        FROM vitals
        WHERE user_id=?
        ORDER BY id DESC
        LIMIT 1
    """, (user_id,))
    latest = cursor.fetchone()

    conn.close()

    return jsonify({
        "total_scans": total_scans,
        "high_risk_cases": high_risk,
        "latest_record": dict(latest) if latest else None
    })
# ===============================
# SAVE CARDIAC HISTORY
# ===============================
@app.route("/api/save-cardiac", methods=["POST"])
@jwt_required()
def save_cardiac():

    user_id = get_jwt_identity()
    data = request.get_json()

    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO cardiac_history (
            user_id,
            heart_disease,
            bp_history,
            diabetes,
            cholesterol,
            smoking,
            family_history,
            surgery,
            medications,
            allergies,
            notes,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        data.get("heart_disease"),
        data.get("bp_history"),
        data.get("diabetes"),
        data.get("cholesterol"),
        data.get("smoking"),
        data.get("family_history"),
        data.get("surgery"),
        data.get("medications"),
        data.get("allergies"),
        data.get("notes"),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Cardiac history saved successfully"})
# ===============================
# GET CARDIAC HISTORY
# ===============================
@app.route("/api/get-cardiac", methods=["GET"])
@jwt_required()
def get_cardiac():

    user_id = get_jwt_identity()

    conn = sqlite3.connect("vitals.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM cardiac_history
        WHERE user_id=?
        ORDER BY id DESC
        LIMIT 1
    """, (user_id,))

    record = cursor.fetchone()
    conn.close()

    return jsonify(dict(record) if record else {})
# ===============================
# SAVE OPTICAL SCAN LOG
# ===============================
@app.route("/api/optical-scan-log", methods=["POST"])
@jwt_required()
def save_optical_scan():

    user_id = get_jwt_identity()
    data = request.get_json()

    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO optical_scan_logs (
        user_id,
        original_image,
        gradcam_image,
        disease_detected,
        risk_level,
        risk_percent,
        confidence,
        heart_rate,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    user_id,
    data.get("original_image"),
    data.get("gradcam_image"),
    int(data.get("disease_detected", 0)),
    data.get("risk_level"),
    float(data.get("risk_percent", 0)),
    float(data.get("confidence", 0)),
    data.get("heart_rate"),
    datetime.now().strftime("%Y-%m-%d %H:%M:%S")
))

    conn.commit()
    conn.close()

    return jsonify({"message": "Scan saved successfully"})
# ===============================
# GET OPTICAL SCAN HISTORY
# ===============================
@app.route("/api/optical-scan-history", methods=["GET"])
@jwt_required()
def get_optical_scan_history():

    user_id = get_jwt_identity()

    conn = sqlite3.connect("vitals.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            original_image,
            gradcam_image,
            disease_detected,
            risk_level,
            risk_percent,
            confidence,
            heart_rate,
            created_at
        FROM optical_scan_logs
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,))

    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)