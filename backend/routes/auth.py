from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    unset_jwt_cookies,
)
import logging

from app import db
from models import User
from services.user_activity_service import UserActivityService
from services.goals_service import GoalService

auth_bp = Blueprint("auth", __name__)

# Configure the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

goal_service = GoalService()
user_activity_service = UserActivityService()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validate input data
    if (
        data is None
        or not data.get("username")
        or not data.get("password")
        or not data.get("email")
    ):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if the username already exists
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    # Check if the email already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create a new user
    new_user = User(username=data["username"], email=data["email"], xp=0)
    new_user.set_password(data["password"])  # use a secure hashed password

    # Add the user to the database
    db.session.add(new_user)
    db.session.commit()

    try:
        goal_service.initialize_user_goals(new_user.id)
    except Exception as e:
        logger.error(f"Error initializing goals for user {new_user.id}: {str(e)}")

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    # Validate input data
    if data is None or not data.get("userIdentifier") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400
    # Find the user by username or email
    user = User.query.filter(
        (User.username == data["userIdentifier"])
        | (User.email == data["userIdentifier"])
    ).first()

    # Check if the user exists and the password is correct
    if user and user.check_password(data["password"]):
        access_token = create_access_token(
            identity=str(user.id)
        )  # convert to a string for the sub field
        try:
            if user_activity_service.reset_streak(user):
                logger.info(f"User {user.id} streak reset due to inactivity")
        except Exception as e:
            logger.error(f"Error resetting streak for user {user.id}: {str(e)}")
            # continue with login despite streak failure

        # Check and populate goals
        goal_service.check_and_populate_goals(user.id)

        return (
            jsonify({"message": "Login successful", "access_token": access_token}),
            200,
        )
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@auth_bp.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200


# endpoint for a logged in user to delete their account
@auth_bp.route("/delete", methods=["POST"])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()

        logger.info(f"User {user_id} deleted successfully.")
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({"error": "Error deleting user"}), 500


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username}), 200
