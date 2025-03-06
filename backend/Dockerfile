FROM python:3.11-slim

# Install PostgreSQL dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Use shell form to allow environment variable interpolation
flask db upgrade && flask seed && gunicorn "app:create_app()" --timeout 120 --bind "0.0.0.0:${PORT:-5000}" --log-level debug
