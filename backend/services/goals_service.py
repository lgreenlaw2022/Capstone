from datetime import datetime, timedelta, timezone, date
import logging
import random
from utils import get_most_recent_monday
from enums import MetricType, TimePeriodType
from typing import Dict, List, Tuple
from models import db, DailyUserActivity, Goal, UserGoal, User
from sqlalchemy import func

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


# TODO: add badge check?
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
        goals = (
            UserGoal.query.join(Goal)
            .filter(UserGoal.user_id == user_id)
            .filter(Goal.time_period == time_period)
        )

        # ensure the goals evaluated are for the right date
        if time_period == TimePeriodType.DAILY:
            current_date = datetime.now(timezone.utc).date()
            goals = goals.filter(UserGoal.date_assigned == current_date)

        active_goals = goals.all()

        # calculate progress for each goal
        progress_results = []
        for user_goal in active_goals:
            logger.debug(
                f"Calculating progress for goal: {user_goal.goal.title}, on {user_goal.date_assigned}"
            )
            progress = self._calculate_single_goal_progress(user_goal)
            if progress["is_newly_completed"]:  # TODO: do I want to keep this value?
                self._mark_goal_completed(user_goal)
                logger.info(f"Goal newly completed: {progress['title']}")
            progress_results.append(progress)

        return progress_results

    def _calculate_single_goal_progress(self, user_goal: UserGoal) -> Dict:
        """Calculate progress for a single goal."""
        goal = user_goal.goal
        calculator = self.metric_calculators.get(goal.metric)
        if not calculator:
            logger.error(f"No calculator found for metric: {goal.metric}")
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

        is_newly_completed = progress_percentage >= 100 and not user_goal.date_completed

        return {
            "goalId": goal.id,
            "title": goal.title,
            "currentValue": current_value,
            "targetValue": target_value,
            "progressPercentage": progress_percentage,  # TODO: decide which fields should be kept for the frontend
            "time_period": goal.time_period.value,
            "completed": progress_percentage >= 100,
            "is_newly_completed": is_newly_completed,
        }

    def _calculate_modules_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        total_modules_completed = (
            DailyUserActivity.query.with_entities(
                func.sum(DailyUserActivity.modules_completed)
            )
            .filter(DailyUserActivity.user_id == user_id)
            .filter(DailyUserActivity.date >= start_date)
            .scalar()
            or 0
        )
        return total_modules_completed, target

    def _calculate_gems_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        total_gems_earned = (
            DailyUserActivity.query.with_entities(
                func.sum(DailyUserActivity.gems_earned)
            )
            .filter(DailyUserActivity.user_id == user_id)
            .filter(DailyUserActivity.date >= start_date)
            .scalar()
            or 0
        )
        return total_gems_earned, target

    def _calculate_streak_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        """Calculate the number of days a user has extended their streak."""
        streak_days = (
            DailyUserActivity.query.with_entities(func.count(DailyUserActivity.date))
            .filter(DailyUserActivity.user_id == user_id)
            .filter(DailyUserActivity.date >= start_date)
            .filter(DailyUserActivity.streak_extended.is_(True))
            .scalar()
            or 0
        )
        return streak_days, target

    def _get_time_period_start(
        self, assigned_date: date, time_period: TimePeriodType
    ) -> date:
        """Calculate the start of the current time period."""
        if time_period == TimePeriodType.DAILY:
            return assigned_date
        elif time_period == TimePeriodType.WEEKLY:
            return get_most_recent_monday(assigned_date)
        elif time_period == TimePeriodType.MONTHLY:
            return assigned_date.replace(day=1)
        return assigned_date

    def _get_time_period_end(
        self, start_date: date, time_period: TimePeriodType
    ) -> date:
        """Calculate the end of the current time period."""
        if time_period == TimePeriodType.DAILY:
            return start_date + timedelta(days=1)
        elif time_period == TimePeriodType.WEEKLY:
            # Calculate the number of days until the next Sunday
            days_until_sunday = 6 - start_date.weekday()
            return start_date + timedelta(days=days_until_sunday)
        elif time_period == TimePeriodType.MONTHLY:
            # Calculate the last day of the month
            next_month = start_date.replace(day=28) + timedelta(days=4)
            return next_month - timedelta(days=next_month.day)
        return None

    def _mark_goal_completed(self, user_goal: UserGoal) -> None:
        """Mark a goal as completed if it hasn't been already."""
        if not user_goal.date_completed:
            user_goal.date_completed = datetime.now(timezone.utc).date()
            db.session.commit()


