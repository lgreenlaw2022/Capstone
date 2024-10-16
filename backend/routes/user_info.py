from flask import Blueprint, jsonify
from models import db, User  # Adjust the import based on your project structure
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint("user_info", __name__)


# Retrieve bio data for the profile page and others
@user_bp.route("/bio-data", methods=["GET"])
@jwt_required()
def get_user_bio_data():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
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
        return jsonify({"error": "User not found"}), 404


# Retrieve streak and gem counts for a user
@user_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    user_id = get_jwt_identity()
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
