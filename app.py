import os
import cv2
import numpy as np
import pyotp
from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model

app = Flask(__name__)

# 🔐 SHARED SECRET — MUST MATCH THE ONE IN React Dashboard.jsx
SHARED_SECRET = os.environ.get("VERIFYAI_TOTP_SECRET")
if not SHARED_SECRET:
    raise RuntimeError("VERIFYAI_TOTP_SECRET environment variable is required")

# Load deepfake model
model = load_model('model/deepfake_detector.h5')

def predict_image(image_path):
    image = cv2.imread(image_path)
    image_resized = cv2.resize(image, (128, 128))
    image_scaled = image_resized.astype('float32') / 255.0
    image_reshaped = np.reshape(image_scaled, [1, 128, 128, 3])
    prediction = model.predict(image_reshaped)
    return "Real" if prediction[0][0] < 0.5 else "Fake"


# ------------------------------------------------------------
# ✅ 1. HOME ROUTE
# ------------------------------------------------------------
@app.route('/')
def index():
    return render_template('index.html')


# ------------------------------------------------------------
# ✅ 2. VERIFY PIN API (React sends PIN here)
# ------------------------------------------------------------
@app.route('/verify-pin', methods=['POST'])
def verify_pin():
    try:
        data = request.json
        pin = data.get("pin")

        if not pin:
            return jsonify({"success": False, "message": "PIN missing"}), 400

        totp = pyotp.TOTP(SHARED_SECRET, digits=6, interval=30)

        if totp.verify(pin, valid_window=1):
            return jsonify({"success": True, "message": "PIN verified successfully"})

        return jsonify({"success": False, "message": "Invalid or expired PIN"}), 400

    except Exception as e:
        return jsonify({"success": False, "message": "Server error", "error": str(e)}), 500


# ------------------------------------------------------------
# ✅ 3. IMAGE UPLOAD + DEEPFAKE CHECK
# ------------------------------------------------------------
@app.route('/upload', methods=['POST'])
def upload_image():
    # Check if PIN was sent
    pin = request.form.get("pin")
    if not pin:
        return "PIN missing", 400

    # Verify PIN before allowing upload
    totp = pyotp.TOTP(SHARED_SECRET, digits=6, interval=30)
    if not totp.verify(pin, valid_window=1):
        return "Invalid PIN — Upload blocked", 403

    # Normal upload flow
    if 'file' not in request.files:
        return "No file part"
    file = request.files['file']
    if file.filename == '':
        return "No selected file"

    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    filepath = os.path.join('uploads', file.filename)
    file.save(filepath)

    result = predict_image(filepath)

    return render_template('index.html', result=result)


# ------------------------------------------------------------
# Run server
# ------------------------------------------------------------
if __name__ == '__main__':
    app.run(port=5000, use_reloader=False)
