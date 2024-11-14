from flask import Blueprint, jsonify
import logging
from models import (
    db,
    Badge,
    UserBadge,
)
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields

badges_bp = Blueprint("badges", __name__)

# Configure the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


# set up schema for serializing the json response
class BadgeSchema(Schema):
    id = fields.Int()
    title = fields.Str()
    description = fields.Str()
    type = fields.Method("get_type")

    def get_type(self, obj):
        return obj.type.value


badge_schema = BadgeSchema(many=True)


# Get the user's badges
@badges_bp.route("/user-badges", methods=["GET"])
@jwt_required()
def get_badges():
    try:
        user_id = get_jwt_identity()
        user_badges = (
            db.session.query(Badge)
            .join(UserBadge)
            .filter(UserBadge.user_id == user_id)
            .all()
        )
        json_badges = badge_schema.dump(user_badges)
        # logger.debug(f"User badges: {json_badges}")
        return jsonify(json_badges), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching user badges: {str(e)}")
        return jsonify({"error": str(e)}), 500
