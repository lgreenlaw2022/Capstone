from datetime import datetime, timedelta, timezone
from models import db, User, DailyUserActivity
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class UserActivityService:
    """
    Service for managing user activity updates, including updating daily XP,
    updating user streaks, and resetting streaks.

    Methods:
        update_daily_xp(user_id: int, xp: int) -> None
            Updates the daily XP for a user.

        _update_user_streak(user: User, streak_already_extended: bool) -> None
            Updates the streak for a user after XP is earned.

        reset_streak(user: User) -> bool
            Resets the streak for a user if no activity is found for today and yesterday.
    """

    def update_daily_xp(self, user_id: int, xp: int) -> None:
        """
        Update the daily XP for a user.

        Args:
            user_id (int): The ID of the user.
            xp (int): The amount of XP to add.
        """
        try:
            current_date = datetime.now(timezone.utc).date()
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User with id {user_id} not found")

            # add the new XP to the user's daily activity record
            activity = DailyUserActivity.query.filter_by(
                user_id=user_id, date=current_date
            ).first()
            if not activity:
                activity = DailyUserActivity(
                    user_id=user_id, date=current_date, xp_earned=xp
                )
                db.session.add(activity)
            else:
                activity.xp_earned += xp

            # update the user's total XP
            if user.xp is None:
                user.xp = 0
            user.xp += xp

            db.session.commit()

            # Update the user's streak if necessary
            self._update_user_streak(user, activity.streak_extended)

        except Exception as e:
            logger.exception(f"An error occurred while updating daily XP: {str(e)}")

    def _update_user_streak(self, user: User, streak_already_extended: bool) -> None:
        """
        Update the streak for a user after XP is earned.

        Args:
            user (User): The user object.
            streak_already_extended (bool): Whether the streak has already been extended today.
        """
        try:
            # Update the user streak if it hasn't already been updated today
            if not streak_already_extended:
                if user.streak is None:
                    user.streak = 0
                user.streak += 1
                # mark streak as updated in activity records
                today = datetime.now(timezone.utc).date()
                daily_activity = DailyUserActivity.query.filter_by(
                    user_id=user.id, date=today
                ).first()
                daily_activity.streak_extended = True
                db.session.commit()
        except Exception as e:
            logger.exception(
                f"An error occurred while updating the user's streak: {str(e)}"
            )

    def reset_streak(self, user: User) -> bool:
        """
        Reset the streak for a user if no activity is found for today and yesterday.
        Used on login to ensure the streak is accurate.

        Args:
            user (User): The user object.

        Returns:
            bool: True if the streak was reset, False otherwise.
        """
        current_date = datetime.now(timezone.utc).date()
        # Check if the user has a streak
        yesterday = current_date - timedelta(days=1)
        yesterday_activity = DailyUserActivity.query.filter_by(
            user_id=user.id, date=yesterday
        ).first()
        today_activity = DailyUserActivity.query.filter_by(
            user_id=user.id, date=current_date
        ).first()
        # Set the streak to 0 if there is no activity for yesterday and today
        if not yesterday_activity and not today_activity:
            user.streak = 0
            db.session.commit()
            return True

        return False
