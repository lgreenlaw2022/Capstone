from flask import Blueprint, jsonify
from models import db, User  # Adjust the import based on your project structure
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint("user_info", __name__)


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
