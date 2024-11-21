from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta, timezone
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
        user = User.query.get(user_id)
        if user is None:
            return jsonify({"error": "User not found"}), 404

        daily_goals = UserGoal.query.join(Goal).filter(
            UserGoal.user_id == user_id,
            Goal.time_period == TimePeriodType.DAILY,
            UserGoal.date_assigned == datetime.now(timezone.utc).date(),
        ).all()

        if not daily_goals:
            logger.info("No daily goals found")
            return jsonify([]), 200

        daily_goals = [goal.serialize() for goal in daily_goals]
        return jsonify(daily_goals), 200
    except Exception as e:
        logger.error(e)
        return jsonify({"error": "Internal server error"}), 500