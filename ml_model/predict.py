import sys
import json
import joblib
import pandas as pd

import os

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "dosha_model.pkl"
)

# Load trained model
model = joblib.load(MODEL_PATH)

# The exact 25 feature names used by the dataset
FEATURES = [
    "Body Frame",
    "Type of Hair",
    "Color of Hair",
    "Skin",
    "Complexion",
    "Body Weight",
    "Nails",
    "Size and Color of the Teeth",
    "Pace of Performing Work",
    "Mental Activity",
    "Memory",
    "Sleep Pattern",
    "Weather Conditions",
    "Reaction under Adverse Situations",
    "Mood",
    "Eating Habit",
    "Hunger",
    "Body Temperature",
    "Joints",
    "Nature",
    "Body Energy",
    "Quality of Voice",
    "Dreams",
    "Social Relations",
    "Body Odor"
]

try:
    # Read JSON from stdin
    input_data = json.loads(sys.stdin.read())

    # Convert frontend answers to model feature format
    row = {}

    for feature in FEATURES:
        if feature not in input_data:
            raise ValueError(f"Missing feature: {feature}")

        row[feature] = input_data[feature]

    # Create DataFrame in EXACT feature order
    df = pd.DataFrame([row], columns=FEATURES)

    # Predict
    prediction = model.predict(df)[0]

    # Probability if available
    probabilities = {}

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df)[0]
        classes = model.classes_

        probabilities = {
            str(cls): round(float(prob) * 100, 2)
            for cls, prob in zip(classes, probs)
        }

    result = {
        "success": True,
        "prediction": str(prediction),
        "probabilities": probabilities
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e)
    }))
    sys.exit(1)