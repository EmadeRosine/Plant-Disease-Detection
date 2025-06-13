
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import random
import os


NUM_SAMPLES_PER_DISEASE = 200 

MAX_SYMPTOM_ID = 20
NOISE_SYMPTOMS_COUNT = 2 


DISEASE_TO_PRIMARY_SYMPTOMS = {
    "Early Blight": [1, 2],        
    "Late Blight": [1, 2, 5],     
    "Fusarium Wilt": [2, 3],      
    
}


ALL_SYMPTOM_COLUMNS = [f'symptom_{i}_present' for i in range(1, MAX_SYMPTOM_ID + 1)]

# --- 1. Generate Synthetic Training Data ---
print("Generating synthetic dataset...")

data_rows = []

for disease_name, primary_symptoms in DISEASE_TO_PRIMARY_SYMPTOMS.items():
    for _ in range(NUM_SAMPLES_PER_DISEASE):
      
        sample_symptoms = {col: 0 for col in ALL_SYMPTOM_COLUMNS}

  
        for s_id in primary_symptoms:
            col_name = f'symptom_{s_id}_present'
            if col_name in sample_symptoms:
                sample_symptoms[col_name] = 1

      
        available_noise_symptoms = [s for s in ALL_SYMPTOM_COLUMNS if s not in [f'symptom_{id}_present' for id in primary_symptoms]]
        num_noise = random.randint(0, min(NOISE_SYMPTOMS_COUNT, len(available_noise_symptoms)))
        chosen_noise_symptoms = random.sample(available_noise_symptoms, num_noise)
        for noise_col in chosen_noise_symptoms:
            sample_symptoms[noise_col] = 1

    
        sample_symptoms['disease_name'] = disease_name
        data_rows.append(sample_symptoms)


df = pd.DataFrame(data_rows)

for col in ALL_SYMPTOM_COLUMNS:
    if col not in df.columns:
        df[col] = 0


df = df[ALL_SYMPTOM_COLUMNS + ['disease_name']]

print(f"Generated {len(df)} synthetic samples.")
print("First 5 rows of generated data:")
print(df.head())
print(f"Dataset shape: {df.shape}")

# --- 2. Preprocess Data ---
TARGET_COLUMN = 'disease_name'


feature_columns = [col for col in df.columns if col != TARGET_COLUMN]
X = df[feature_columns]
y = df[TARGET_COLUMN]


label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print(f"\nEncoded diseases (mapping from number to name):")
for i, name in enumerate(label_encoder.classes_):
    print(f"  {i}: {name}")

print(f"\nFeatures (X) shape: {X.shape}")
print(f"Labels (y_encoded) shape: {y_encoded.shape}")

# --- 3. Train the Model ---
print("\nTraining Decision Tree Classifier...")
model = DecisionTreeClassifier(random_state=42)
model.fit(X, y_encoded)
print("Model training complete.")

# --- 4. Save the Trained Model and Preprocessing Artifacts ---
model_path = 'model.pkl'
label_encoder_path = 'label_encoder.pkl'
feature_columns_path = 'feature_columns.json' 

joblib.dump(model, model_path)
print(f"\nModel saved to {model_path}")

joblib.dump(label_encoder, label_encoder_path)
print(f"Label Encoder saved to {label_encoder_path}")

with open(feature_columns_path, 'w') as f:
    json.dump(feature_columns, f) 
print(f"Feature columns saved to {feature_columns_path}")

print("\n--- Model training and saving script finished ---")
print("Now, proceed to run your Flask AI service using 'python app.py'.")
