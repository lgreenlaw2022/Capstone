from flask import Blueprint, jsonify, send_file, abort
import logging
from models import db, Unit, Course, Module
from flask_jwt_extended import jwt_required
import os

content_bp = Blueprint("content", __name__)

# Configure the logger
logging.basicConfig(level=logging.DEBUG)

@content_bp.route("/courses/<int:course_id>/units", methods=["GET"])
@jwt_required()
def get_units_in_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404

    units = Unit.query.filter_by(course_id=course_id).order_by(Unit.order).all()
    units_data = [{"id": unit.id, "title": unit.title} for unit in units]

    return jsonify(units_data), 200


@content_bp.route("/modules/<int:module_id>", methods=["GET"])
def get_module_content(module_id):
    try:
        # Get the file path using the module_id
        file_path = get_content_file_path(module_id)
    except ValueError as e:
        return abort(404, description=str(e))

    # Check if the file exists
    if not os.path.exists(file_path):
        return abort(404, description="Content not found")

    # Serve the HTML file
    return send_file(file_path, mimetype="text/html")   


def transform_title(title: str) -> str:
    # Replace spaces with hyphens and convert to lowercase
    return title.replace(" ", "-").lower()


def get_content_file_path(module_id: int) -> str:
    # Query the database for the module title using the module_id
    module = Module.query.get(module_id)
    if not module:
        raise ValueError("Module not found")

    # Transform the title
    transformed_title = transform_title(module.title)

    # Define the path to the HTML files
    base_path = os.path.join(os.getcwd(), "content", "concept-guides")
    # Construct the file path using the transformed title
    file_path = os.path.join(base_path, f"{transformed_title}.html")
    logging.debug(f"File path: {file_path}")

    return file_path