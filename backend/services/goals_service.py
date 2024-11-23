from datetime import datetime, timedelta, timezone, date
from utils import get_most_recent_monday
from enums import MetricType, TimePeriodType
from typing import Dict, List, Tuple
from models import db, DailyUserActivity, Goal, UserGoal
from sqlalchemy import and_, func # TODO: what is and_?

# TODO: should I rename this file to match closer?
class GoalProgressCalculator:
    def __init__(self):
        self.metric_calculators = {
            MetricType.COMPLETE_MODULES: self._calculate_modules_progress,
            MetricType.EARN_GEMS: self._calculate_gems_progress,
            MetricType.EXTEND_STREAK: self._calculate_streak_progress,
        }

    # TODO: do I want to keep type hints and docstrings?
    def calculate_user_goals_progress(
        self, user_id: int, time_period: TimePeriodType
    ) -> List[Dict]:
        """Calculate progress for goals filtered by time period."""

        # get all active goals for the user
        open_goals = db.query(UserGoal).filter(
            and_(UserGoal.user_id == user_id, UserGoal.date_completed.is_(None))
        )

        query = open_goals.join(Goal).filter(Goal.time_period == time_period)
        active_goals = query.all()

        # calculate progress for each goal
        progress_results = []
        for user_goal in active_goals:
            progress = self._calculate_single_goal_progress(user_goal)
            if progress["is_completed"]:  # TODO: do I want to keep this value?
                self._mark_goal_completed(user_goal)
            progress_results.append(progress)

        return progress_results

    def _calculate_single_goal_progress(self, user_goal: UserGoal) -> Dict:
        """Calculate progress for a single goal."""
        goal = user_goal.goal
        calculator = self.metric_calculators.get(goal.metric)
        if not calculator:
            raise ValueError(f"No calculator found for metric: {goal.metric}")

        time_period_start = self._get_time_period_start(
            user_goal.date_assigned, goal.time_period
        )
        current_value, target_value = calculator(
            user_goal.user_id, time_period_start, goal.requirement
        )

        progress_percentage = min(
            (current_value / target_value * 100) if target_value > 0 else 0, 100
        )

        return {
            "goal_id": goal.id,
            "title": goal.title,
            "current_value": current_value,
            "target_value": target_value,
            "progress_percentage": progress_percentage, # TODO: decide if I want to keep this
            "time_period": goal.time_period.value,
            "is_completed": progress_percentage >= 100, # TODO: decide if I want to keep this
        }

    def _calculate_modules_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        total_modules_completed = (
            db.query(func.sum(DailyUserActivity.modules_completed))
            .filter(
                # NOTE: this relies on there being no goals being added to UserGoals ahead of the current date
                and_(
                    DailyUserActivity.user_id == user_id,
                    DailyUserActivity.date >= start_date,
                )
            )
            .scalar()
            or 0
        )
        return total_modules_completed, target

    def _calculate_gems_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        total_gems_earned = (
            db.query(func.sum(DailyUserActivity.gems_earned))
            .filter(
                and_(
                    DailyUserActivity.user_id == user_id,
                    DailyUserActivity.date >= start_date,
                )
            )
            .scalar()
            or 0
        )
        return total_gems_earned, target

    def _calculate_streak_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        """Calculate the number of days a user has extended their streak."""
        # TODO: this name is confusing because its just measuring days the user completed something, not necessarily "extended" if they broke it within the time period
        streak_days = (
            db.query(func.count(DailyUserActivity.date))
            .filter(
                and_(
                    DailyUserActivity.user_id == user_id,
                    DailyUserActivity.date >= start_date,
                    DailyUserActivity.streak_extended.is_(True),
                )
            )
            .scalar()
            or 0
        )
        return streak_days, target

    def _get_time_period_start(
        self, assigned_date: date, time_period: TimePeriodType
    ) -> date:
        """Calculate the start of the current time period."""
        now = datetime.now(timezone.utc).date()
        if time_period == TimePeriodType.DAILY:
            return now
        elif time_period == TimePeriodType.WEEKLY:
            return get_most_recent_monday(now) # TODO: verify this works
        return assigned_date

    def _get_time_period_end(
        self, start_date: date, time_period: TimePeriodType
    ) -> date:
        """Calculate the end of the current time period."""
        if time_period == TimePeriodType.DAILY:
            return start_date + timedelta(days=1)
        elif time_period == TimePeriodType.WEEKLY:
            # Calculate the number of days until the next Sunday
            days_until_sunday = 6 - start_date.weekday() # TODO: verify this isn't a day off
            return start_date + timedelta(days=days_until_sunday)
        return None

    def _mark_goal_completed(self, user_goal: UserGoal) -> None:
        """Mark a goal as completed if it hasn't been already."""
        if not user_goal.date_completed:
            user_goal.date_completed = datetime.now(timezone.utc)
            db.session.commit()


class GoalService:
    # TODO: why is this necessary? -- why not just call the calculators from the routes directly?
    # TODO: again, why session?
    def __init__(self, db_session: Session):
        self.db = db_session
        self.calculator = GoalProgressCalculator(db_session)

    def get_daily_goals_progress(self, user_id: int) -> Dict:
        """Get daily goals progress for a user."""
        progress_data = self.calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.DAILY
        )

        return {
            "goals": progress_data,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            # TODO: why would I want this?
            "next_refresh": self._get_next_daily_refresh().isoformat(),
        }

    def get_weekly_goals_progress(self, user_id: int) -> Dict:
        """Get weekly goals progress for a user."""
        progress_data = self.calculator.calculate_user_goals_progress(
            user_id, TimePeriodType.WEEKLY
        )

        return {
            "goals": progress_data,
            "last_updated": datetime.now(timezone.utc).isoformat(),
            # TODO: why would I want this?
            "next_refresh": self._get_next_weekly_refresh().isoformat(),
        }

    def _get_next_daily_refresh(self) -> datetime:
        """Get the next time daily goals should refresh."""
        now = datetime.now(timezone.utc)
        tomorrow = now + timedelta(days=1)
        # TODO: again, why not just use the date?
        return tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)

    def _get_next_weekly_refresh(self) -> datetime:
        """Get the next time weekly goals should refresh."""
        now = datetime.now(timezone.utc)
        days_until_next_week = 7 - now.weekday()
        next_week = now + timedelta(days=days_until_next_week)
        # TODO: again, why not just use the date?
        return next_week.replace(hour=0, minute=0, second=0, microsecond=0)
