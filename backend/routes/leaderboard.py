from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timezone
from utils import get_most_recent_monday

from models import User, db, DailyUserActivity, UserModule, UserGoal

leaderboard_bp = Blueprint("leaderboard", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def calculate_percent_shorter_streak(user_streak):
    # calculate the percentage of users who have a shorter streak than the current user
    total_users = User.query.count() - 1  # subtract 1 to exclude the current user
    if total_users < 1:
        return 100.0  # If the user is the only one, they are ahead of 100% of users
    # TODO: consider adding index to streak column
    users_with_shorter_streak = User.query.filter(User.streak < user_streak).count()

    percent_shorter_streak = (users_with_shorter_streak / total_users) * 100
    return percent_shorter_streak


def calculate_percent_fewer_modules(user_id, most_recent_monday):
    # calculate the percentage of users who have completed fewer modules this week than the current user
    total_users = User.query.count() - 1  # subtract 1 to exclude the current user
    if total_users < 1:
        return 100.0  # If the user is the only one, they are ahead of 100% of users
    user_modules_completed = UserModule.query.filter(
        UserModule.user_id == user_id, UserModule.completed_date >= most_recent_monday
    ).count()

    # Include users who have completed fewer modules or none at all
    users_with_fewer_modules = (
        db.session.query(User)
        .outerjoin(
            UserModule,
            (User.id == UserModule.user_id)
            & (UserModule.completed_date >= most_recent_monday),
        )
        .group_by(User.id)
        .having(db.func.count(UserModule.module_id) < user_modules_completed)
        .count()
    )

    percent_fewer_modules = (users_with_fewer_modules / total_users) * 100
    return percent_fewer_modules


def calculate_percent_fewer_goals(user_id, most_recent_monday):
    # calculate the percentage of users who have completed fewer goals this week than the current user
    total_users = User.query.count() - 1  # subtract 1 to exclude the current user
    if total_users < 1:
        return 100.0  # If the user is the only one, they are ahead of 100% of users
    user_goals_completed = UserGoal.query.filter(
        UserGoal.user_id == user_id, UserGoal.date_completed >= most_recent_monday
    ).count()

    # Include users who have completed fewer goals or none at all
    users_with_fewer_goals = (
        db.session.query(User)
        .outerjoin(
            UserGoal,
            (User.id == UserGoal.user_id)
            & (UserGoal.date_completed >= most_recent_monday),
        )
        .group_by(User.id)
        .having(db.func.count(UserGoal.goal_id) < user_goals_completed)
        .count()
    )

    percent_fewer_goals = (users_with_fewer_goals / total_users) * 100
    return percent_fewer_goals


def get_days_until_next_sunday():
    today = datetime.now(timezone.utc).date()
    days_until_sunday = (6 - today.weekday()) % 7
    return days_until_sunday


@leaderboard_bp.route("/days-left", methods=["GET"])
def get_days_left():
    try:
        # Calculate the number of days left in the week
        days_left = get_days_until_next_sunday()
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

        # Query to get users with activity since the most recent Monday and non-zero XP
        # order by xp earned in descending order
        users = (
            db.session.query(
                User.username,
                db.func.sum(DailyUserActivity.xp_earned).label("weekly_xp"),
            )
            .join(DailyUserActivity, User.id == DailyUserActivity.user_id)
            .filter(DailyUserActivity.date >= most_recent_monday)
            .group_by(User.username)
            .order_by(db.func.sum(DailyUserActivity.xp_earned).desc())
            .all()
        )

        # Check if any users were found
        if not users:
            logger.error("No users found")
            return jsonify({"error": "No users found"}), 404
        # serialize the users data
        users_data = [
            {"username": user.username, "weekly_xp": user.weekly_xp} for user in users
        ]
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

        # Calculate the percentages
        percent_shorter_streak = round(calculate_percent_shorter_streak(user.streak))
        percent_fewer_modules = round(
            calculate_percent_fewer_modules(user_id, most_recent_monday)
        )
        percent_fewer_goals = round(
            calculate_percent_fewer_goals(user_id, most_recent_monday)
        )

        logger.debug(
            f"Percent shorter streak: {percent_shorter_streak}, Percent fewer modules: {percent_fewer_modules}, Percent fewer goals: {percent_fewer_goals}"
        )
        response = {
            "percent_shorter_streak": percent_shorter_streak,
            "percent_fewer_modules": percent_fewer_modules,
            "percent_fewer_goals": percent_fewer_goals,
        }

        return jsonify(response), 200
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
