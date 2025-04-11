import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt

# Load saved LightGBM model and encoder
model = joblib.load('lightgbm_model.pkl')
encoder = joblib.load('encoder.pkl')

def predict_transaction(transaction_dict):
    # Drop name fields to match training schema
    transaction_dict.pop('nameOrig', None)
    transaction_dict.pop('nameDest', None)

    input_df = pd.DataFrame([transaction_dict])

    # Encode categorical
    input_encoded = encoder.transform(input_df)

    # Predict fraud (class) and probability
    prediction = model.predict(input_encoded)[0]
    probabilities = model.predict_proba(input_encoded)[0][1]  # Probability of fraud

    # Apply thresholds
    if probabilities >= 0.9:
        label = "!! Fraud !!"
    elif 0.5 <= probabilities < 0.9:
        label = "Manual Review"
    else:
        label = " ** Legitimate ** "

    result = {
        "prediction": int(prediction),
        "fraud_probability": round(probabilities * 100, 2),
        "status": label
    }

    return result, input_encoded

# Example transaction
new_txn = {
    'step': 1,
    'type': 'TRANSFER',
    'amount': 250000.0,
    'nameOrig': 'C999999999',  # dropped
    'oldbalanceOrg': 900000.0,
    'newbalanceOrig': 850000.0,
    'nameDest': 'C111111111',  # dropped
    'oldbalanceDest': 100000.0,
    'newbalanceDest': 350000.0
}

fraud_txn ={
    'step': 1,
    'type': 'TRANSFER',
    'amount': 100000.0,
    'nameOrig': 'C123456789',  # dropped
    'oldbalanceOrg': 100000.0,
    'newbalanceOrig': 0.0,  
    'nameDest': 'C987654321',  # dropped
    'oldbalanceDest': 0.0,
    'newbalanceDest': 0.0 
}

manual_review_txn = {
    'step': 150,
    'type': 'TRANSFER',
    'amount': 50000.0,
    'nameOrig': 'C345678901',  # dropped
    'oldbalanceOrg': 50000.0,
    'newbalanceOrig': 0.0,
    'nameDest': 'C123456789',  # dropped
    'oldbalanceDest': 0.0,
    'newbalanceDest': 50000.0
}


# Run prediction
result, input_encoded = predict_transaction(manual_review_txn)

# Print results
print(f"Prediction: {result['prediction']}")
print(f"Probability of Fraud: {result['fraud_probability']}%")
print(f"Status: {result['status']}")