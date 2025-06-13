# agri-diagnosis-app/ai-service/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS # To allow cross-origin requests from Node.js backend
import joblib # For loading the trained model and label encoder
import numpy as np # For numerical operations on prediction input
import json # For loading feature columns

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Load the trained ML Model and Preprocessing Artifacts ---
MODEL_PATH = 'model.pkl'
LABEL_ENCODER_PATH = 'label_encoder.pkl'
FEATURE_COLUMNS_PATH = 'feature_columns.json' # This file stores the ordered list of symptom column names

ml_model = None
label_encoder = None
feature_columns = []

try:
    ml_model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    with open(FEATURE_COLUMNS_PATH, 'r') as f:
        feature_columns = json.load(f)
    print(f"ML Model '{MODEL_PATH}', Label Encoder, and Feature Columns loaded successfully.")
    print(f"Expected Features (ordered list of symptom columns): {feature_columns}")
except Exception as e:
    print(f"Error loading ML model or preprocessing artifacts: {e}")
    print("Please ensure you have run 'python train_model.py' first to generate these files.")
    # If loading fails, set these to default empty/None to prevent further errors
    ml_model = None
    label_encoder = None
    feature_columns = []


# --- Function to preprocess symptoms for the ML model ---
def preprocess_symptoms_for_prediction(observed_symptom_ids, feature_columns):
    """
    Converts a list of observed symptom IDs into a binary feature vector
    that matches the order and count of feature_columns used during training.
    """
    if not feature_columns: # If model not loaded or no features defined
        print("Error: Feature columns not defined. Cannot preprocess symptoms.")
        # Return an array of zeros if feature_columns is empty to prevent crash
        return np.zeros((1, 1)) # Return a dummy array (1 row, 1 col)

    # Create a zero vector of the same size as the training features
    input_features = np.zeros(len(feature_columns), dtype=int)

    # For each observed symptom ID, find its corresponding feature column name
    # and set its value to 1 in the input_features vector.
    for symptom_db_id in observed_symptom_ids: # Corrected: 'symptom_db_id' instead of 'symptym_db_id'
        # Construct the expected column name based on our 'symptom_<ID>_present' convention
        symptom_col_name = f'symptom_{symptom_db_id}_present'
        if symptom_col_name in feature_columns:
            # Find the index of this symptom column in the feature_columns list
            col_index = feature_columns.index(symptom_col_name)
            input_features[col_index] = 1
        else:
            print(f"Warning: Symptom ID {symptom_db_id} not found in the features the model was trained on. This symptom will be ignored in prediction.")

    return input_features.reshape(1, -1) # Reshape for single sample prediction


@app.route('/predict', methods=['POST'])
def predict():
    # Check if all necessary ML artifacts are loaded before proceeding
    if ml_model is None or label_encoder is None or not feature_columns:
        return jsonify({"error": "AI service is not ready. ML model or preprocessing artifacts failed to load. "
                                 "Ensure 'python train_model.py' was run successfully."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    plant_id = data.get('plant_id') # plant_id is received but not used by this generic symptom-based ML model
    symptom_ids = data.get('symptom_ids')

    if not isinstance(symptom_ids, list) or len(symptom_ids) == 0:
        return jsonify({"error": "Invalid input. 'symptom_ids' (non-empty array of integers) are required."}), 400

    # Preprocess symptoms for the ML model
    input_features = preprocess_symptoms_for_prediction(symptom_ids, feature_columns)

    # Make prediction
    try:
        predicted_label = ml_model.predict(input_features)[0]
        predicted_disease_name = label_encoder.inverse_transform([predicted_label])[0]

        # Optional: Get prediction confidence (if your model supports predict_proba)
        # probabilities = ml_model.predict_proba(input_features)[0]
        # confidence = np.max(probabilities) # Highest probability
        # print(f"Prediction confidence: {confidence*100:.2f}%")

        return jsonify({"predicted_disease_name": predicted_disease_name}), 200

    except Exception as e:
        print(f"Error during ML prediction: {e}")
        return jsonify({"predicted_disease_name": None, "message": f"Error during prediction: {str(e)}"}), 500

# Basic health check endpoint
@app.route('/')
def home():
    if ml_model and label_encoder and feature_columns:
        return "AI Prediction Service is running and ML model is loaded!"
    else:
        return "AI Prediction Service is running but ML model is NOT loaded (check server logs)."

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)