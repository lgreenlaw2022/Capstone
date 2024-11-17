from datetime import datetime, timedelta, timezone
from models import db, User, DailyUserActivity
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def update_daily_xp(user_id, xp):
    current_date = datetime.now(timezone.utc).date()
    user = User.query.get(user_id)
    if not user:
        raise ValueError(f"User with id {user_id} not found")

    logger.debug(f"User {user_id} current XP: {user.xp}")

    activity = DailyUserActivity.query.filter_by(
        user_id=user_id, date=current_date
    ).first()
    logger.debug(
        f"Activity for user {user_id} on {current_date}: {activity.xp_earned if activity else None}"
    )
    if not activity:
        logger.debug(f"Creating new activity for user {user_id} on {current_date}")
        activity = DailyUserActivity(user_id=user_id, date=current_date, xp_earned=xp)
        db.session.add(activity)
    else:
        logger.debug(f"Updating activity for user {user_id} on {current_date}")
        activity.xp_earned += xp
    logger.debug(f"Updating total XP for user {user_id}")
    # add None type check??
    user.xp += xp  # Update the user's total XP
    logger.debug(f"Committing xp changes to the database", user.xp)
    db.session.commit()

    # Update the user's streak
    update_user_streak(user)


def update_user_streak(user):
    logger.debug(f"Updating streak for user {user.id}")
    # Check if the user has a streak
    if user.streak == 0:
        user.streak = 1
    else:
        # Assess streak based on the last activity
        if reset_streak(user):
            logger.debug(f"Resetting streak for user {user.id} to 1")
            user.streak = 1
        else:
            logger.debug(f"Incrementing streak for user {user.id}")
            user.streak += 1

    db.session.commit()


def reset_streak(user):
    current_date = datetime.now(timezone.utc).date()
    # Check if the user has a streak
    yesterday = current_date - timedelta(days=1)
    yesterday_activity = DailyUserActivity.query.filter_by(
        user_id=user.id, date=yesterday
    ).first()
    if not yesterday_activity:
        logger.debug(f"No activity found for user {user.id} on {yesterday}")
        user.streak = 0
        db.session.commit()
        return True

    return False
