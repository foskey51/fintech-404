import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import category_encoders as ce
from imblearn.over_sampling import SMOTE
import joblib
import lightgbm as lgb

# Load data
df = pd.read_csv('Fraud.csv')
df = df.drop(columns=['isFlaggedFraud', 'nameOrig', 'nameDest'])

# Features and target
X = df.drop(columns='isFraud')
y = df['isFraud']

# Encode 'type' column
encoder = ce.OrdinalEncoder(cols=['type'], handle_unknown='ignore')
X_encoded = encoder.fit_transform(X)

# Handle imbalance with SMOTE
sm = SMOTE(random_state=42)
X_resampled, y_resampled = sm.fit_resample(X_encoded, y)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_resampled, y_resampled, test_size=0.2, random_state=42
)

# Train LightGBM model
model = lgb.LGBMClassifier(
    n_estimators=100,
    max_depth=15,
    class_weight='balanced',
    n_jobs=-1,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred, digits=4))

# Save model and encoder
joblib.dump(model, 'lightgbm_model.pkl')
joblib.dump(encoder, 'encoder.pkl')
