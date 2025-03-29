from services.goals_service import GoalProgressCalculator, GoalService
from utils import get_most_recent_monday
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta, timezone
from enums import TimePeriodType, MetricType
from constants import GEMS_FOR_COMPLETING_GOAL, GEMS_FOR_WEEKLY_COMPLETION_QUOTA

from models import DailyUserActivity, db, User, Goal, UserGoal

goals_bp = Blueprint("goals", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@goals_bp.route("/daily", methods=["GET"])
@jwt_required()
def get_daily_goals():
    try:
        user_id = get_jwt_identity()

        # get list of daily goals with progress details for user
        calculator = GoalProgressCalculator()
        daily_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.DAILY
        )

        if len(daily_goals) == 0:
            logger.error("No daily goals found")
            return jsonify({"error": "No daily goals found."}), 404

        newly_completed_goals = get_newly_completed_goals(daily_goals)

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
        logger.exception(f"An error occurred while fetching daily goals, {str(e)}")
        return jsonify({"error": "An error occurred while fetching daily goals"}), 500


@goals_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly_goals():
    try:
        user_id = get_jwt_identity()

        calculator = GoalProgressCalculator()
        weekly_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.WEEKLY
        )

        newly_completed_goals = get_newly_completed_goals(weekly_goals)

        if len(weekly_goals) == 0:
            logger.error("No weekly goals found")
            return jsonify({"error": "No weekly goals found."}), 404

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
        logger.exception(f"An error occurred while fetching weekly goals, {str(e)}")
        return jsonify({"error": "An error occurred while fetching weekly goals"}), 500


@goals_bp.route("/monthly", methods=["GET"])
@jwt_required()
def get_monthly_goals():
    try:
        user_id = get_jwt_identity()

        # get list of monthly goals with progress details for user
        calculator = GoalProgressCalculator()
        monthly_goals = calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.MONTHLY
        )

        newly_completed_goals = get_newly_completed_goals(monthly_goals)

        if len(monthly_goals) == 0:
            logger.error("No monthly goals found")
            return jsonify({"error": "No monthly goals found."}), 404

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
        logger.exception(f"An error occurred while fetching monthly goals, {str(e)}")
        return jsonify({"error": "An error occurred while fetching monthly goals"}), 500


def get_newly_completed_goals(goals):
    """
    Return a list of goals that have been completed for the first time.
    """
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

        logger.info(f"Number of goals completed this week: {num_completed}")
        return jsonify(num_completed), 200
    except Exception as e:
        logger.error(
            f"An error occurred while fetching the number of goals completed this week, {str(e)}"
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
        user = User.query.get(user_id)
        if user is None:
            logger.error("User not found")
            return jsonify({"error": "User not found"}), 404
        user_goal = UserGoal.query.filter_by(user_id=user_id, goal_id=goal_id).first()
        if user_goal is None:
            logger.error("User goal not found")
            return jsonify({"error": "User goal not found"}), 404

        # TODO: use different amount for daily vs. monthly goals?
        user.gems += GEMS_FOR_COMPLETING_GOAL

        # add gems to user DailyActivity record
        today = datetime.now(timezone.utc).date()
        today_activity = DailyUserActivity.query.filter_by(
            user_id=user_id, date=today
        ).first()

        if today_activity is None:
            today_activity = DailyUserActivity(user_id=user_id, date=today)
            db.session.add(today_activity)

        today_activity.gems_earned += GEMS_FOR_COMPLETING_GOAL

        db.session.commit()

        logger.info("Gems for goal added successfully")
        return jsonify({"message": "Gems added successfully"}), 200
    except Exception as e:
        logger.exception(f"An error occurred while finishing a goal, {str(e)}")
        return jsonify({"error": "An error occurred while finishing a goal"}), 500


@goals_bp.route("/add-personal", methods=["POST"])
@jwt_required()
def add_personalized_goal():
    try:
        user_id = get_jwt_identity()

        # get new goal parameters from request
        data = request.get_json()
        if data is None:
            return jsonify({"error": "No data provided"}), 400
        time_period = data.get("timePeriod")
        goal_type = data.get("measure")
        goal_value = data.get("goalValue")

        if time_period is None or goal_type is None or goal_value is None:
            return jsonify({"error": "Missing required data"}), 400

        try:
            time_period = TimePeriodType[time_period.upper()]
            goal_type = MetricType[goal_type.upper()]
        except KeyError:
            return jsonify({"error": f"Invalid data: {str(e)}"}), 400

        # GoalService handles creating the goal and assigning it to the user
        response, status_code = GoalService.add_personalized_goal(
            user_id, time_period, goal_type, goal_value
        )
        return jsonify(response), status_code

    except Exception as e:
        logger.exception(
            f"An error occurred while adding a personalized goal, {str(e)}"
        )
        return (
            jsonify({"error": "An error occurred while adding a personalized goal"}),
            500,
        )


@goals_bp.route("/should-allow-personal", methods=["GET"])
def should_show_personal_goal_button():
    try:
        # allow for new goal setting only in the first week of the month
        current_date = datetime.now().date()
        if current_date.day <= 7:
            return jsonify({"showButton": True}), 200

        return jsonify({"showButton": False}), 200

    except Exception as e:
        logger.error(
            f"An error occurred while checking allow personalized goals, {str(e)}"
        )
        return (
            jsonify({"error": "An error occurred while checking allow personal goals"}),
            500,
        )


@goals_bp.route("/reward-weekly-completion-goal", methods=["PUT"])
@jwt_required()
def add_weekly_completion_goal_gems():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user is None:
            logger.error("User not found")
            return jsonify({"error": "User not found"}), 404

        # add gems to user DailyActivity record
        today = datetime.now(timezone.utc).date()
        today_activity = DailyUserActivity.query.filter_by(
            user_id=user_id, date=today
        ).first()

        if today_activity is None:
            today_activity = DailyUserActivity(user_id=user_id, date=today)
            db.session.add(today_activity)

        today_activity.gems_earned += GEMS_FOR_WEEKLY_COMPLETION_QUOTA
        # add gems to user record
        user.gems += GEMS_FOR_WEEKLY_COMPLETION_QUOTA
        db.session.commit()

        logger.info("Gems for weekly quota goal added successfully")
        return jsonify({"message": "Gems added successfully"}), 200
    except Exception as e:
        logger.exception(
            f"An error occurred while rewarding weekly completion goal, {str(e)}"
        )
        return (
            jsonify(
                {"error": "An error occurred while rewarding weekly completion goal"}
            ),
            500,
        )
