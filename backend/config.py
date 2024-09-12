import os

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key')
    SQLALCHEMY_DATABASE_URI='sqlite:///site.db'
    JWT_SECRET_KEY='jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES=7000

    # Other environment variables can be added here as needed