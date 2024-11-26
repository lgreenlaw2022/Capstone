from services.goals_service import GoalProgressCalculator
from utils import get_most_recent_monday
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta, timezone
from enums import TimePeriodType
from config.constants import GEMS_FOR_COMPLETING_GOAL

from models import DailyUserActivity, db, User, Goal, UserGoal

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
            return (
                jsonify(
                    {
                        "goals": [],
                        "newly_completed_goals": [],
                    }
                ),
                200,
            )

        newly_completed_goals = get_newly_completed_goals(daily_goals)

        logger.debug(f"backend daily goals newly completed: {newly_completed_goals}")

        return (
            jsonify(
                {
                    "goals": daily_goals,
                    "newly_completed_goals": newly_completed_goals,
                }
            ),
            200,
        )
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
        weekly_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.WEEKLY
        )

        newly_completed_goals = get_newly_completed_goals(weekly_goals)

        if len(weekly_goals) == 0:
            logger.info("No weekly goals found")
            return jsonify([]), 200

        return (
            jsonify(
                {
                    "goals": weekly_goals,
                    "newly_completed_goals": newly_completed_goals,
                }
            ),
            200,
        )
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

        newly_completed_goals = get_newly_completed_goals(monthly_goals)

        if len(monthly_goals) == 0:
            logger.info("No monthly goals found")
            return jsonify([]), 200

        return (
            jsonify(
                {
                    "goals": monthly_goals,
                    "newly_completed_goals": newly_completed_goals,
                }
            ),
            200,
        )
    except Exception as e:
        logger.error("An error occurred while fetching monthly goals")
        return jsonify({"error": "An error occured while fetching monthly goals"}), 500


def get_newly_completed_goals(goals):
    """Return a list of goals that have been completed for the first time."""
    newly_completed_goals = []
    for goal in goals:
        if goal["is_newly_completed"]:
            newly_completed_goals.append(goal)
    return newly_completed_goals


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


@goals_bp.route("/<int:goal_id>/add-gems", methods=["POST"])
@jwt_required()
def add_gems_for_newly_completed_goal(goal_id):
    try:
        user_id = get_jwt_identity()
        # validating the request
        user_goal = UserGoal.query.filter_by(user_id=user_id, goal_id=goal_id).first()
        if user_goal is None:
            logger.error("User goal not found")
            return jsonify({"error": "User goal not found"}), 404
        # TODO: verify this goal hasn't already been awarded?

        # add gems to user
        user = User.query.get(user_id)
        # TODO: use different amount for daily vs. monthly goals?
        user.gems += GEMS_FOR_COMPLETING_GOAL

        # add gems to user DailyActivity record
        today = datetime.now(timezone.utc).date()
        today_activity = DailyUserActivity.query.filter_by(
            user_id=user_id, date=today
        ).first()
        today_activity.gems += GEMS_FOR_COMPLETING_GOAL
        db.session.commit()
        logger.info("Gems for goal added successfully")
        return jsonify({"message": "Gems added successfully"}), 200
    except Exception as e:
        logger.error("An error occurred while finishing a goal")
        return jsonify({"error": "An error occurred while finishing a goal"}), 500
