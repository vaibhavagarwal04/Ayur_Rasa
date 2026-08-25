import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# 1. Load NEW Ayurvedic Dosha Dataset
# ============================================================

DATASET_PATH = "ayurvedic_dosha_dataset.csv"
MODEL_PATH = "dosha_model.pkl"

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {len(df.columns)}")


# ============================================================
# 2. Separate features and target
# ============================================================

X = df.drop("Dosha", axis=1)
y = df["Dosha"]

print("\nTarget classes:")
print(y.value_counts())


# ============================================================
# 3. Identify categorical columns
# ============================================================

categorical_columns = X.columns.tolist()


# ============================================================
# 4. Preprocessing
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            ),
            categorical_columns
        )
    ]
)


# ============================================================
# 5. ML Model
# ============================================================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"
)


# ============================================================
# 6. Complete ML Pipeline
# ============================================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", model)
    ]
)


# ============================================================
# 7. Train/Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# ============================================================
# 8. Train
# ============================================================

print("\nTraining model...")

pipeline.fit(X_train, y_train)


# ============================================================
# 9. Evaluate
# ============================================================

y_pred = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n========================================")
print("MODEL RESULTS")
print("========================================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# ============================================================
# 10. Save trained model
# ============================================================

joblib.dump(pipeline, MODEL_PATH)

print("========================================")
print(f"Model saved as: {MODEL_PATH}")
print("========================================")