
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import json 
app = Flask(__name__)
CORS(app)

# --- Load the trained ML Model and Preprocessing Artifacts ---
MODEL_PATH = 'model.pkl'
LABEL_ENCODER_PATH = 'label_encoder.pkl'
FEATURE_COLUMNS_PATH = 'feature_columns.json'
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
  
    ml_model = None
    label_encoder = None
    feature_columns = []


# --- Function to preprocess symptoms for the ML model ---
def preprocess_symptoms_for_prediction(observed_symptom_ids, feature_columns):
    """
    Converts a list of observed symptom IDs into a binary feature vector
    that matches the order and count of feature_columns used during training.
    """
    if not feature_columns: # ms.")
      
        return np.zeros((1, 1))

  
    input_features = np.zeros(len(feature_columns), dtype=int)

 
    for symptom_db_id in observed_symptom_ids: 
        symptom_col_name = f'symptom_{symptom_db_id}_present'
        if symptom_col_name in feature_columns:
           
            col_index = feature_columns.index(symptom_col_name)
            input_features[col_index] = 1
        else:
            print(f"Warning: Symptom ID {symptom_db_id} not found in the features the model was trained on. This symptom will be ignored in prediction.")

    return input_features.reshape(1, -1) 


@app.route('/predict', methods=['POST'])
def predict():
   
    if ml_model is None or label_encoder is None or not feature_columns:
        return jsonify({"error": "AI service is not ready. ML model or preprocessing artifacts failed to load. "
                                 "Ensure 'python train_model.py' was run successfully."}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    symptom_ids = data.get('symptom_ids')

    if not isinstance(symptom_ids, list) or len(symptom_ids) == 0:
        return jsonify({"error": "Invalid input. 'symptom_ids' (non-empty array of integers) are required."}), 400

  
    input_features = preprocess_symptoms_for_prediction(symptom_ids, feature_columns)

    try:
        predicted_label = ml_model.predict(input_features)[0]
        predicted_disease_name = label_encoder.inverse_transform([predicted_label])[0]

       

        return jsonify({"predicted_disease_name": predicted_disease_name}), 200

    except Exception as e:
        print(f"Error during ML prediction: {e}")
        return jsonify({"predicted_disease_name": None, "message": f"Error during prediction: {str(e)}"}), 500


@app.route('/')
def home():
    if ml_model and label_encoder and feature_columns:
        return "AI Prediction Service is running and ML model is loaded!"
    else:
        return "AI Prediction Service is running but ML model is NOT loaded (check server logs)."

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
PREDICTION_RULES = {
    # Tomato Diseases (Plant ID 1)
    (1, frozenset([1, 2])): "Early Blight",        
    (1, frozenset([1, 2, 5])): "Late Blight",      
    (1, frozenset([2, 3])): "Fusarium Wilt",      
    (1, frozenset([7])): "Powdery Mildew",       
    (1, frozenset([2, 3, 8])): "Cucumber Mosaic Virus",
    (2, frozenset([1, 2])): "Early Blight",         
    (2, frozenset([1, 4])): "Late Blight",         
    (2, frozenset([7])): "Powdery Mildew",         

    
    (3, frozenset([6, 3])): "Corn Common Rust",    

  
    (4, frozenset([8, 2])): "Cucumber Mosaic Virus", 
    (4, frozenset([7])): "Powdery Mildew",        

  
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        plant_id = data.get('plant_id')
        symptom_ids = data.get('symptom_ids', [])

        if not plant_id or not symptom_ids:
            return jsonify({"error": "Missing plant_id or symptom_ids"}), 400

        sorted_symptom_ids = frozenset(sorted(symptom_ids))

        predicted_disease_name = PREDICTION_RULES.get((plant_id, sorted_symptom_ids))

     
        if predicted_disease_name is None:
            print(f"No specific prediction rule for plant_id={plant_id}, symptom_ids={sorted(symptom_ids)}. No fallback defined for this combination.")
           
            return jsonify({"predicted_disease_name": None}), 200

        return jsonify({"predicted_disease_name": predicted_disease_name}), 200

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"predicted_disease_name": None, "message": f"Error during prediction: {str(e)}"}), 500


@app.route('/')
def home():
    return "AI Prediction Service (Rule-Based) is running!"

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)