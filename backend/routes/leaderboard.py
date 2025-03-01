from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta, timezone
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


@leaderboard_bp.route("/show-preference", methods=["GET"])
@jwt_required()
def get_leaderboard_show():
    try:
        # get user id from jwt token
        user_id = get_jwt_identity()
        # get user streak, number of modules completed, number of goals completed
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.leaderboard_on), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching leaderboard setting: {str(e)}")
        return (
            jsonify({"error": "An error occurred while fetching leaderboard setting"}),
            500,
        )


@leaderboard_bp.route("/show-preference", methods=["PUT"])
@jwt_required()
def update_leaderboard_show():
    try:
        # get user id from jwt token
        user_id = get_jwt_identity()
        # get user streak, number of modules completed, number of goals completed
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        new_preference = data.get("leaderboard_on")
        if new_preference is None:
            return jsonify({"error": "Invalid input"}), 400

        # update the user's leaderboard preference
        user.leaderboard_on = new_preference
        db.session.commit()

        return jsonify(user.leaderboard_on), 200
    except Exception as e:
        logger.error(f"An error occurred while updating leaderboard setting: {str(e)}")
        return (
            jsonify({"error": "An error occurred while updating leaderboard setting"}),
            500,
        )


@leaderboard_bp.route("/weekly-rankings", methods=["GET"])
@jwt_required()
def get_weekly_rankings():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        if not current_user:
            return jsonify({"error": "User not found"}), 404

        # Calculate the date of the most recent Monday
        # TODO: would be best to adjust these dates + times to the user's time zone
        most_recent_monday = get_most_recent_monday()
        is_reward_due = False
        reward_amount = 0
        # Check if user should get rewards (only once per week)
        if (
            current_user.last_leaderboard_reward_date is None
            or current_user.last_leaderboard_reward_date < most_recent_monday
        ):
            is_reward_due, reward_amount = check_and_award_user(
                current_user, most_recent_monday
            )

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
        return (
            jsonify(
                {
                    "users": users_data,
                    "rewardDue": is_reward_due,
                    "rewardAmount": reward_amount,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"An error occurred while fetching weekly rankings: {str(e)}")
        return (
            jsonify({"error": "An error occurred while fetching weekly rankings"}),
            500,
        )


def check_and_award_user(user, week_start_date):
    try:
        # Get previous week's Monday
        previous_week_monday = week_start_date - timedelta(days=7)

        # Get top 5 users from the previous week
        top_users = (
            db.session.query(User.id)
            .join(DailyUserActivity, User.id == DailyUserActivity.user_id)
            .filter(DailyUserActivity.date >= previous_week_monday)
            .filter(DailyUserActivity.date < week_start_date)
            .group_by(User.id)
            .order_by(db.func.sum(DailyUserActivity.xp_earned).desc())
            .limit(5)
            .all()
        )
        # Extract just the IDs
        top_user_ids = [user_id for (user_id,) in top_users]

        # Check if current user is in top 5
        if user.id in top_user_ids:
            # Award gems based on position
            position = top_user_ids.index(user.id)
            gems_award = [15, 10, 10, 5, 5][position]  # Award based on position

            user.gems += gems_award
            today = datetime.now(timezone.utc).date()
            user.last_leaderboard_reward_date = today

            # add gems to user DailyActivity record
            # TODO: this would be a great util to extract
            today_activity = DailyUserActivity.query.filter_by(
                user_id=user.id, date=today
            ).first()

            if today_activity is None:
                logger.error("Daily user activity not found")
                return False, 0

            if today_activity.gems_earned is None:
                today_activity.gems_earned = 0
                logger.debug(f"today activity gems was None, set to 0")

            today_activity.gems_earned += gems_award
            db.session.commit()

            logger.info(
                f"User {user.id} awarded {gems_award} gems for rank {position+1} in previous week"
            )
            return True, gems_award
        else:
            return False, 0
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error checking and awarding user: {str(e)}")
        return False, 0  # TODO: not sure if I want to return False either way


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
