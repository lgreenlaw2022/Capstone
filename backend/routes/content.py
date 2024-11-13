from badge_awarding_service import BadgeAwardingService
from enums import EventType, ModuleType
from flask import Blueprint, request, jsonify, send_file, abort
import logging
from models import (
    UserUnit,
    db,
    Unit,
    Course,
    UserUnit,
    Module,
    UserModule,
    QuizQuestion,
)
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
    # Filter out bonus challenges (they are not part of the main unit flow)
    modules = (
        Module.query.filter(
            Module.unit_id == unit_id,
            Module.module_type != ModuleType.BONUS_CHALLENGE,
        )
        .order_by(Module.order)
        .all()
    )
    if modules is None:
        logger.error(f"No modules found for unit {unit_id}")
        return jsonify({"error": "Modules not found"}), 404

    total_modules = len(modules)
    completed_modules = 0
    modules_data = []
    for module in modules:
        user_module = UserModule.query.filter_by(
            user_id=user_id, module_id=module.id
        ).first()
        # ensure the first module is always open and default to closed if not found
        is_open = module.order == 1 or (user_module is not None and user_module.open)
        is_completed = user_module is not None and user_module.completed
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
def get_module_content(module_id):
    try:
        # Get the file path using the module_id
        file_path = get_content_file_path(module_id, "concept-guides")
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


