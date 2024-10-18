# Import necessary modules from Flask and related extensions
from flask import Flask
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Load environment variables from .env file
# from dotenv import load_dotenv
# load_dotenv()
# Initialize SQLAlchemy for database operations
from models import db
migrate = Migrate()

# TODO: Initialize Migrate for database migrations
def create_app():

    # Create and configure the Flask application
    app = Flask(__name__)

    # Configure the app with necessary settings
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///site.db')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default_jwt_secret_key')  # TODO Change this to a random secret key

    # Enable Cross-Origin Resource Sharing (CORS) for the app
    CORS(app)

    # Initialize JWT Manager
    jwt = JWTManager(app)

    # Initialize database and migration functionalities with the app
    db.init_app(app)
    migrate.init_app(app, db)

    #register blueprints
    from routes.user_info import user_bp
    from routes.auth import auth_bp
    from routes.content import content_bp
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(content_bp, url_prefix='/content')

    # Create all database tables within the application context
    # TODO: switch out for migrations later in development
    # with app.app_context():
    #     db.create_all()
    # Add custom CLI command to run the seed script
    @app.cli.command("seed")
    def seed():
        from seed import seed_data
        seed_data()
    
    return app

# main guard
# port and host changed for deployment purposes
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)