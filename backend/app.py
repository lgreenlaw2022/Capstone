# Import necessary modules from Flask and related extensions
from flask import Flask
from flask_cors import CORS
from models import db
import os
from routes import user_routes as user_bp

# Load environment variables from .env file
# from dotenv import load_dotenv
# load_dotenv()

# TODO: Initialize Migrate for database migrations

# Create and configure the Flask application
app = Flask(__name__)

# Configure the app with necessary settings
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///site.db')

# Enable Cross-Origin Resource Sharing (CORS) for the app
CORS(app)

app.register_blueprint(user_bp, url_prefix='/user')

# Initialize database and migration functionalities with the app
db.init_app(app)

# Create all database tables within the application context
# TODO: switch out for migrations later in development
with app.app_context():
    db.drop_all()
    db.create_all()

@app.route('/')
def home():
    return "Backend is running!"

# main guard
# port and host changed for deployment purposes
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)