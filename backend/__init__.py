# Import necessary modules from Flask and related extensions
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

# Initialize SQLAlchemy for database operations
db = SQLAlchemy()

# Initialize Migrate for database migrations
migrate = Migrate()

# Function to create and configure the Flask application
def create_app():
    app = Flask(__name__)

    # Configure the app with necessary settings
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///site.db')

    # Enable Cross-Origin Resource Sharing (CORS) for the app
    CORS(app)

    # Initialize database and migration functionalities with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints for different parts of the application

    # Configure JWT settings for the app
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_jwt_secret_key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 7000))
    jwt = JWTManager(app)    

    # Create all database tables within the application context
    with app.app_context():
        db.create_all()
        
    # Return the configured Flask app instance
    return app