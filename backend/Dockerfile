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

# Create a startup script that ensures database is ready
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
DB_HOST=$(echo $DATABASE_URL | sed -n "s/.*@\([^:]*\):.*/\1/p")\n\
DB_PORT=$(echo $DATABASE_URL | sed -n "s/.*:\([0-9]*\)\/.*/\1/p")\n\
echo "Checking connection to $DB_HOST:$DB_PORT"\n\
while ! nc -z $DB_HOST $DB_PORT; do\n\
  sleep 1\n\
done\n\
echo "Database is ready!"\n\
echo "Running migrations..."\n\
flask db upgrade\n\
echo "Seeding database..."\n\
flask seed\n\
echo "Starting server..."\n\
gunicorn "app:create_app()" --timeout 120 --bind "0.0.0.0:${PORT:-5000}" --log-level debug' > /app/start.sh \
&& chmod +x /app/start.sh

# Install netcat for database connection check
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

CMD ["/app/start.sh"]
