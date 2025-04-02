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


class GoalProgressCalculator:
    """
    Service for calculating progress for user goals.

    Methods:
        __init__() -> None
            Initializes the service and sets up goal metric calculators.

        calculate_user_goals_progress(user_id: int, time_period: TimePeriodType) -> List[Dict]
            Calculates user progress for all active goals filtered by time period.

        _calculate_single_goal_progress(user_goal: UserGoal) -> Dict
            Calculates progress for a single goal.

        _calculate_modules_progress(user_id: int, start_date: date, target: int) -> Tuple[int, int]
            Calculates progress for module completion goals.

        _calculate_gems_progress(user_id: int, start_date: date, target: int) -> Tuple[int, int]
            Calculates progress for gem earning goals.

        _calculate_streak_progress(user_id: int, start_date: date, target: int) -> Tuple[int, int]
            Calculates progress for days practiced goals.

        _get_time_period_start(assigned_date: date, time_period: TimePeriodType) -> date
            Calculates the start of the current time period.

        _get_time_period_end(start_date: date, time_period: TimePeriodType) -> date
            Calculates the end of the current time period.

        _mark_goal_completed(user_goal: UserGoal) -> None
            Marks a goal as completed if it hasn't been already.
    """

    def __init__(self):
        """
        Initialize the GoalProgressCalculator.
        """
        self.metric_calculators = {
            MetricType.COMPLETE_MODULES: self._calculate_modules_progress,
            MetricType.EARN_GEMS: self._calculate_gems_progress,
            MetricType.EXTEND_STREAK: self._calculate_streak_progress,
        }

    def calculate_user_goals_progress(
        self, user_id: int, time_period: TimePeriodType
    ) -> List[Dict]:
        """
        Calculate progress for goals filtered by time period.

        Args:
            user_id (int): The ID of the user.
            time_period (TimePeriodType): The time period type for the goals.

        Returns:
            List[Dict]: A list of dictionaries containing progress information for each goal.
        """

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
        elif time_period == TimePeriodType.MONTHLY:
            current_date = datetime.now(timezone.utc).date().replace(day=1)
            goals = goals.filter(UserGoal.date_assigned == current_date)

        active_goals = goals.all()

        # calculate progress for each goal
        progress_results = []
        for user_goal in active_goals:
            progress = self._calculate_single_goal_progress(user_goal)
            if progress["is_newly_completed"]:
                self._mark_goal_completed(user_goal)
                logger.info(f"Goal newly completed: {progress['title']}")
            progress_results.append(progress)

        return progress_results

    def _calculate_single_goal_progress(self, user_goal: UserGoal) -> Dict:
        """
        Calculate progress for a single goal.

        Args:
            user_goal (UserGoal): The user goal to calculate progress for.

        Returns:
            Dict: A dictionary containing progress information for the goal.
        """
        goal = user_goal.goal
        # get the specific calculator for the goal metric
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
            "progressPercentage": progress_percentage,
            "time_period": goal.time_period.value,
            "completed": progress_percentage >= 100,
            "is_newly_completed": is_newly_completed,
        }

    def _calculate_modules_progress(
        self, user_id: int, start_date: date, target: int
    ) -> Tuple[int, int]:
        """
        Calculate progress for module completion goals.

        Args:
            user_id (int): The ID of the user.
            start_date (date): The start date for the calculation.
            target (int): The target number of modules to complete.

        Returns:
            Tuple[int, int]: The current value and target value for the goal.
        """
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
        """
        Calculate progress for gem earning goals.

        Args:
            user_id (int): The ID of the user.
            start_date (date): The start date for the calculation.
            target (int): The target number of gems to earn.

        Returns:
            Tuple[int, int]: The current value and target value for the goal.
        """
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
        """
        Calculate the number of days a user has extended their streak.

        Args:
            user_id (int): The ID of the user.
            start_date (date): The start date for the calculation.
            target (int): The target number of days to extend the streak.

        Returns:
            Tuple[int, int]: The current value and target value for the goal.
        """
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
        """
        Calculate the start of the current time period.

        Args:
            assigned_date (date): The date the goal was assigned.
            time_period (TimePeriodType): The time period type for the goal.

        Returns:
            date: The start date of the time period.
        """
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
        """
        Calculate the end of the current time period.

        Args:
            start_date (date): The start date of the time period.
            time_period (TimePeriodType): The time period type for the goal.

        Returns:
            date: The end date of the time period.
        """
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
        """
        Mark a goal as completed if it hasn't been already.

        Args:
            user_goal (UserGoal): The user goal to mark as completed.
        """
        if not user_goal.date_completed:
            user_goal.date_completed = datetime.now(timezone.utc).date()
            db.session.commit()


