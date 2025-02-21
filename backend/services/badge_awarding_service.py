from datetime import datetime, timezone
import logging
from models import db, UserBadge, Badge

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class BadgeAwardingService:
    def __init__(self, user_id):
        self.user_id = user_id  # The user to whom the badge is awarded

    def check_and_award_badges(self, event_type, **kwargs):
        # Get all badges for the event type
        badges = Badge.query.filter_by(event_type=event_type).all()
        for badge in badges:
            if self.evaluate_criteria(badge.criteria_expression, event_type=event_type, **kwargs):
                self.award_badge(badge)

    def award_badge(self, badge):
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

    def evaluate_criteria(self, criteria_expression, **kwargs):
        # Create evaluation context with user and all kwargs
        context = {"user": self.user_id}
        context.update(kwargs)
        
        try:
            # Evaluate the criteria in the context
            return eval(criteria_expression, {}, context)
        except Exception as e:
            logger.error(f"Error evaluating criteria '{criteria_expression}': {str(e)}")
            return False
