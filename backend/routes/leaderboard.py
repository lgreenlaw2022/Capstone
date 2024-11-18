from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta, timezone

from models import User, db, DailyUserActivity, UserModule, UserGoal

# TODO: this name may be confusing because the review page also uses content endpoints
leaderboard_bp = Blueprint("leaderboard", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_most_recent_monday():
    today = datetime.now(timezone.utc).date()
    most_recent_monday = today - timedelta(days=today.weekday())
    return most_recent_monday


@leaderboard_bp.route("/days-left", methods=["GET"])
@jwt_required()
def get_days_left():
    try:
        # Calculate the date of the most recent Monday
        most_recent_monday = get_most_recent_monday()
        logger.debug(f"Most recent Monday: {most_recent_monday}")

        # Calculate the number of days left in the week
        days_left = 7 - (datetime.now(timezone.utc).date() - most_recent_monday).days
        logger.debug(f"Days left in the week: {days_left}")

        return jsonify(days_left), 200

    except Exception as e:
        logger.error(f"An error occurred while fetching days left: {str(e)}")
        return jsonify({"error": "An error occurred while fetching days left"}), 500


@leaderboard_bp.route("/weekly-rankings", methods=["GET"])
@jwt_required()
def get_weekly_rankings():
    try:
        # Calculate the date of the most recent Monday
        most_recent_monday = get_most_recent_monday()
        logger.debug(f"Most recent Monday: {most_recent_monday}")

        all_users = User.query.all()
        logger.debug(f"Number of users: {len(all_users)}")
        all_daily_user_activities = DailyUserActivity.query.all()
        logger.debug(
            f"Number of daily user activities: {len(all_daily_user_activities)}"
        )
        # Query to get users with activity since the most recent Monday and non-zero XP
        # order by xp earned in descending order
        users = (
            User.query.with_entities(User.username, User.xp)
            .join(DailyUserActivity, User.id == DailyUserActivity.user_id)
            .filter(DailyUserActivity.date >= most_recent_monday, User.xp > 0)
            .order_by(User.xp.desc())
            .all()
        )

        # Check if any users were found
        if not users:
            logger.error("No users found")
            return jsonify({"error": "No users found"}), 404
        # serialize the users data
        users_data = [{"username": user.username, "xp": user.xp} for user in users]
        logger.debug(f"Users data: {users_data}")
        return jsonify(users_data), 200

    except Exception as e:
        logger.error(f"An error occurred while fetching weekly rankings: {str(e)}")
        return (
            jsonify({"error": "An error occurred while fetching weekly rankings"}),
            500,
        )


@leaderboard_bp.route("/weekly-comparison", methods=["GET"])
@jwt_required()
def get_weekly_comparison_stats():
    try:
        # get user id from jwt token
        user_id = get_jwt_identity()
        # get user streak, number of modules completed, number of goals completed
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        most_recent_monday = get_most_recent_monday()

        streak = user.streak
        modules_completed = UserModule.query.filter(
            UserModule.user_id == user_id,
            UserModule.completed_date <= most_recent_monday,
        ).count()
        goals_completed = UserGoal.query.filter(
            UserGoal.user_id == user_id, UserGoal.completed_date <= most_recent_monday
        ).count()

        # calculate the percent of users with a shorter streak
        # calculate the percent of users with fewer modules completed this week
        # calculate the percent of users with fewer goals completed this week
        return
    except Exception as e:
        logger.error(
            f"An error occurred while fetching weekly comparison stats: {str(e)}"
        )
        return (
            jsonify(
                {"error": "An error occurred while fetching weekly comparison stats"}
            ),
            500,
        )
