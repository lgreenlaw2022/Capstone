from datetime import datetime, timedelta
from models import db, User, UserModule, Module, ModuleType, DailyUserActivity
import logging

logger = logging.getLogger(__name__)

def update_daily_xp(user_id, xp):
    current_date = datetime.utcnow().date()
    user = User.query.get(user_id)
    if not user:
        raise ValueError(f"User with id {user_id} not found")

    activity = DailyUserActivity.query.filter_by(user_id=user_id, date=current_date).first()
    if not activity:
        activity = DailyUserActivity(user_id=user_id, date=current_date, xp_earned=xp)
        db.session.add(activity)
    else:
        activity.xp_earned += xp

    # Update the user's streak
    update_user_streak(user)

    db.session.commit()


def update_user_streak(user):
    # Check if the user has a streak
    if user.streak == 0:
        user.streak = 1
    else:
        # Assess streak based on the last activity
        if reset_streak(user):
            user.streak = 1
        else:
            user.streak += 1

    db.session.commit()


def reset_streak(user):
    current_date = datetime.utcnow().date()

    # Check if the user has a streak
    yesterday = current_date - timedelta(days=1)
    yesterday_activity = DailyUserActivity.query.filter_by(user_id=user.id, date=yesterday).first()
    if not yesterday_activity:
        user.streak = 0
        db.session.commit()
        return True

    return False