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
init_db()

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
init_user_db()

def init_vitals_db():
    conn = sqlite3.connect("vitals.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            image_name TEXT,
            heart_rate INTEGER,
            risk_level TEXT,
            confidence REAL,
            created_at TEXT
        )
    """)
    conn.commit()
    conn.close()
init_vitals_db()

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

# ===============================
# CONTACT
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

# ===============================
# REGISTER
# ===============================
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

# ===============================
# LOGIN
# ===============================
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

# ===============================
# PROFILE
# ===============================
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

# ===============================
# AI PREDICT
# ===============================
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

    # Resize heatmap to image size
        heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))

    # Normalize heatmap properly
    heatmap = np.maximum(heatmap, 0)
    heatmap /= (np.max(heatmap) + 1e-8)

    heatmap = np.uint8(255 * heatmap)

    # Convert heatmap to color
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_TURBO)

    # IMPORTANT: Convert heatmap to RGB
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    # Overlay on ORIGINAL RGB image
    overlayed_img = (0.6 * original_resized + 0.4 * heatmap_color).astype(np.uint8)

    # Convert to base64
    gradcam_pil = Image.fromarray(overlayed_img)
    buffer2 = BytesIO()
    gradcam_pil.save(buffer2, format="PNG")
    gradcam_base64 = base64.b64encode(buffer2.getvalue()).decode("utf-8")
    # ===============================
# CLINICAL DATA → RISK LEVEL
# ===============================
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

    # -------- 10 YEAR MESSAGE --------
    if risk_level == "Low":
        chd_message = "Low probability of developing heart disease in next 10 years"
    elif risk_level == "Medium":
        chd_message = "Moderate probability of developing heart disease in next 10 years"
    else:
        chd_message = "High probability of developing heart disease in next 10 years"
         # ===============================
    # CONFIDENCE & HEART RATE
    # ===============================

    # Confidence from DL model
    confidence = round(dl_prob * 100, 2)

    # Get heart rate from clinical data (if sent from frontend)
    heart_rate = clinical_data.get("heartRate")
    if heart_rate:
        heart_rate = int(heart_rate)
    else:
        heart_rate = None

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

# ===============================
# GET VITALS
# ===============================
@app.route("/api/vitals", methods=["GET"])
@jwt_required()
def get_vitals():

    user_id = get_jwt_identity()

    conn = sqlite3.connect("vitals.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT image_name, heart_rate, risk_level, confidence, created_at
        FROM vitals
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