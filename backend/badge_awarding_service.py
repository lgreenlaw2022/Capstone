from datetime import datetime, timezone
import logging
from models import db, UserBadge, Badge

logger = logging.getLogger(__name__)


class BadgeAwardingService:
    def __init__(self, user_id):
        self.user_id = user_id

    def award_badge(self, badge):
        user_badge = UserBadge(
            user_id=self.user_id,
            badge_id=badge.id,
            date_earned=datetime.now(timezone.utc),
        )
        db.session.add(user_badge)
        db.session.commit()
        logger.info(f"Badge awarded to user {self.user_id}: {badge.title}")

    def check_and_award_badges(self, event_type, **kwargs):
        badges = Badge.query.filter_by(event_type=event_type).all()
        for badge in badges:
            logger.debug("Evaluating badge criteria for badge: %s", badge.title)
            if self.evaluate_criteria(badge.criteria_expression, **kwargs):
                self.award_badge(badge)

    def evaluate_criteria(self, criteria_expression, **kwargs):
        # Evaluate the criteria expression dynamically
        return eval(criteria_expression, {"user": self.user_id, **kwargs})
