from flask import Blueprint, jsonify, send_file, abort
import logging
from models import db, Unit, Course, Module, UserModule, QuizQuestion, QuizQuestionOption
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from sqlalchemy.orm import joinedload

content_bp = Blueprint("content", __name__)

# Configure the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@content_bp.route("/courses/<int:course_id>/units", methods=["GET"])
@jwt_required()
def get_units_in_course(course_id):
    course = Course.query.get(course_id)
    if course is None:
        return jsonify({"error": "Course not found"}), 404

    units = Unit.query.filter_by(course_id=course_id).order_by(Unit.order).all()
    units_data = [{"id": unit.id, "title": unit.title} for unit in units]

    return jsonify(units_data), 200


@content_bp.route("/units/<int:unit_id>/modules", methods=["GET"])
@jwt_required()
def get_modules_in_unit(unit_id):
    user_id = get_jwt_identity()
    modules = Module.query.filter_by(unit_id=unit_id).order_by(Module.order).all()
    if modules is None:
        logger.error(f"No modules found for unit {unit_id}")
        return jsonify({"error": "Modules not found"}), 404

    total_modules = len(modules)
    completed_modules = 0
    modules_data = []
    for module in modules:
        logger.debug(f"Found Module to send: {module.title}")
        user_module = UserModule.query.filter_by(
            user_id=user_id, module_id=module.id
        ).first()
        # ensure the first module is always open and default to closed if not found
        is_open = module.order == 1 or (user_module and user_module.open)
        is_completed = user_module and user_module.completed
        if is_completed:
            completed_modules += 1
        modules_data.append(
            {
                "id": module.id,
                "title": module.title,
                "module_type": module.module_type.value,
                "order": module.order,
                "isOpen": is_open,
            }
        )

    completion_percentage = calculate_completion_percentage(
        total_modules, completed_modules
    )
    response = {"modules": modules_data, "completion_percentage": completion_percentage}
    return (
        jsonify(response),
        200,
    )


def calculate_completion_percentage(total_modules, completed_modules):
    return (completed_modules / total_modules) * 100 if total_modules > 0 else 0


@content_bp.route("/modules/<int:module_id>", methods=["GET"])
@jwt_required()
# TODO: these route names may be confusing
def get_module_content(module_id):
    try:
        # Get the file path using the module_id
        file_path = get_content_file_path(module_id)
    except ValueError as e:
        return abort(404, description=str(e))

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({"error": "Content not found"}), 404

    # Serve the HTML file
    return send_file(file_path, mimetype="text/html")


def transform_title(title: str) -> str:
    # Replace spaces with hyphens and convert to lowercase
    return title.replace(" ", "-").lower()


def get_content_file_path(module_id: int) -> str:
    # Query the database for the module title using the module_id
    module = Module.query.get(module_id)
    if module is None:
        raise ValueError("Module not found")

    # Transform the title
    transformed_title = transform_title(module.title)

    # Define the path to the HTML files
    base_path = os.path.join(os.getcwd(), "content", "concept-guides")
    # Construct the file path using the transformed title
    file_path = os.path.join(base_path, f"{transformed_title}.html")
    logger.debug(f"File path: {file_path}")

    return file_path


@content_bp.route("/modules/<int:module_id>/quiz-questions", methods=["GET"])
def get_quiz_questions(module_id):
    try:
        # Fetch the module and its quiz questions and options using relationships
        module = Module.query.filter_by(id=module_id).first()
        if not module:
            return jsonify({"error": "Module not found"}), 404

        # Use joinedload to eagerly load the related QuizQuestionOption objects
        quiz_questions = QuizQuestion.query.options(joinedload(QuizQuestion.options)).filter_by(module_id=module_id).all()

        # Serialize the data
        quiz_data = []
        for question in quiz_questions:
            question_data = {
                "id": question.id,
                "title": question.title,
                "options": [
                    {
                        "id": option.id,
                        "option_text": option.option_text,
                        "is_correct": option.is_correct,
                    }
                    for option in question.options
                ],
            }
            quiz_data.append(question_data)
        logger.info(f"Quiz questions fetched for module {module_id}: {quiz_data}")
        return jsonify(quiz_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
