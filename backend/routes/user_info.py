from flask import Blueprint, jsonify
from models import db, User  # Adjust the import based on your project structure
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

user_bp = Blueprint("user_info", __name__)

# Configure the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Retrieve bio data for the profile page and others
@user_bp.route("/bio-data", methods=["GET"])
@jwt_required()
def get_user_bio_data():
    user_id = get_jwt_identity()
    
    try:
        # Fetch only the required fields
        user = User.query.with_entities(
            User.username, User.email, User.created_date
        ).filter_by(id=user_id).first()

        if user:
            # Check if any of the fields are empty
            if not user.username or not user.email or not user.created_date:
                return jsonify({"error": "User data is incomplete"}), 400
                
            return (
                jsonify(
                    {
                        "username": user.username,
                        "email": user.email,
                        "created_date": user.created_date.strftime("%d-%m-%Y"),  # Format date as DD-MM-YYYY
                    }
                ),
                200,
            )
        else:
            logger.error("User does not exist or is invalid")
            return jsonify({"error": "User does not exist or is invalid"}), 404
    except Exception as e:
        logger.error(f"An error occurred while fetching user data: {str(e)}")
        return jsonify({"error": "An error occurred while fetching user data"}), 500


# Retrieve streak and gem counts for a user
@user_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    user_id = get_jwt_identity()
    if user_id is None:
        return jsonify({"error": "Invalid user identity"}), 400

    user = User.query.get(user_id)
    if user:
        return (
            jsonify(
                {"streak": user.streak, "gems": user.gems, "username": user.username}
            ),
            200,
        )
    else:
        return jsonify({"error": "User not found"}), 404
