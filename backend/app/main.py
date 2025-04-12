import pandas as pd
import joblib
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load saved LightGBM model and encoder
model = joblib.load('lightgbm_model.pkl')
encoder = joblib.load('encoder.pkl')

# Initialize SHAP explainer (tree explainer is fastest for LightGBM)
explainer = shap.Explainer(model)

app = Flask(__name__)
CORS(app)

def batch_predict(transactions):
    df = pd.DataFrame(transactions)
    df = df.drop(columns=["nameOrig", "nameDest"], errors='ignore')

    encoded = encoder.transform(df)

    # Predictions
    predictions = model.predict(encoded)
    probs = model.predict_proba(encoded)[:, 1]

    # SHAP explanations
    shap_values = explainer(encoded)

    results = []
    for i, (pred, prob) in enumerate(zip(predictions, probs)):
        if prob >= 0.9:
            status = "Fraud"
        elif 0.5 <= prob < 0.9:
            status = "Manual Review"
        else:
            status = "Legitimate"

        # Get SHAP values and top 3 contributing features
        feature_names = df.columns
        shap_vals = shap_values[i].values
        top_indices = abs(shap_vals).argsort()[::-1][:3]

        contributions = [
            {"feature": feature_names[idx], "impact": round(shap_vals[idx], 4)}
            for idx in top_indices
        ]

        results.append({
            "prediction": int(pred),
            "fraud_probability": round(prob * 100, 2),
            "status": status,
            "explanation": contributions
        })

    return results

@app.route('/predict', methods=['POST'])
def predict_endpoint():
    try:
        data = request.get_json()

        if not isinstance(data, list):
            return jsonify({"error": "Expected a JSON array of transaction dictionaries"}), 400

        results = batch_predict(data)
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)