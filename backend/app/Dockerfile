# Use official Python slim image for a smaller footprint
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements.txt first to leverage Docker caching
COPY requirements.txt .

# Install system dependencies (for pandas, numpy, etc.)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model files
COPY main.py .
COPY lightgbm_model.pkl .
COPY encoder.pkl .
COPY Fraud.csv .

# Expose port 5000
EXPOSE 5000

# Command to run the Flask app
CMD ["python", "main.py"]