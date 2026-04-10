import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
data = pd.read_csv("dosha_dataset.csv")

# Encode categorical columns
le_sleep = LabelEncoder()
le_digestion = LabelEncoder()
le_body = LabelEncoder()
le_target = LabelEncoder()

data["sleep"] = le_sleep.fit_transform(data["sleep"])
data["digestion"] = le_digestion.fit_transform(data["digestion"])
data["body_type"] = le_body.fit_transform(data["body_type"])
data["dosha"] = le_target.fit_transform(data["dosha"])

# Features and target
X = data[["age", "weight", "height", "sleep", "digestion", "body_type"]]
y = data["dosha"]

# Train model
model = DecisionTreeClassifier()
model.fit(X, y)

# Save everything (IMPORTANT)
joblib.dump(model, "dosha_model.pkl")
joblib.dump(le_sleep, "le_sleep.pkl")
joblib.dump(le_digestion, "le_digestion.pkl")
joblib.dump(le_body, "le_body.pkl")
joblib.dump(le_target, "le_target.pkl")

print("Model trained successfully!")