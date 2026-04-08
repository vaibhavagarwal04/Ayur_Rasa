# import pandas as pd
# from sklearn.preprocessing import LabelEncoder
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score
# import pickle

# # Load dataset
# data = pd.read_csv("dosha_dataset.csv", on_bad_lines='skip')

# # Convert text to numbers
# le_sleep = LabelEncoder()
# le_digestion = LabelEncoder()
# le_body = LabelEncoder()
# le_dosha = LabelEncoder()

# data["sleep"] = le_sleep.fit_transform(data["sleep"])
# data["digestion"] = le_digestion.fit_transform(data["digestion"])
# data["body_type"] = le_body.fit_transform(data["body_type"])
# data["dosha"] = le_dosha.fit_transform(data["dosha"])

# # Inputs (features)
# X = data[["age", "weight", "height", "sleep", "digestion", "body_type"]]

# # Output (target)
# y = data["dosha"]

# # Split data (80% training, 20% testing)
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y, test_size=0.2, random_state=42
# )

# # Train model
# model = RandomForestClassifier(random_state=42)
# model.fit(X_train, y_train)

# # Check accuracy
# y_pred = model.predict(X_test)
# accuracy = accuracy_score(y_test, y_pred)

# print("Model Accuracy:", round(accuracy * 100, 2), "%")

# # Save model
# pickle.dump(model, open("dosha_model.pkl", "wb"))
# pickle.dump(le_sleep, open("le_sleep.pkl", "wb"))
# pickle.dump(le_digestion, open("le_digestion.pkl", "wb"))
# pickle.dump(le_body, open("le_body.pkl", "wb"))
# pickle.dump(le_dosha, open("le_dosha.pkl", "wb"))

# print("Model trained and saved successfully!")

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
import pickle

# Load data
data = pd.read_csv("dosha_dataset.csv")

# Features + target
X = data[["age", "weight", "height"]]
y = data["dosha"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Model
model = DecisionTreeClassifier()
model.fit(X_train, y_train)

# Save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved!")