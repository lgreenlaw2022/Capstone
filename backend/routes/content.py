from datetime import datetime, timezone
from configurations.constants import (
    GEMS_FOR_BONUS_CHALLENGE,
    XP_FOR_COMPLETING_MODULE,
    XP_FOR_COMPLETING_CHALLENGE,
    GEMS_FOR_HINT,
)
from services.user_activity_service import update_daily_xp
from services.badge_awarding_service import BadgeAwardingService
from enums import EventType, ModuleType, RuntimeValues
from flask import Blueprint, request, jsonify, send_file, abort
import logging
from models import (
    DailyUserActivity,
    Hint,
    TestCase,
    User,
    UserHint,
    UserQuizQuestion,
    UserTestCase,
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
            Module.module_type != ModuleType.BONUS_SOLUTION,
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
    module = Module.query.get(module_id)
    if module is None:
        return jsonify({"error": "Module not found"}), 404

    unit_id = module.unit_id
    module_type = module.module_type
    order = module.order

    base_content_dir = "content"

    # Determine the file paths based on module type
    if module_type == ModuleType.CONCEPT_GUIDE:
        file_path = os.path.join(
            base_content_dir, f"unit_{unit_id}", f"{order}_concept_guide.html"
        )
        if not os.path.exists(file_path):
            logger.error(f"Concept guide file not found: {file_path}")
            return jsonify({"error": "Content not found"}), 404
        return send_file(file_path, mimetype="text/html")
    if module_type == ModuleType.RECOGNITION_GUIDE:
        file_path = os.path.join(
            base_content_dir, f"unit_{unit_id}", f"{order}_recognition_guide.html"
        )
        if not os.path.exists(file_path):
            logger.error(f"Recognition guide file not found: {file_path}")
            return jsonify({"error": "Content not found"}), 404
        return send_file(file_path, mimetype="text/html")
    if module_type in [
        ModuleType.CHALLENGE,
        ModuleType.CHALLENGE_SOLUTION,
        ModuleType.BONUS_CHALLENGE,
        ModuleType.BONUS_SOLUTION,
    ]:
        if module_type == ModuleType.CHALLENGE:
            sub_dir = f"{order}_challenge"
        elif module_type == ModuleType.CHALLENGE_SOLUTION:
            sub_dir = f"{order}_solution_guide"
        elif module_type == ModuleType.BONUS_CHALLENGE:
            sub_dir = f"{order}_bonus_challenge"
            base_content_dir = os.path.join(base_content_dir, "bonus_challenges")
        elif module_type == ModuleType.BONUS_SOLUTION:
            sub_dir = f"{order}_bonus_solution"
            base_content_dir = os.path.join(base_content_dir, "bonus_challenges")
            logger.debug(
                f"base_content_dir: {base_content_dir}, sub_dir: {sub_dir}, order: {order}"
            )

        content_file_path = os.path.join(
            base_content_dir, f"unit_{unit_id}", sub_dir, f"{order}_content.html"
        )
        code_file_path = os.path.join(
            base_content_dir, f"unit_{unit_id}", sub_dir, f"{order}_code.txt"
        )
        return get_code_and_content(code_file_path, content_file_path)
    else:
        return jsonify({"error": "Unsupported module type"}), 400


def get_code_and_content(code_file_path, content_file_path):
    try:
        # Check if the text file exists
        if not os.path.exists(code_file_path):
            logger.error("Code file not found for module")
            return jsonify({"error": "Code Content not found"}), 404

        # Check if the HTML file exists
        if not os.path.exists(content_file_path):
            logger.error(f"HTML file not found for module")
            return jsonify({"error": "Content not found"}), 404

        # Read content from both files
        with open(code_file_path, "r", encoding="utf-8") as code_file, open(
            content_file_path, "r", encoding="utf-8"
        ) as html_file:
            code_content = code_file.read()
            html_content = html_file.read()

        logger.debug(f"Code and content retrieved successfully for module")
        return jsonify({"html": html_content, "code": code_content}), 200

    except Exception as e:
        logger.error(f"Error retrieving code and content files: {str(e)}")
        return abort(500, description=str(e))


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

            # update practiced date for the questions
            quiz_questions = QuizQuestion.query.filter_by(module_id=module_id).all()
            update_quiz_questions_practiced_date(user_id, quiz_questions)

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


def update_quiz_questions_practiced_date(user_id, questions):
    for question in questions:
        # create UserQuizQuestion record if it does not exist
        user_question = UserQuizQuestion.query.filter_by(
            user_id=user_id, question_id=question.id
        ).first()
        if user_question is None:
            user_question = UserQuizQuestion(user_id=user_id, question_id=question.id)
            db.session.add(user_question)
        user_question.last_practiced_date = db.func.current_timestamp()
    db.session.commit()


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

        # TODO: refactoring -- if I create the user_module here, I do not need to keep checking for it later
        if user_module is None:
            logger.debug(f"Adding first module {module_id} to UserModule table")
            user_module = UserModule(
                module_id=module_id,
                user_id=user_id,
            )
            # TODO: add UserUnit here?
            db.session.add(user_module)

        # Update the user's daily XP
        if current_module.module_type not in [
            ModuleType.BONUS_CHALLENGE,
            ModuleType.CHALLENGE,
        ]:
            earned_xp = XP_FOR_COMPLETING_MODULE
        else:  # Bonus and practice challenges have different XP values
            earned_xp = XP_FOR_COMPLETING_CHALLENGE
        logger.debug(f"User {user_id} earned {earned_xp} XP for completing a module")
        update_daily_xp(user_id, earned_xp)

        if current_module.module_type == ModuleType.BONUS_CHALLENGE:
            # mark the bonus challenge as complete
            user_module.completed = True

            solution_module, error_message, status_code = (
                get_solution_module_for_challenge(module_id)
            )
            if solution_module is None:
                logger.error(
                    f"Error getting solution module for bonus challenge: {error_message}"
                )
                return jsonify({"error": error_message}), status_code

            # create and open the bonus solution module for the user
            user_solution_module = UserModule.query.filter_by(
                user_id=user_id, module_id=solution_module.id
            ).first()
            if user_solution_module is None:
                logger.debug(
                    f"UserModule not found for solution module {solution_module.id}, adding it"
                )
                user_solution_module = UserModule(
                    user_id=user_id, module_id=solution_module.id, open=True
                )
                db.session.add(user_solution_module)
            else:
                user_solution_module.open = True
            db.session.commit()
            logger.info("Bonus challenge marked as complete and solution opened")
            return {"message": "Bonus challenge marked as complete and solution opened"}

        if current_module.module_type == ModuleType.BONUS_SOLUTION:
            # mark the bonus solution as complete
            user_module.completed = True
            db.session.commit()
            logger.info("Bonus solution marked as complete")
            return {"message": "Bonus solution marked as complete"}

        # Check if the module is already marked as complete
        if user_module.completed:
            logger.debug(f"Module {module_id} is already marked as complete")
            return {"message": "Module already marked as complete"}

        # Update user module status to completed
        user_module.completed = True
        current_date = datetime.now(timezone.utc).date()
        user_module.completed_date = current_date

        # add daily activity record for completing a module
        today_activity = DailyUserActivity.query.filter_by(
            user_id=user_id, date=current_date
        ).first()
        if today_activity is None:
            today_activity = DailyUserActivity(user_id=user_id, date=current_date)
            db.session.add(today_activity)
        today_activity.modules_completed += 1
        db.session.commit()

        # check module count badges
        badge_awarding_service = BadgeAwardingService(user_id)
        badge_awarding_service.check_and_award_badges(
            EventType.COMPLETE_MODULE,
            user_modules_completed=get_num_modules_completed(user_id),
        )

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
        ).all()  # allows for parallel modules
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
        raise


