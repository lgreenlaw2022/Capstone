import os


class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///instance/site.db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_jwt_secret_key")
    ENV = os.environ.get("FLASK_ENV", "development")
    FRONTEND_URL = os.environ.get("FRONTEND_URL")