def get_content_file_path(module_id: int, content_type: str) -> str:
    # Query the database for the module title using the module_id
    module = Module.query.get(module_id)
    if module is None:
        raise ValueError("Module not found")

    # Transform the title
    transformed_title = transform_title(module.title)

    # Define the path to the HTML files
    base_path = os.path.join(os.getcwd(), "content", content_type)
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
        quiz_questions = (
            QuizQuestion.query.options(joinedload(QuizQuestion.options))
            .filter_by(module_id=module_id)
            .all()
        )

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

        return jsonify(quiz_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@content_bp.route("/modules/<int:module_id>/quiz-scores", methods=["POST"])
@jwt_required()
def submit_quiz_scores(module_id):
    try:
        data = request.get_json()
        accuracy = data.get("accuracy")
        # Validate accuracy
        if accuracy is None:
            return jsonify({"error": "Accuracy is required"}), 400
        if not (0 <= accuracy <= 100):
            return jsonify({"error": "Accuracy must be between 0 and 100"}), 400
        ACCURACY_THRESHOLD = 80  # TODO Define the threshold for passing as a constant

        # mark module as complete if accuracy is above passing threshold
        if accuracy >= ACCURACY_THRESHOLD:
            user_id = get_jwt_identity()
            mark_module_complete_and_open_next(module_id, user_id)

            # check if the user has earned a badge
            badge_awarding_service = BadgeAwardingService(user_id)
            badge_awarding_service.check_and_award_badges(
                EventType.QUIZ_PERFECT_SCORE, quiz_score=accuracy
            )

            return jsonify({"message": "Submitted quiz complete successfully"}), 200
        else:
            return jsonify({"message": "Quiz score not high enough to pass"}), 400
    except Exception as e:
        logger.error(
            f"Error submitting user {user_id} quiz score for module {module_id}: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


@content_bp.route("/modules/<int:module_id>/complete", methods=["POST"])
@jwt_required()
def complete_module(module_id):
    try:
        user_id = get_jwt_identity()
        result = mark_module_complete_and_open_next(module_id, user_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(
            f"Error marking module {module_id} as complete and opening next modules: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


def mark_module_complete_and_open_next(module_id, user_id):
    try:
        # Get the current module's order and unit_id
        current_module = Module.query.filter_by(id=module_id).first()
        if not current_module:
            raise ValueError(f"Module with id {module_id} not found")
        unit_id = current_module.unit_id
        order = current_module.order

        # Get the user's module entry data
        user_module = UserModule.query.filter_by(
            module_id=module_id, user_id=user_id
        ).first()
        # Special case: add the first module to the UserModule table
        if order == 1 and user_module is None:
            user_module = UserModule(
                module_id=module_id,
                user_id=user_id,
            )
            db.session.add(user_module)

        if user_module is None:
            raise ValueError(f"UserModule with module_id {module_id} not found")
        # Update user module status to completed
        user_module.completed = True
        db.session.commit()
        logger.info(f"Marked module {module_id} as complete")

        # If this module completes the unit, mark the unit as complete
        finished_unit = is_unit_newly_completed(unit_id, user_id)

        if finished_unit:
            logger.debug(f"Unit {unit_id} is newly completed")
            complete_unit(unit_id, user_id)
            # skip opening next modules if the unit is complete
            return {"message": "Module marked as complete and unit completed"}

        # Get the next module(s) in the unit based on the order
        next_modules = Module.query.filter(
            Module.unit_id == unit_id,
            Module.order == order + 1,  # +1 for the next module
        ).all()
        # Update the UserModule entries for the next modules to open
        for next_module in next_modules:
            user_module_next = UserModule.query.filter_by(
                module_id=next_module.id,
                user_id=user_id,
            ).first()
            if not user_module_next:
                # Create a new UserModule entry if it doesn't exist
                user_module_next = UserModule(
                    module_id=next_module.id, user_id=user_module.user_id, open=True
                )
                db.session.add(user_module_next)
            # Update the UserModule entry to open
            else:
                user_module_next.open = True
        db.session.commit()
        logger.info("Next modules opened successfully")

        return {
            "message": "Module marked as complete and next modules opened successfully"
        }
    except Exception as e:
        logger.error(
            f"Error marking module {module_id} as complete and opening next modules: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


def are_all_modules_completed(unit_id, user_id):
    logger.debug(
        f"Checking if all modules are completed for unit {unit_id} and user {user_id}"
    )
    # check if all modules are completed by comparing the count of completed modules with the total modules
    total_modules = (
        db.session.query(Module)
        .filter(
            Module.unit_id == unit_id, Module.module_type != ModuleType.BONUS_CHALLENGE
        )
        .count()
    )
    completed_modules = (
        db.session.query(UserModule)
        .join(Module, Module.id == UserModule.module_id)
        .filter(
            UserModule.user_id == user_id,
            Module.unit_id == unit_id,
            UserModule.completed == True,
        )
        .count()
    )
    return completed_modules == total_modules


def is_unit_newly_completed(unit_id, user_id):
    logger.debug(f"Checking if unit {unit_id} is newly completed for user {user_id}")
    user_unit = UserUnit.query.filter_by(unit_id=unit_id, user_id=user_id).first()
    if user_unit is not None and user_unit.completed:
        logger.debug(f"found UserUnit {unit_id} record as already completed")
        return False
    if are_all_modules_completed(unit_id, user_id):
        return True
    return False


def complete_unit(unit_id, user_id):
    logger.debug(f"Marking unit {unit_id} as complete for user {user_id}")
    user_unit = UserUnit.query.filter_by(unit_id=unit_id, user_id=user_id).first()
    if user_unit is None:
        user_unit = UserUnit(unit_id=unit_id, user_id=user_id, completed=True)
        db.session.add(user_unit)
    else:
        user_unit.completed = True
    db.session.commit()

    # Trigger the UNIT_COMPLETION event to award badges
    badge_awarding_service = BadgeAwardingService(user_id)
    badge_awarding_service.check_and_award_badges(
        EventType.UNIT_COMPLETION, user_unit=user_unit
    )

    # add bonus challenge questions to the users modules
    bonus_challenge_modules = (
        db.session.query(Module)
        .filter_by(unit_id=unit_id, module_type=ModuleType.BONUS_CHALLENGE)
        .all()
    )
    logger.debug(
        f"adding bonus_challenge_modules to UserModules: {bonus_challenge_modules}"
    )
    for bonus_challenge_module in bonus_challenge_modules:
        user_module = UserModule.query.filter_by(
            user_id=user_id, module_id=bonus_challenge_module.id
        ).first()
        if user_module is None:
            user_module = UserModule(
                user_id=user_id, module_id=bonus_challenge_module.id
            )
            db.session.add(user_module)
    db.session.commit()

    return {"message": "Unit marked as complete"}


@content_bp.route("/modules/<int:module_id>/title", methods=["GET"])
def get_module_title(module_id):
    try:
        module = Module.query.filter_by(id=module_id).first()
        if module is None:
            return jsonify({"error": "Module not found"}), 404

        module_title = {
            "id": module.id,
            "title": module.title,
        }
        return jsonify(module_title), 200
    except Exception as e:
        logger.error(f"Error fetching module title for module {module_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/code-challenges/<int:module_id>", methods=["GET"])
def get_code_challenge(module_id):
    try:
        # Get file paths for the code challenge and HTML
        code_challenge_file_path = get_code_challenge_file_path(module_id)
        html_file_path = get_html_file_path(module_id)

        # Check if the text file exists
        if not os.path.exists(code_challenge_file_path):
            logger.error(f"Code challenge file not found for module {module_id}")
            return jsonify({"error": "Content not found"}), 404

        # Check if the HTML file exists
        if not os.path.exists(html_file_path):
            logger.error(f"HTML file not found for module {module_id}")
            return jsonify({"error": "Content not found"}), 404

        # Read content from both files
        with open(code_challenge_file_path, "r", encoding="utf-8") as code_file, open(
            html_file_path, "r", encoding="utf-8"
        ) as html_file:
            code_content = code_file.read()
            html_content = html_file.read()

        # Return the HTML content and code string as part of the response
        logger.debug(f"Code challenge retrieved successfully for module {module_id}")
        return jsonify({"html": html_content, "code": code_content}), 200

    except Exception as e:
        logger.error(
            f"Error retrieving code challenge for module {module_id}: {str(e)}"
        )
        return abort(500, description=str(e))


def get_code_challenge_file_path(module_id: int) -> str:
    # TODO: consider using the module title again for file names
    # Define the path to the text files
    base_path = os.path.join(os.getcwd(), "content", "code-challenges", "code")
    file_path = os.path.join(base_path, f"{module_id}.txt")

    return file_path


def get_html_file_path(module_id: int) -> str:
    # Define the path to the HTML files
    base_path = os.path.join(os.getcwd(), "content", "code-challenges", "html")
    # Construct the file path using the module_id
    file_path = os.path.join(base_path, f"{module_id}.html")

    return file_path


@content_bp.route("/units/completed", methods=["GET"])
@jwt_required()
def get_user_completed_units():
    try:
        user_id = get_jwt_identity()

        # Join UserUnit with Unit to get the unit title
        user_units = (
            db.session.query(UserUnit, Unit)
            .join(Unit, UserUnit.unit_id == Unit.id)
            .filter(UserUnit.user_id == user_id, UserUnit.completed == True)
            .all()
        )

        user_units_data = [
            {
                "id": user_unit.unit_id,
                "title": unit.title,
            }
            for user_unit, unit in user_units
        ]

        return jsonify(user_units_data), 200
    except Exception as e:
        logger.error(f"Error fetching user units: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/bonus-code-challenges", methods=["GET"])
@jwt_required()
def get_bonus_challenges():
    try:
        logger.debug("Fetching bonus challenges")
        user_id = get_jwt_identity()
        bonus_challenges = (
            db.session.query(UserModule, Module, Unit)
            .join(Module, UserModule.module_id == Module.id)
            .join(Unit, Module.unit_id == Unit.id)
            .filter(
                UserModule.user_id == user_id,
                Module.module_type == ModuleType.BONUS_CHALLENGE,
            )
            .all()
        )
        logger.debug(f"bonus challenges: {bonus_challenges}")
        bonus_challenges_data = [
            {
                "id": user_module.module_id,
                "title": module.title,
                "unit_title": unit.title,
                "open": user_module.open,
                "completed": user_module.completed,
            }
            for user_module, module, unit in bonus_challenges
        ]

        return jsonify(bonus_challenges_data), 200
    except Exception as e:
        logger.error(f"Error fetching practice challenges: {str(e)}")
        return jsonify({"error": str(e)}), 500
