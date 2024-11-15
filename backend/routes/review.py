from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Unit, User, db, UserModule, QuizQuestion, UserQuizQuestion, Module
import random

import logging

# TODO: this name may be coonfusing because the review page also uses content endpoints
review_bp = Blueprint("review", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@review_bp.route("/weekly-review/questions", methods=["GET"])
@jwt_required()
def get_weekly_review():
    try:
        logger.debug("Fetching weekly review data")
        user_id = get_jwt_identity()
        weekly_review_questions = pick_weekly_review_questions(user_id)
        return jsonify(weekly_review_questions), 200
    except Exception as e:
        logger.error(f"An error occurred while fetching weekly review data: {str(e)}")
        return jsonify({"error": str(e)}), 500


def pick_weekly_review_questions(user_id):
    TOTAL_QUESTIONS = 10
    MOST_RECENT_PERCENT = 0.65

    # Get the current date and the date 3 months ago
    current_date = datetime.now()
    three_months_ago = current_date - timedelta(days=90)

    # Fetch all questions the user has practiced within the past 3 months
    logger.debug(f"Fetching practiced questions for user {user_id}")
    practiced_questions = fetch_practiced_questions(user_id, three_months_ago)

    # Identify the most recently completed module
    most_recent_module = (
        db.session.query(UserModule)
        .filter(UserModule.user_id == user_id, UserModule.completed == True)
        .order_by(UserModule.completed_date.desc())
        .first()
    )

    if not most_recent_module:
        return []

    logger.debug(
        f"Most recently completed module: {most_recent_module.module_id}, selecting questions for review"
    )
    most_recent_unit_id = most_recent_module.module.unit_id
    # interleave questions to review from different units and quiz modules
    # the algorithm prioritizes newly learned topics and interleaves old/unreviewed questions for spaced practice
    # Select 65% of questions from the most recently practiced unit
    most_recent_questions = [
        q for q in practiced_questions if q["unit_id"] == most_recent_unit_id
    ]
    num_most_recent_questions = int(MOST_RECENT_PERCENT * TOTAL_QUESTIONS)
    selected_questions = random.sample(
        most_recent_questions,
        min(num_most_recent_questions, len(most_recent_questions)),
    )

    # Select the remaining 35% of questions from other units, weighted by the longest date since they were last reviewed
    remaining_questions = [
        q for q in practiced_questions if q["unit_id"] != most_recent_unit_id
    ]
    remaining_questions.sort(key=lambda q: q["last_practiced_date"])
    num_remaining_questions = TOTAL_QUESTIONS - len(selected_questions)
    selected_questions.extend(remaining_questions[:num_remaining_questions])
    # TODO: if there are not enough other questions, add more from the most recent unit

    # shuffle the questions
    random.shuffle(selected_questions)

    # get question data for chosen questions
    # Serialize the data
    questions = []
    for question in selected_questions:
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


def fetch_practiced_questions(user_id, three_months_ago):
    practiced_questions = (
        db.session.query(UserQuizQuestion)
        .join(UserQuizQuestion.quiz_question)
        .join(QuizQuestion.module)
        .join(Module.unit)
        .filter(
            UserQuizQuestion.user_id == user_id,
            UserQuizQuestion.last_practiced_date >= three_months_ago,
        )
        .all()
    )

    questions = []
    for user_question, question, module, unit in practiced_questions:
        questions.append(
            {
                "question_id": question.id,
                "module_id": module.id,
                "unit_id": unit.id,
                "last_practiced_date": user_question.last_practiced_date,
            }
        )
    logger.debug(f"Practiced questions: {questions}")

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
            user = User.query.get(user_id)
            user.weekly_review_done = True
            # TODO: add XP
            db.session.commit()

        logger.debug(f"Submitting weekly review data for user {user_id}")
        # logger.debug(data)
        return jsonify({"message": "Weekly review data submitted successfully"}), 200
    except Exception as e:
        logger.error(f"An error occurred while submitting weekly review data: {str(e)}")
        return jsonify({"error": str(e)}), 500


# TODO: maybe this should be a content route?
@review_bp.route("/unit-review/<int:unit_id>/questions", methods=["GET"])
def get_unit_review_questions(unit_id):
    try:
        if not unit_id:
            return jsonify({"error": "Unit ID is required"}), 400

        # Check if the unit exists
        unit = Unit.query.get(unit_id)
        if not unit:
            return jsonify({"error": "Unit not found"}), 404

        logger.debug(f"Fetching unit review data for unit {unit_id}")

        unit_questions = (
            db.session.query(QuizQuestion)
            .join(Module)
            .filter(Module.unit_id == unit_id)
            .all()
        )

        logger.debug(f"Fetched unit questions {unit_questions}")

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
        ACCURACY_THRESHOLD = 80  # TODO Define the threshold for passing as a constant

        if accuracy >= ACCURACY_THRESHOLD:
            user_id = get_jwt_identity()
            # TODO: reward XP
            # mark questions as practiced (assuming they got all questions correct)
            unit_questions = (
                db.session.query(QuizQuestion)
                .join(Module)
                .filter(Module.unit_id == unit_id)
                .all()
            )
            update_quiz_questions_practiced_date(user_id, unit_questions)

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


# TODO: duplicate function from content.py
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