def get_solution_module_for_challenge(module_id):
    try:
        module = Module.query.filter_by(id=module_id).first()
        if module is None:
            logger.error(f"Module not found for module_id {module_id}")
            return None, "Module not found", 404

        module_type = module.module_type
        order = module.order

        if module_type == ModuleType.CHALLENGE:
            solution_module = Module.query.filter_by(
                order=order + 1,
                module_type=ModuleType.CHALLENGE_SOLUTION,
                unit_id=module.unit_id,
            ).first()
        elif module_type == ModuleType.BONUS_CHALLENGE:
            solution_module = Module.query.filter_by(
                order=order + 1,
                module_type=ModuleType.BONUS_SOLUTION,
                unit_id=module.unit_id,
            ).first()
        else:
            logger.error(f"Module is not a challenge for module_id {module_id}")
            return None, "Module is not a challenge", 400

        if solution_module is None:
            logger.error(f"Solution not found for module_id {module_id}")
            return None, "Solution not found", 404

        logger.debug(f"Solution module found: {solution_module.id}")
        return solution_module, None, 200

    except Exception as e:
        logger.error(
            f"Error identifying challenge solution module for module {module_id}: {str(e)}"
        )
        return None, str(e), 500


@content_bp.route("/modules/code-challenges/<int:module_id>/solution", methods=["GET"])
@jwt_required()
def get_challenge_solution(module_id):
    try:
        solution_module, error_message, status_code = get_solution_module_for_challenge(
            module_id
        )
        if solution_module is None:
            return jsonify({"error": error_message}), status_code

        user_solution_module = UserModule.query.filter_by(
            user_id=get_jwt_identity(), module_id=solution_module.id
        ).first()
        if user_solution_module is None:
            user_solution_module = UserModule(
                user_id=get_jwt_identity(), module_id=solution_module.id, open=True
            )
            db.session.add(user_solution_module)
        else:
            user_solution_module.open = True
        db.session.commit()

        logger.info(f"Solution module {solution_module.id} opened for user")
        return (
            jsonify(
                {
                    "solutionId": solution_module.id,
                    "moduleType": solution_module.module_type.name,
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(
            f"Error identifying challenge solution module for module {module_id}: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


def get_num_modules_completed(user_id):
    completed_modules_count = (
        db.session.query(UserModule)
        .filter(
            UserModule.user_id == user_id,
            UserModule.completed == True,
        )
        .count()
    )

    return completed_modules_count


def are_all_unit_modules_completed(unit_id, user_id):
    logger.debug(
        f"Checking if all modules are completed for unit {unit_id} and user {user_id}"
    )
    # check if all modules are completed by comparing the count of completed modules with the total modules
    total_modules = (
        db.session.query(Module)
        .filter(
            Module.unit_id == unit_id,
            Module.module_type != ModuleType.BONUS_CHALLENGE,
            Module.module_type != ModuleType.BONUS_SOLUTION,
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
    # check if the unit is newly completed by checking db for unit and module records
    # method is used to trigger events like badge checks
    user_unit = UserUnit.query.filter_by(unit_id=unit_id, user_id=user_id).first()
    if user_unit is not None and user_unit.completed:
        logger.debug(f"found UserUnit {unit_id} record as already completed")
        return False
    if are_all_unit_modules_completed(unit_id, user_id):
        logger.debug(f"Unit {unit_id} is newly completed")
        return True
    return False


def complete_unit(unit_id, user_id):
    user_unit = UserUnit.query.filter_by(unit_id=unit_id, user_id=user_id).first()
    if user_unit is None:
        user_unit = UserUnit(unit_id=unit_id, user_id=user_id, completed=True)
        db.session.add(user_unit)
    else:
        user_unit.completed = True
    db.session.commit()

    # TODO: these events shouldn't need to be triggered if the unit is already marked as complete?
    # Trigger the UNIT_COMPLETION event to award badges
    unit = Unit.query.filter_by(id=unit_id).first()
    badge_awarding_service = BadgeAwardingService(user_id)
    badge_awarding_service.check_and_award_badges(
        EventType.UNIT_COMPLETION,
        user_unit_completed=user_unit.completed,
        unit_title=unit.title,
    )
    logger.debug(f"Badges checked for unit {unit_id} completion")

    # add bonus challenge questions to the user's modules
    bonus_challenge_modules = (
        db.session.query(Module)
        .filter_by(unit_id=unit_id, module_type=ModuleType.BONUS_CHALLENGE)
        .all()
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

    logger.debug(f"Bonus challenges added to UserModules")
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


@content_bp.route("/units/<int:unit_id>/title", methods=["GET"])
def get_unit_title(unit_id):
    try:
        unit = Unit.query.filter_by(id=unit_id).first()
        if unit is None:
            return jsonify({"error": "Unit not found"}), 404

        unit_title = {
            "id": unit.id,
            "title": unit.title,
        }
        return jsonify(unit_title), 200
    except Exception as e:
        logger.error(f"Error fetching unit title for unit {unit_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


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
        logger.debug(f"Bonus challenges data: {bonus_challenges_data}")

        return jsonify(bonus_challenges_data), 200
    except Exception as e:
        logger.error(f"Error fetching practice challenges: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/bonus-challenges/<int:challenge_id>/buy", methods=["POST"])
@jwt_required()
def buy_bonus_challenge(challenge_id):
    try:
        user_id = get_jwt_identity()
        # validate bonus challenge exists
        module = Module.query.get(challenge_id)
        if module is None:
            logger.debug("Bonus challenge not found")
            return jsonify({"error": "Bonus challenge not found"}), 404
        if module.module_type != ModuleType.BONUS_CHALLENGE:
            logger.debug("Module is not a bonus challenge")
            return jsonify({"error": "Module is not a bonus challenge"}), 400

        user_module = UserModule.query.filter_by(
            user_id=user_id, module_id=challenge_id
        ).first()

        if user_module is None:
            user_module = UserModule(user_id=user_id, module_id=challenge_id)
        elif user_module.open:
            logger.debug("Bonus challenge already open")
            return jsonify({"message": "Bonus challenge already open"}), 200
        # deduct gems for bonus challenge purchase
        user = User.query.get(user_id)
        if user.gems < GEMS_FOR_BONUS_CHALLENGE:
            logger.error(f"Insufficient gems to buy bonus challenge for user {user_id}")
            return jsonify({"error": "Insufficient gems to buy bonus challenge"}), 400

        user.gems -= GEMS_FOR_BONUS_CHALLENGE
        user_module.open = True
        db.session.add(user_module)
        db.session.commit()

        logger.info(f"Bonus challenge {challenge_id} unlocked successfully")
        return jsonify({"message": "Bonus challenge unlocked successfully"}), 200
    except Exception as e:
        logger.error(f"Error unlocking bonus challenge {challenge_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/hints/<int:module_id>", methods=["GET"])
@jwt_required()
def get_user_challenge_hints(module_id):
    try:
        user_id = get_jwt_identity()
        user_hints_data = []

        # get all hints for the challenge
        module = db.session.query(Module).filter(Module.id == module_id).first()
        if module is None:
            return jsonify({"error": "Module not found"}), 404
        if module.module_type not in [
            ModuleType.CHALLENGE,
            ModuleType.BONUS_CHALLENGE,
        ]:
            return jsonify({"error": "Module is not a challenge"}), 400

        hints = module.hints
        # mark ones in the UserHint table as seen
        for hint in hints:
            user_hint = UserHint.query.filter_by(
                user_id=user_id, hint_id=hint.id
            ).first()
            unlocked = user_hint.unlocked if user_hint else False
            user_hints_data.append(
                {
                    "hintId": hint.id,
                    "hint": hint.text,
                    "order": hint.order,
                    "unlocked": unlocked,
                }
            )

        return jsonify(user_hints_data), 200
    except Exception as e:
        logger.error(f"Error fetching hints for challenge {module_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/hints/<int:hint_id>/buy", methods=["POST"])
@jwt_required()
def buy_hint(hint_id):
    try:
        user_id = get_jwt_identity()
        # Validate hint exists
        hint = Hint.query.get(hint_id)
        if hint is None:
            return jsonify({"error": "Hint not found"}), 404

        user_hint = UserHint.query.filter_by(user_id=user_id, hint_id=hint_id).first()
        if user_hint is None:
            user_hint = UserHint(user_id=user_id, hint_id=hint_id)
        # deduct gems for hint purchase
        user = User.query.get(user_id)
        if user.gems < GEMS_FOR_HINT:
            logger.error(f"Insufficient gems to buy hint for user {user_id}")
            return jsonify({"error": "Insufficient gems to buy hint"}), 400

        user.gems -= GEMS_FOR_HINT
        user_hint.unlocked = True
        db.session.add(user_hint)
        db.session.commit()
        return jsonify({"message": "Hint unlocked successfully"}), 200
    except Exception as e:
        logger.error(f"Error unlocking hint {hint_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/code-checks/<int:module_id>", methods=["GET"])
@jwt_required()
def get_user_challenge_code_checks(module_id):
    try:
        user_id = get_jwt_identity()
        user_test_case_data = []

        module = db.session.query(Module).filter(Module.id == module_id).first()
        if module is None:
            return jsonify({"error": "Module not found"}), 404
        if module.module_type not in [
            ModuleType.CHALLENGE,
            ModuleType.BONUS_CHALLENGE,
        ]:
            return jsonify({"error": "Module is not a challenge"}), 400

        # get the runtime check values for the challenge
        target_runtime = module.target_runtime.value

        user_module = (
            db.session.query(UserModule)
            .filter_by(user_id=user_id, module_id=module_id)
            .first()
        )
        prior_runtime = (
            user_module.submitted_runtime.value
            if user_module and user_module.submitted_runtime
            else None
        )

        # get all test cases for the challenge
        test_cases = module.test_cases
        for test_case in test_cases:
            user_test_case = UserTestCase.query.filter_by(
                user_id=user_id,
                test_case_id=test_case.id,
            ).first()
            # create a new UserTestCase record if
            if not user_test_case:
                user_test_case = UserTestCase(
                    user_id=user_id, test_case_id=test_case.id, verified=False
                )
                db.session.add(user_test_case)

            verified = user_test_case.verified

            outputs = [output.output for output in test_case.outputs]

            user_test_case_data.append(
                {
                    "testCaseId": test_case.id,
                    "input": test_case.input,
                    "outputs": outputs,
                    "verified": verified,
                }
            )
        db.session.commit()

        logger.debug(
            f"Test cases fetched successfully for challenge {module_id}: {user_test_case_data}"
        )
        return (
            jsonify(
                {
                    "runtime": {
                        "target": target_runtime,
                        "prior": prior_runtime,
                    },
                    "testCases": user_test_case_data,
                }
            ),
            200,
        )
    except Exception as e:
        logger.error(f"Error fetching test cases for challenge {module_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/test-cases/<int:test_case_id>/verify", methods=["POST"])
@jwt_required()
def mark_user_test_case_verified(
    test_case_id,
):  # only called when the user has submitted the correct output
    try:
        user_id = get_jwt_identity()
        # Validate test case exists
        test_case = TestCase.query.get(test_case_id)
        if test_case is None:
            return jsonify({"error": "Test case not found"}), 404

        user_test_case = UserTestCase.query.filter_by(
            user_id=user_id,
            test_case_id=test_case_id,
        ).first()
        if user_test_case is None:
            return jsonify({"error": "User test case not found"}), 404

        user_test_case.verified = True
        db.session.commit()
        return jsonify({"message": "Test case verified successfully"}), 200
    except Exception as e:
        logger.error(f"Error verifying test case {test_case_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500


@content_bp.route("/modules/<int:module_id>/runtime/submit", methods=["POST"])
@jwt_required()
def store_user_runtime_answer(module_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        submitted_runtime = data.get("runtime")
        if submitted_runtime is None:
            return jsonify({"error": "Runtime is required"}), 400

        user_module = UserModule.query.filter_by(
            user_id=user_id, module_id=module_id
        ).first()
        if user_module is None:
            return jsonify({"error": "User module not found"}), 404

        try:
            # Convert the string value back to the enum
            user_module.submitted_runtime = RuntimeValues(submitted_runtime)
        except ValueError:
            return jsonify({"error": "Invalid runtime value"}), 400

        db.session.commit()
        logger.info(f"Runtime answer submitted successfully for module {module_id}")
        return jsonify({"message": "Runtime answer submitted successfully"}), 200
    except Exception as e:
        logger.error(
            f"Error submitting runtime answer for module {module_id}: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500
