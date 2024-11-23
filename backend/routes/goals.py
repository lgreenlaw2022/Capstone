from services.goals_service import GoalProgressCalculator
from utils import get_most_recent_monday
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import timedelta
from enums import TimePeriodType

from models import User, Goal, UserGoal

goals_bp = Blueprint("goals", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@goals_bp.route("/daily", methods=["GET"])
@jwt_required()
def get_daily_goals():
    try:
        user_id = get_jwt_identity()
        # TODO: is it a waste to query the user here?
        user = User.query.get(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        calculator = GoalProgressCalculator()
        logger.debug("Using calculator to calculate daily goals")
        daily_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.DAILY
        )

        if len(daily_goals) == 0:
            logger.info("No daily goals found")
            return jsonify([]), 200

        return jsonify(daily_goals), 200
    except Exception as e:
        logger.error("An error occurred while fetching daily goals")
        return jsonify({"error": "An error occured while fetching daily goals"}), 500


@goals_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly_goals():
    try:
        user_id = get_jwt_identity()
        # TODO: is it a waste to query the user here?
        user = User.query.get(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        calculator = GoalProgressCalculator()
        daily_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.WEEKLY
        )

        if len(daily_goals) == 0:
            logger.info("No weekly goals found")
            return jsonify([]), 200

        return jsonify(daily_goals), 200
    except Exception as e:
        logger.error("An error occurred while fetching weekly goals")
        return jsonify({"error": "An error occured while fetching weekly goals"}), 500


@goals_bp.route("/monthly", methods=["GET"])
@jwt_required()
def get_monthly_goals():
    try:
        user_id = get_jwt_identity()
        # TODO: is it a waste to query the user here?
        user = User.query.get(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        calculator = GoalProgressCalculator()
        logger.debug("Using calculator to calculate monthly goals")
        monthly_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.MONTHLY
        )

        if len(monthly_goals) == 0:
            logger.info("No monthly goals found")
            return jsonify([]), 200

        return jsonify(monthly_goals), 200
    except Exception as e:
        logger.error("An error occurred while fetching monthly goals")
        return jsonify({"error": "An error occured while fetching monthly goals"}), 500


@goals_bp.route("/week-completed-count", methods=["GET"])
@jwt_required()
def get_num_goals_completed_weekly():
    try:
        user_id = get_jwt_identity()

        start_of_week = get_most_recent_monday()
        end_of_week = start_of_week + timedelta(days=6)
        num_completed = UserGoal.query.filter(
            UserGoal.user_id == user_id,
            UserGoal.date_completed.between(start_of_week, end_of_week),
        ).count()
        return jsonify(num_completed), 200
    except Exception as e:
        logger.error(
            "An error occurred while fetching the number of goals completed this week"
        )
        return (
            jsonify(
                {
                    "error": "An error occurred while fetching the number of goals completed this week"
                }
            ),
            500,
        )
