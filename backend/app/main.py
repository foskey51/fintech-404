import pandas as pd
import joblib
import numpy as np

# Load saved model and encoder
rf = joblib.load('random_forest_model.pkl')
encoder = joblib.load('encoder.pkl')

def predict_transaction(transaction_dict):

    input_df = pd.DataFrame([transaction_dict])

    # Encode using the loaded encoder
    input_encoded = encoder.transform(input_df)

    # Predict class and probability
    prediction = rf.predict(input_encoded)[0]
    probabilities = rf.predict_proba(input_encoded)[0][1]  # probability of fraud

    if probabilities >= 0.9:
        label = "🚩 Fraud"
    elif 0.5 <= probabilities < 0.9:
        label = "Manual Review"
    else:
        label = "Legitimate"

    return {
        "prediction": int(prediction),
        "fraud_probability": round(probabilities * 100, 2),
        "status": label
    }

new_txn = {
    'step': 1,
    'type': 'TRANSFER',
    'amount': 250000.0,
    'nameOrig': 'C999999999',
    'oldbalanceOrg': 200000.0,
    'newbalanceOrig': 0.0,
    'nameDest': 'C111111111',
    'oldbalanceDest': 0.0,
    'newbalanceDest': 0.0
}

result = predict_transaction(new_txn)
print(f"Prediction: {result['prediction']}")
print(f"Probability of Fraud: {result['fraud_probability']}%")
print(f"Status: {result['status']}")