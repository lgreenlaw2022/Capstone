import os


class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")
    SQLALCHEMY_DATABASE_URI = "sqlite:///instance/your_database.db"

    # Other environment variables can be added here as needed
