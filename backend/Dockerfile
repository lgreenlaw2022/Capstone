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
echo "Starting application..."\n\
echo "DATABASE_URL: $DATABASE_URL"\n\
echo "Running migrations..."\n\
flask db upgrade\n\
echo "Seeding database..."\n\
flask seed\n\
echo "Starting server..."\n\
gunicorn "app:create_app()" --timeout 120 --bind "0.0.0.0:${PORT:-5000}" --log-level debug' > /app/start.sh \
&& chmod +x /app/start.sh

CMD ["/app/start.sh"]
