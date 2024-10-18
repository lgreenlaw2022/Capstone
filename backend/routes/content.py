from flask import Blueprint, jsonify
from models import db, Unit, Course
from flask_jwt_extended import jwt_required

content_bp = Blueprint('content', __name__)

@content_bp.route('/courses/<int:course_id>/units', methods=['GET'])
@jwt_required()
def get_units_in_course(course_id):
    course = Course.query.get(course_id)
    if not course: 
        return jsonify({"error": "Course not found"}), 404

    units = Unit.query.filter_by(course_id=course_id).order_by(Unit.order).all()
    units_data = [{"id": unit.id, "title": unit.title} for unit in units]

    return jsonify(units_data), 200