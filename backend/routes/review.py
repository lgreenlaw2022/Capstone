from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Unit, User, db, UserModule, QuizQuestion, UserQuizQuestion, Module
import random
from typing import List, Dict, Any
from enums import ModuleType
from services.user_activity_service import UserActivityService
from constants import XP_FOR_COMPLETING_REVIEW, QUIZ_ACCURACY_THRESHOLD
import logging

review_bp = Blueprint("review", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

user_activity_service = UserActivityService()



@review_bp.route("/weekly-review/questions", methods=["GET"])
@jwt_required()
def get_weekly_review():
    try:
        user_id = get_jwt_identity()
        weekly_review_questions = pick_weekly_review_questions(user_id)
        return jsonify(weekly_review_questions), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching weekly review data: {str(e)}")
        return jsonify({"error": str(e)}), 500


def pick_weekly_review_questions(user_id: int) -> List[Dict[str, Any]]:
    """
    Selects a set of weekly review questions for a user based on their recent activity.

    The function prioritizes questions from the most recently completed unit (65% of the total)
    and interleaves questions from other practiced units (35% of the total), weighted by the time since
    they were last practiced. If there are not enough questions, it adjusts accordingly.
    This is an implementation of spaced practice.

    Args:
        user_id (int): The ID of the user for whom the review questions are being selected.

    Returns:
        List[Dict[str, Any]]: A list of serialized question data, including question ID, title,
                              and options (with IDs, text, and correctness).
    """
    TOTAL_QUESTIONS = 10
    MOST_RECENT_QUESTIONS_PERCENT = 0.65

    # Get the current date and the date 3 months ago
    current_date = datetime.now()
    three_months_ago = current_date - timedelta(days=90)

    # Fetch all questions the user has practiced within the past 3 months
    practiced_questions = fetch_practiced_questions(user_id, three_months_ago)

    # Identify the most recently completed quiz module
    most_recent_module = (
        db.session.query(UserModule)
        .join(Module, UserModule.module_id == Module.id)
        .filter(
            UserModule.user_id == user_id,
            UserModule.completed == True,
            Module.module_type == ModuleType.QUIZ,
        )
        .order_by(UserModule.completed_date.desc())
        .first()
    )

    if not most_recent_module:
        # user has not practiced any question to review
        logger.debug("User does not have any questions to review")
        return []

    most_recent_unit_id = most_recent_module.module.unit_id

    # Select 35% of questions from older units
    diff_unit_questions = [
        q for q in practiced_questions if q["unit_id"] != most_recent_unit_id
    ]
    # Sort by the last practiced date (ascending) to prioritize less fresh questions
    diff_unit_questions.sort(key=lambda q: q["last_practiced_date"])
    num_diff_unit_questions = int((1 - MOST_RECENT_QUESTIONS_PERCENT) * TOTAL_QUESTIONS)
    selected_questions = diff_unit_questions[:num_diff_unit_questions]

    # If there are not enough questions from other units, adjust the number of remaining questions
    num_diff_unit_selected = len(selected_questions)
    num_remaining_questions = TOTAL_QUESTIONS - num_diff_unit_selected

    # Fill the remaining questions with randomly selected questions from the most recently practiced unit
    most_recent_unit_questions = [
        q for q in practiced_questions if q["unit_id"] == most_recent_unit_id
    ]
    # Either 65% from the most recent unit or more if needed
    selected_questions.extend(
        random.sample(
            most_recent_unit_questions,
            min(
                num_remaining_questions, len(most_recent_unit_questions)
            ),  # ensure not to exceed the available questions
        )
    )

    # shuffle the questions
    random.shuffle(selected_questions)

    # serialize the question data for chosen questions
    questions = []
    for question in selected_questions:
        # Fetch the complete question object from the database
        # this is necessary to get the options for the question
        question_obj = (
            db.session.query(QuizQuestion).filter_by(id=question["question_id"]).first()
        )
        question_data = {
            "id": question_obj.id,
            "title": question_obj.title,
            "options": [
                {
                    "id": option.id,
                    "option_text": option.option_text,
                    "is_correct": option.is_correct,
                }
                for option in question_obj.options
            ],
        }
        questions.append(question_data)
    return questions


def fetch_practiced_questions(
    user_id: int, date_limit: datetime
) -> List[Dict[str, Any]]:
    """
    Fetches all quiz questions and their relevant metadata that a user has practiced since a specified date.

    Args:
        user_id (int): The ID of the user whose practiced questions are being fetched.
        date_limit (datetime): The earliest date to include questions that were practiced.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary contains:
            - question_id (int): The ID of the quiz question.
            - module_id (int): The ID of the module the question belongs to.
            - unit_id (int): The ID of the unit the question belongs to.
            - last_practiced_date (datetime): The last date the question was practiced.
    """
    practiced_questions = (
        db.session.query(UserQuizQuestion)
        .join(UserQuizQuestion.quiz_question)
        .filter(
            UserQuizQuestion.user_id == user_id,
            UserQuizQuestion.last_practiced_date >= date_limit,
        )
        .all()
    )

    questions = []
    for user_question in practiced_questions:
        question = user_question.quiz_question
        module = question.module
        unit = module.unit
        questions.append(
            {
                "question_id": question.id,
                "module_id": module.id,
                "unit_id": unit.id,
                "last_practiced_date": user_question.last_practiced_date,
            }
        )

    return questions


@review_bp.route("/weekly-review/status", methods=["GET"])
@jwt_required()
def get_weekly_review_status():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            logger.error(f"User with id {user_id} not found")
            return jsonify({"error": "User not found"}), 404

        status = user.weekly_review_done
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching weekly review status: {str(e)}")
        return jsonify({"error": str(e)}), 500


@review_bp.route("/weekly-review/submit", methods=["POST"])
@jwt_required()
def submit_weekly_review():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        accuracy = data.get("accuracy")
        # Validate accuracy
        if accuracy is None:
            return jsonify({"error": "Accuracy is required"}), 400
        if not (0 <= accuracy <= 100):
            return jsonify({"error": "Accuracy must be between 0 and 100"}), 400

        # mark module as complete if accuracy is above passing threshold
        if accuracy >= QUIZ_ACCURACY_THRESHOLD:
            user = User.query.get(user_id)
            user.weekly_review_done = True
            user_activity_service.update_daily_xp(user_id, XP_FOR_COMPLETING_REVIEW)
            db.session.commit()

        logger.debug(f"Submitting weekly review data for user {user_id}")
        return jsonify({"message": "Weekly review data submitted successfully"}), 200
    except Exception as e:
        logger.error(f"An error occurred while submitting weekly review data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@review_bp.route("/unit-review/<int:unit_id>/questions", methods=["GET"])
def get_unit_review_questions(unit_id):
    try:
        if not unit_id:
            return jsonify({"error": "Unit ID is required"}), 400

        # Check if the unit exists
        unit = Unit.query.get(unit_id)
        if not unit:
            return jsonify({"error": "Unit not found"}), 404

        # Fetch all quiz questions for the unit
        unit_questions = (
            db.session.query(QuizQuestion)
            .join(Module)
            .filter(Module.unit_id == unit_id)
            .all()
        )

        unit_review_questions = []
        for question in unit_questions:
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
            unit_review_questions.append(question_data)

        return jsonify(unit_review_questions), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching unit review data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@review_bp.route("/units/<int:unit_id>/submit", methods=["POST"])
@jwt_required()
def submit_unit_quiz_score(unit_id):
    try:
        data = request.get_json()
        accuracy = data.get("accuracy")
        # Validate accuracy
        if accuracy is None:
            return jsonify({"error": "Accuracy is required"}), 400
        if not (0 <= accuracy <= 100):
            return jsonify({"error": "Accuracy must be between 0 and 100"}), 400

        if accuracy >= QUIZ_ACCURACY_THRESHOLD:
            user_id = get_jwt_identity()
            # mark questions as practiced (assuming they got all questions correct)
            unit_questions = (
                db.session.query(QuizQuestion)
                .join(Module)
                .filter(Module.unit_id == unit_id)
                .all()
            )
            update_quiz_questions_practiced_date(user_id, unit_questions)
            user_activity_service.update_daily_xp(user_id, XP_FOR_COMPLETING_REVIEW)

            return (
                jsonify({"message": "Submitted unit review complete successfully"}),
                200,
            )
        else:
            return jsonify({"message": "Quiz score not high enough to pass"}), 400
    except Exception as e:
        logger.error(
            f"Error submitting user {user_id} score for unit {unit_id} review: {str(e)}"
        )
        return jsonify({"error": str(e)}), 500


def update_quiz_questions_practiced_date(
    user_id: int, questions: List[QuizQuestion]
) -> None:
    """
    Updates the last practiced date for a list of quiz questions for a specific user to today.

    Args:
        user_id (int): The ID of the user whose quiz question records are being updated.
        questions (List[QuizQuestion]): A list of `QuizQuestion` objects to update.

    Returns:
        None
    """
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
