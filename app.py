import os
import cv2
import numpy as np
from flask import Flask, request, render_template
from tensorflow.keras.models import load_model

app = Flask(__name__)

model = load_model('model/deepfake_detector.h5')

def predict_image(image_path):
    image = cv2.imread(image_path)
    image_resized = cv2.resize(image, (128, 128))
    image_scaled = image_resized.astype('float32') / 255.0
    image_reshaped = np.reshape(image_scaled, [1, 128, 128, 3])
    prediction = model.predict(image_reshaped)
    return "Real" if prediction[0][0] < 0.5 else "Fake"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
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

if __name__ == '__main__':
    app.run(port=5000, use_reloader=False)