class GoalService:
    def __init__(self):
        pass

    def populate_daily_goals(self, user_id: int):
        today = datetime.now(timezone.utc).date()
        # assign 3 random daily goals to the user
        total_daily_goals = Goal.query.filter_by(
            time_period=TimePeriodType.DAILY
        ).count()

        selected_goals = []
        selected_metrics = set()
        while len(selected_goals) < 3:
            random_index = random.randint(0, total_daily_goals - 1)
            goal = (
                Goal.query.filter_by(time_period=TimePeriodType.DAILY)
                .offset(random_index)
                .limit(1)
                .one()
            )
            if goal.metric not in selected_metrics:
                selected_goals.append(goal)
                selected_metrics.add(goal.metric)

        user_goals = [
            UserGoal(user_id=user_id, goal_id=goal.id, date_assigned=today)
            for goal in selected_goals
        ]
        db.session.bulk_save_objects(user_goals)
        db.session.commit()

    def populate_monthly_goals(self, user_id: int):
        first_of_month = datetime.now(timezone.utc).date().replace(day=1)
        # assign 3 random monthly goals to the user
        total_monthly_goals = Goal.query.filter_by(
            time_period=TimePeriodType.MONTHLY
        ).count()

        selected_goals = []
        selected_metrics = set()
        while len(selected_goals) < 3:
            random_index = random.randint(0, total_monthly_goals - 1)
            goal = (
                Goal.query.filter_by(time_period=TimePeriodType.MONTHLY)
                .offset(random_index)
                .limit(1)
                .one()
            )
            if goal.metric not in selected_metrics:
                selected_goals.append(goal)
                selected_metrics.add(goal.metric)

        user_goals = [
            UserGoal(user_id=user_id, goal_id=goal.id, date_assigned=first_of_month)
            for goal in selected_goals
        ]
        db.session.bulk_save_objects(user_goals)
        db.session.commit()

    def check_and_populate_goals(self, user_id: int):
        today = datetime.now(timezone.utc).date()
        first_of_month = today.replace(day=1)

        # Check and populate daily goals
        if not UserGoal.query.filter_by(user_id=user_id, date_assigned=today).first():
            self.populate_daily_goals(user_id)

        # Check and populate monthly goals
        if not UserGoal.query.filter_by(
            user_id=user_id, date_assigned=first_of_month
        ).first():
            self.populate_monthly_goals(user_id)

        logger.info("New goals populated successfully")

    def initialize_user_goals(self, user_id: int):
        # Used when signs up for the first time to account for sign up date
        # being after the first of the month
        self.populate_daily_goals(user_id)
        self.populate_monthly_goals(user_id)

    @staticmethod
    def add_personalized_goal(user_id, time_period, type, requirement):
        # TODO: is this user validation necessary?
        user = User.query.get(user_id)
        if user is None:
            logger.error("User not found")
            return {"error": "User not found"}, 404

        if not GoalService._is_goal_req_in_range(type, time_period, requirement):
            return {"error": "Invalid goal requirement"}, 400

        goal = Goal.query.filter_by(
            time_period=time_period, metric=type, requirement=requirement
        ).first()
        # Create the goal for general db if it doesn't exist
        if goal is None:
            title = GoalService._create_goal_title(type, requirement)
            goal = Goal(
                title=title,
                time_period=time_period,
                metric=type,
                requirement=requirement,
            )
            db.session.add(goal)
            db.session.commit()

        # Check if the user already has this goal assigned
        date_assigned = GoalProgressCalculator()._get_time_period_start(
            datetime.now(timezone.utc).date(), time_period
        )
        user_goal = UserGoal.query.filter_by(
            user_id=user_id, goal_id=goal.id, date_assigned=date_assigned
        ).first()
        if user_goal:
            logger.info("Goal already assigned")
            return {"message": "Goal already assigned"}, 200

        # Remove an existing goal for this period if the user has more than 3
        existing_user_goals = (
            db.session.query(UserGoal)
            .join(Goal, UserGoal.goal_id == Goal.id)
            .filter(
                UserGoal.user_id == user_id,
                Goal.time_period == time_period,
                UserGoal.date_assigned == date_assigned,
            )
            .all()
        )
        if len(existing_user_goals) >= 3:
            # Remove the goal with the same metric type if it exists
            # TODO: second case for which should be removed?
            goal_to_remove = next(
                (
                    old_goal
                    for old_goal in existing_user_goals
                    if old_goal.goal.metric == goal.metric
                ),
                None,
            )
            if goal_to_remove is None:
                goal_to_remove = existing_user_goals[0]
            db.session.delete(goal_to_remove)
            db.session.commit()

        # Assign the goal to the user
        user_goal = UserGoal(
            user_id=user_id,
            goal_id=goal.id,
            date_assigned=date_assigned,
        )
        db.session.add(user_goal)
        db.session.commit()

        logger.info("Personalized goal added successfully")
        return {"message": "Personalized goal added successfully"}, 200

    @staticmethod
    def _create_goal_title(type, requirement):
        if type == MetricType.COMPLETE_MODULES:
            return f"Complete {requirement} modules"
        if type == MetricType.EARN_GEMS:
            return f"Earn {requirement} gems"
        if type == MetricType.EXTEND_STREAK:
            if requirement == 1:
                return "Extend your streak by 1 day"
            else:
                return f"Practice on {requirement} days"
        return None

    @staticmethod
    def _is_goal_req_in_range(type, time_period, requirement):
        if time_period == TimePeriodType.DAILY:
            if type == MetricType.COMPLETE_MODULES:
                return 1 <= requirement <= 20
            elif type == MetricType.EARN_GEMS:
                return 5 <= requirement <= 30
            elif type == MetricType.EXTEND_STREAK:
                return requirement == 1
        elif time_period == TimePeriodType.MONTHLY:
            if type == MetricType.COMPLETE_MODULES:
                return 20 <= requirement <= 50
            elif type == MetricType.EARN_GEMS:
                return 30 <= requirement <= 100
            elif type == MetricType.EXTEND_STREAK:
                return 2 <= requirement <= 30
        return False
