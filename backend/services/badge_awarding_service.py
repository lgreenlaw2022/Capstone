from datetime import datetime, timezone
import logging
from typing import Any
from models import db, UserBadge, Badge

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class BadgeAwardingService:
    """
    Service for awarding badges to users based on specific events and criteria.

    Methods:
        __init__(user_id: int) -> None
            Initializes the service with the user ID.

        check_and_award_badges(event_type: str, **kwargs: Any) -> None
            Checks and awards badges to the user based on the event type and badge criteria.

        award_badge(badge: Badge) -> None
            Awards a badge to the user if they do not already have it.

        evaluate_criteria(criteria_expression: str, **kwargs: Any) -> bool
            Evaluates the criteria expression against the keyword arguments for criteria
            values (kwargs) to determine if the badge should be awarded.
    """

    def __init__(self, user_id):
        """
        Initialize the BadgeAwardingService with the user ID.

        Args:
            user_id (int): The ID of the user to whom the badge is awarded.
        """
        self.user_id = user_id

    def check_and_award_badges(self, event_type: str, **kwargs: Any) -> None:
        """
        Check and award badges to the user based on the event type and criteria.

        Args:
            event_type (str): The event type of the badges to be assessed.
            **kwargs (Any): Additional keyword arguments for evaluating criteria.
        """
        # Get all badges for the event type
        badges = Badge.query.filter_by(event_type=event_type).all()
        for badge in badges:
            if self.evaluate_criteria(
                badge.criteria_expression, event_type=event_type, **kwargs
            ):
                self.award_badge(badge)

    def award_badge(self, badge: Badge) -> None:
        """
        Award a badge to the user if they do not already have it.

        Args:
            badge (Badge): The badge to be awarded.
        """
        # Check if the user already has the badge
        user_badge = UserBadge.query.filter_by(
            user_id=self.user_id, badge_id=badge.id
        ).first()
        if user_badge:
            logger.info(
                f"User {self.user_id} already has the badge: {badge.title}. Skipping award."
            )
            return

        # Award the badge to the user
        user_badge = UserBadge(
            user_id=self.user_id,
            badge_id=badge.id,
            date_earned=datetime.now(timezone.utc),
        )

        db.session.add(user_badge)
        db.session.commit()
        logger.info(f"Badge awarded to user {self.user_id}: {badge.title}")

    def evaluate_criteria(self, criteria_expression: str, **kwargs: Any) -> bool:
        """
        Evaluate the criteria expression to determine if the badge should be awarded.

        Args:
            criteria_expression (str): The criteria expression to be evaluated.
            **kwargs (Any): Keyword argument values to be compared against the badge criteria.

        Returns:
            bool: True if the criteria are met, False otherwise.
        """
        # Create evaluation context with user and all kwargs
        context = {"user": self.user_id}
        context.update(kwargs)

        try:
            # Evaluate the criteria in the context
            return eval(criteria_expression, {}, context)
        except Exception as e:
            logger.error(f"Error evaluating criteria '{criteria_expression}': {str(e)}")
            return False
