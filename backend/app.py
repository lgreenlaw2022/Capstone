# Import necessary modules from Flask and related extensions
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import logging
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()
# Initialize SQLAlchemy for database operations
from models import db

migrate = Migrate()

logger = logging.getLogger(__name__)
log_level = os.environ.get("LOG_LEVEL", "DEBUG").upper()
logging.basicConfig(level=log_level)


def create_app():
    logger.debug("Creating app...")

    # Create and configure the Flask application
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object("config.Config")

    # Create instance folder if it doesn't exist
    os.makedirs(app.instance_path, exist_ok=True)

    # Configure the app with necessary settings
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "default_secret_key")

    # Get database URL from environment
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        logger.debug("DATABASE_URL not found in environment variables")
        # Fallback to SQLite for local development
        database_url = f"sqlite:///{os.path.join(app.instance_path, 'site.db')}"

    logger.debug(f"SQLALCHEMY_DATABASE_URI: {database_url}")

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "default_jwt_secret_key"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Configure CORS based on environment
    frontend_url = os.environ.get("FRONTEND_URL")
    logger.debug(f"FRONTEND_URL: {frontend_url}")
    if app.config["ENV"] == "production" and frontend_url:
        # In production, only allow the frontend domain
        logger.debug("Setting CORS with frontend URL because in production")
        CORS(app, origins=[frontend_url])
    else:
        # In development, allow all origins
        CORS(app)

    # Initialize JWT Manager with error handlers
    jwt = JWTManager(app)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        logger.error(f"Invalid token error: {str(error)}")
        logger.error(f"Request headers: {request.headers}")
        return jsonify({"msg": "Invalid token", "error": str(error)}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        logger.error(f"Unauthorized error: {str(error)}")
        logger.error(f"Request headers: {request.headers}")
        return (
            jsonify({"msg": "Missing Authorization Header", "error": str(error)}),
            401,
        )

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        logger.error(f"Expired token. Payload: {jwt_payload}")
        logger.error(f"Request headers: {request.headers}")
        return jsonify({"msg": "Token has expired", "error": "expired"}), 401

    # Initialize database and migration functionalities with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # register blueprints
    from routes.user_info import user_bp
    from routes.auth import auth_bp
    from routes.content import content_bp
    from routes.badges import badges_bp
    from routes.review import review_bp
    from routes.leaderboard import leaderboard_bp
    from routes.goals import goals_bp

    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(content_bp, url_prefix="/content")
    app.register_blueprint(badges_bp, url_prefix="/badges")
    app.register_blueprint(review_bp, url_prefix="/review")
    app.register_blueprint(leaderboard_bp, url_prefix="/leaderboard")
    app.register_blueprint(goals_bp, url_prefix="/goals")

    # Add the home route
    @app.route("/")
    def home():
        return {"status": "API is running"}, 200

    # Create all database tables within the application context
    # custom CLI command to run the seed script
    @app.cli.command("seed")
    def seed():
        from seed import seed_data

        try:
            seed_data()
        except Exception as e:
            logger.error(f"An error occurred while seeding the database: {str(e)}")
            db.session.rollback()
            exit(1)  # Exit with a non-zero status code to indicate failure

    return app


# main guard
if __name__ == "__main__":
    app = create_app()
    if app.config["ENV"] == "production":
        logger.debug("Running in production mode")
        # Use gunicorn in production, don't run app.run()
        pass
    else:
        # Only for local development
        logger.debug("Running in development mode")
        app.run(debug=True, host="0.0.0.0", port=5000)
