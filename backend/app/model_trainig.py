import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import category_encoders as ce
import joblib

# Load dataset
df = pd.read_csv('Fraud.csv')

# Target and features
X = df.drop(['isFraud', 'isFlaggedFraud'], axis=1)
y = df['isFraud']

# Use category_encoders for encoding
encoder = ce.OrdinalEncoder(cols=['type', 'nameOrig', 'nameDest'], handle_unknown='ignore')
X_encoded = encoder.fit_transform(X)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Evaluate
y_pred = rf.predict(X_test)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save model and encoder
joblib.dump(rf, 'random_forest_model.pkl')
joblib.dump(encoder, 'encoder.pkl')