class GoalService:
    """
    Service for managing user goals, including populating daily and monthly goals
    and adding personalized goals.

    Methods:
        __init__() -> None
            Initializes the service.

        populate_daily_goals(user_id: int) -> None
            Assigns 3 daily goals to the user.

        populate_monthly_goals(user_id: int) -> None
            Assigns 3 monthly goals to the user.

        check_and_populate_goals(user_id: int) -> None
            Populates daily and monthly goals for the user if needed.

        initialize_user_goals(user_id: int) -> None
            Initializes daily and monthly goals for a new user.

        add_personalized_goal(user_id: int, time_period: TimePeriodType, type: MetricType, requirement: int) -> Tuple[Dict[str, str], int]
            Adds a personalized goal for the user.

        _create_goal_title(type: MetricType, requirement: int) -> str
            Creates a title for the goal based on its type and requirement.

        _is_goal_req_in_range(type: MetricType, time_period: TimePeriodType, requirement: int) -> bool
            Checks if the goal requirement is within the valid range.
    """

    def __init__(self):
        pass

    def populate_daily_goals(self, user_id: int) -> None:
        """
        Assign 3 daily goals to the user.

        Args:
            user_id (int): The ID of the user.
        """
        today = datetime.now(timezone.utc).date()
        total_daily_goals = Goal.query.filter_by(
            time_period=TimePeriodType.DAILY
        ).count()

        selected_goals = []
        selected_metrics = set()
        # assign 3 random daily goals to the user
        while len(selected_goals) < 3:
            random_index = random.randint(0, total_daily_goals - 1)
            goal = (
                Goal.query.filter_by(time_period=TimePeriodType.DAILY)
                .offset(random_index)
                .limit(1)
                .one()
            )
            # only add one goal per metric type
            if goal.metric not in selected_metrics:
                selected_goals.append(goal)
                selected_metrics.add(goal.metric)

        # assign the selected goals to the user
        user_goals = [
            UserGoal(user_id=user_id, goal_id=goal.id, date_assigned=today)
            for goal in selected_goals
        ]
        db.session.bulk_save_objects(user_goals)
        db.session.commit()

    def populate_monthly_goals(self, user_id: int) -> None:
        """
        Assign 3 monthly goals to the user.

        Args:
            user_id (int): The ID of the user.
        """
        first_of_month = datetime.now(timezone.utc).date().replace(day=1)
        total_monthly_goals = Goal.query.filter_by(
            time_period=TimePeriodType.MONTHLY
        ).count()

        selected_goals = []
        selected_metrics = set()
        # assign 3 random monthly goals to the user
        while len(selected_goals) < 3:
            random_index = random.randint(0, total_monthly_goals - 1)
            goal = (
                Goal.query.filter_by(time_period=TimePeriodType.MONTHLY)
                .offset(random_index)
                .limit(1)
                .one()
            )
            # only add one goal per metric type
            if goal.metric not in selected_metrics:
                selected_goals.append(goal)
                selected_metrics.add(goal.metric)

        # assign the selected goals to the user
        user_goals = [
            UserGoal(user_id=user_id, goal_id=goal.id, date_assigned=first_of_month)
            for goal in selected_goals
        ]
        db.session.bulk_save_objects(user_goals)
        db.session.commit()

    def check_and_populate_goals(self, user_id: int) -> None:
        """
        Checks if there are existing goals and if necessary, populates
        the daily and monthly goals for the user.

        Args:
            user_id (int): The ID of the user.
        """
        today = datetime.now(timezone.utc).date()
        first_of_month = today.replace(day=1)

        # populate daily goals if not already assigned
        if not UserGoal.query.filter_by(user_id=user_id, date_assigned=today).first():
            self.populate_daily_goals(user_id)

        # populate monthly goals if not already assigned
        if not UserGoal.query.filter_by(
            user_id=user_id, date_assigned=first_of_month
        ).first():
            self.populate_monthly_goals(user_id)

        logger.info("Goals populated successfully")

    def initialize_user_goals(self, user_id: int) -> None:
        """
        Initialize daily and monthly goals for a new user.
        Used when a user logs in for the first time.

        Args:
            user_id (int): The ID of the user.
        """
        self.populate_daily_goals(user_id)
        self.populate_monthly_goals(user_id)

    def add_personalized_goal(
        self,
        user_id: int,
        time_period: TimePeriodType,
        type: MetricType,
        requirement: int,
    ) -> Tuple[Dict[str, str], int]:
        """
        Add a user's personalized goal.

        Args:
            user_id (int): The ID of the user.
            time_period (TimePeriodType): The time period type for the goal.
            type (MetricType): The metric type of the goal.
            requirement (int): The requirement for the goal.

        Returns:
            Tuple[Dict[str, str], int]: A message indicating the result and the HTTP status code.
        """
        user = User.query.get(user_id)
        if user is None:
            logger.error("User not found")
            return {"error": "User not found"}, 404

        # check the goal requirements are valid
        if not self._is_goal_req_in_range(type, time_period, requirement):
            return {"error": "Invalid goal requirement"}, 400

        goal = Goal.query.filter_by(
            time_period=time_period, metric=type, requirement=requirement
        ).first()
        # Create the goal for general db if it doesn't exist
        if goal is None:
            title = self._create_goal_title(type, requirement)
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
            goal_to_remove = next(
                (
                    old_goal
                    for old_goal in existing_user_goals
                    if old_goal.goal.metric == goal.metric
                ),
                None,
            )
            # fallback to the first goal if no goal with the same metric type
            if goal_to_remove is None:
                goal_to_remove = existing_user_goals[0]
            db.session.delete(goal_to_remove)
            db.session.commit()

        # Assign the new custom goal to the user
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
    def _create_goal_title(type: MetricType, requirement: int) -> str:
        """
        Create a title for the goal based on its type and requirement.

        Args:
            type (MetricType): The metric type of the goal.
            requirement (int): The requirement for the goal.

        Returns:
            str: The title of the goal.
        """
        if type == MetricType.COMPLETE_MODULES:
            return f"Complete {requirement} modules"
        if type == MetricType.EARN_GEMS:
            return f"Earn {requirement} gems"
        if type == MetricType.EXTEND_STREAK:
            if requirement == 1:
                return "Extend your streak by 1 day"
            return f"Practice on {requirement} days"

    @staticmethod
    def _is_goal_req_in_range(
        type: MetricType, time_period: TimePeriodType, requirement: int
    ) -> bool:
        """
        Check if the goal requirement is within the valid range.

        Args:
            type (MetricType): The metric type of the goal.
            time_period (TimePeriodType): The time period type for the goal.
            requirement (int): The requirement for the goal.

        Returns:
            bool: True if the requirement is within the valid range, False otherwise.
        """
        if time_period == TimePeriodType.DAILY:
            if type == MetricType.COMPLETE_MODULES:
                return 1 <= requirement <= 20
            if type == MetricType.EARN_GEMS:
                return 5 <= requirement <= 30
            if type == MetricType.EXTEND_STREAK:
                return requirement == 1
        if time_period == TimePeriodType.MONTHLY:
            if type == MetricType.COMPLETE_MODULES:
                return 15 <= requirement <= 50
            if type == MetricType.EARN_GEMS:
                return 30 <= requirement <= 100
            if type == MetricType.EXTEND_STREAK:
                return 5 <= requirement <= 30
        return False
