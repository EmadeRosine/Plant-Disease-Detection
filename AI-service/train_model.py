# agri-diagnosis-app/ai-service/train_model.py
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import random
import os

# --- Configuration for Synthetic Data Generation ---
NUM_SAMPLES_PER_DISEASE = 200 # How many samples to generate for each disease
# IMPORTANT: Adjust MAX_SYMPTOM_ID to be AT LEAST the highest symptom ID in your Node.js DB.
# Check your Symptom table IDs. For example, if your highest symptom ID is 15, set this to 15 or higher.
MAX_SYMPTOM_ID = 20 # Example: Assumes symptom IDs can go up to 20.
NOISE_SYMPTOMS_COUNT = 2 # Max number of extra, irrelevant symptoms to add to a sample for realism

# Define your disease to primary symptom mappings.
# Key: Disease Name (string) - Must match disease names you *expect* in your Node.js DB.
# Value: List of primary symptom IDs (integers) - Must match symptom IDs in your Node.js DB.
# These IDs correspond to the dummy data in your backend's `seed.js`.
DISEASE_TO_PRIMARY_SYMPTOMS = {
    "Early Blight": [1, 2],         # Leaf Spot (1), Wilting (2)
    "Late Blight": [1, 2, 5],       # Leaf Spot (1), Wilting (2), Fruit Lesions (5)
    "Fusarium Wilt": [2, 3],        # Wilting (2), Yellowing Leaves (3)
    # Add more diseases and their primary symptom IDs here based on your domain knowledge
    # Ensure these symptom IDs and disease names align with what you've or will populate in your Node.js DB.
}

# Generate a list of all possible symptom column names based on MAX_SYMPTOM_ID
ALL_SYMPTOM_COLUMNS = [f'symptom_{i}_present' for i in range(1, MAX_SYMPTOM_ID + 1)]

# --- 1. Generate Synthetic Training Data ---
print("Generating synthetic dataset...")

data_rows = []

for disease_name, primary_symptoms in DISEASE_TO_PRIMARY_SYMPTOMS.items():
    for _ in range(NUM_SAMPLES_PER_DISEASE):
        # Start with a base vector of all zeros for all possible symptoms
        sample_symptoms = {col: 0 for col in ALL_SYMPTOM_COLUMNS}

        # Add primary symptoms for the current disease
        for s_id in primary_symptoms:
            col_name = f'symptom_{s_id}_present'
            if col_name in sample_symptoms: # Basic check to ensure symptom ID is within MAX_SYMPTOM_ID range
                sample_symptoms[col_name] = 1

        # Introduce some noise (extra, irrelevant symptoms) for realism
        available_noise_symptoms = [s for s in ALL_SYMPTOM_COLUMNS if s not in [f'symptom_{id}_present' for id in primary_symptoms]]
        num_noise = random.randint(0, min(NOISE_SYMPTOMS_COUNT, len(available_noise_symptoms)))
        chosen_noise_symptoms = random.sample(available_noise_symptoms, num_noise)
        for noise_col in chosen_noise_symptoms:
            sample_symptoms[noise_col] = 1

        # Add the disease name as the target
        sample_symptoms['disease_name'] = disease_name
        data_rows.append(sample_symptoms)

# Convert to a Pandas DataFrame
df = pd.DataFrame(data_rows)
# Ensure all symptom columns are present, even if some weren't generated for any disease
# This handles cases where MAX_SYMPTOM_ID is larger than any ID used in DISEASE_TO_PRIMARY_SYMPTOMS
for col in ALL_SYMPTOM_COLUMNS:
    if col not in df.columns:
        df[col] = 0

# Reorder columns to ensure 'disease_name' is last for clarity, and features are in consistent order
df = df[ALL_SYMPTOM_COLUMNS + ['disease_name']]

print(f"Generated {len(df)} synthetic samples.")
print("First 5 rows of generated data:")
print(df.head())
print(f"Dataset shape: {df.shape}")

# --- 2. Preprocess Data ---
TARGET_COLUMN = 'disease_name'

# Separate features (X) and target (y)
feature_columns = [col for col in df.columns if col != TARGET_COLUMN]
X = df[feature_columns]
y = df[TARGET_COLUMN]

# Encode target labels (disease names) into numbers
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print(f"\nEncoded diseases (mapping from number to name):")
for i, name in enumerate(label_encoder.classes_):
    print(f"  {i}: {name}")

print(f"\nFeatures (X) shape: {X.shape}")
print(f"Labels (y_encoded) shape: {y_encoded.shape}")

# --- 3. Train the Model ---
print("\nTraining Decision Tree Classifier...")
model = DecisionTreeClassifier(random_state=42) # Using a simple Decision Tree for demonstration
model.fit(X, y_encoded)
print("Model training complete.")

# --- 4. Save the Trained Model and Preprocessing Artifacts ---
model_path = 'model.pkl'
label_encoder_path = 'label_encoder.pkl'
feature_columns_path = 'feature_columns.json' # This will store the ordered list of symptom column names

joblib.dump(model, model_path)
print(f"\nModel saved to {model_path}")

joblib.dump(label_encoder, label_encoder_path)
print(f"Label Encoder saved to {label_encoder_path}")

with open(feature_columns_path, 'w') as f:
    json.dump(feature_columns, f) # Save the list of columns used as features
print(f"Feature columns saved to {feature_columns_path}")

print("\n--- Model training and saving script finished ---")
print("Now, proceed to run your Flask AI service using 'python app.py'.")
