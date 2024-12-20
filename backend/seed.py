from datetime import datetime, timezone
from app import create_app
from models import (
    Goal,
    Hint,
    User,
    UserGoal,
    db,
    Unit,
    Course,
    Module,
    QuizQuestion,
    QuizQuestionOption,
    UserModule,
    Badge,
    UserBadge,
    UserUnit,
    DailyUserActivity,
)
from enums import MetricType, ModuleType, BadgeType, EventType, TimePeriodType
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

app = create_app()


def add_units(course_id, units):
    units_to_add = []
    for unit_data in units:
        unit = Unit.query.filter_by(
            title=unit_data["title"], course_id=course_id
        ).first()
        if unit is None:
            unit = Unit(
                course_id=course_id,
                title=unit_data["title"],
                order=unit_data["order"],
            )
            units_to_add.append(unit)
    return units_to_add


def add_modules(unit_id, modules):
    modules_to_add = []
    for module_data in modules:
        module = Module.query.filter_by(
            title=module_data["title"],
            unit_id=unit_id,
        ).first()
        if module is None:
            module = Module(
                unit_id=unit_id,
                title=module_data["title"],
                order=module_data.get("order"),
                module_type=module_data["module_type"],
            )
            modules_to_add.append(module)
    return modules_to_add


# this function can be used if I want to manually seed the user's progress in the unit
def add_hashmap_modules_to_user(user_id, unit_id):
    if user_id:
        # Fetch the modules
        concept_guide_module = Module.query.filter_by(
            title="Hash Maps", unit_id=unit_id
        ).first()
        quiz_module = Module.query.filter_by(
            title="Hash Maps Quiz", unit_id=unit_id
        ).first()

        # Create UserModule entries
        # add concept guide
        user_modules_to_add = []
        if concept_guide_module:
            user_modules_to_add.append(
                UserModule(
                    user_id=user_id,
                    module_id=concept_guide_module.id,
                )
            )

        # add quiz module
        if quiz_module:
            user_modules_to_add.append(
                UserModule(
                    user_id=user_id,
                    module_id=quiz_module.id,
                )
            )

    return user_modules_to_add


def add_quiz_questions(module_id, quiz_questions):
    quiz_questions_to_add = []
    # add each question in the list to the db
    for question_data in quiz_questions:
        # check the question is not already in the db
        question = QuizQuestion.query.filter_by(
            title=question_data["title"],
            module_id=module_id,
        ).first()

        if question is None:
            question = QuizQuestion(
                module_id=module_id,
                title=question_data["title"],
            )
            db.session.add(question)
            db.session.flush()  # Ensure the question id is available for options data

            # add the listed quiz answers to QuizQuestionOption table
            for option_data in question_data["options"]:
                option = QuizQuestionOption(
                    question_id=question.id,
                    option_text=option_data["option_text"],
                    is_correct=option_data["is_correct"],
                    option_type=option_data["option_type"],
                )
                db.session.add(option)
            quiz_questions_to_add.append(question)
    return quiz_questions_to_add


def add_badges():
    badges_data = [
        {
            "title": "Hash Maps",
            "description": "Awarded for completing the hash tables unit.",
            "type": BadgeType.CONTENT,
            "criteria_expression": "user_unit.completed == True and user_unit.unit_id == 1",  # TODO: don't hardcode?
            "event_type": EventType.UNIT_COMPLETION,
        },
        {
            "title": "30 day streak",
            "description": "Awarded for reaching a 30 day streak.",
            "type": BadgeType.AWARD,
            "criteria_expression": "user.streak >= 7",
            "event_type": EventType.STREAK_ACHIEVEMENT,
        },
        {
            "title": "Quiz Master",
            "description": "Awarded for scoring 100% on a quiz.",
            "type": BadgeType.AWARD,
            "criteria_expression": "quiz_score == 100",
            "event_type": EventType.QUIZ_PERFECT_SCORE,
        },
    ]

    badges_to_add = []
    for badge_data in badges_data:
        existing_badge = Badge.query.filter_by(title=badge_data["title"]).first()
        if existing_badge:
            continue
        badge = Badge(
            title=badge_data["title"],
            description=badge_data["description"],
            type=badge_data["type"],
            criteria_expression=badge_data["criteria_expression"],
            event_type=badge_data["event_type"],
        )
        badges_to_add.append(badge)

    db.session.bulk_save_objects(badges_to_add)
    db.session.commit()
    print("Badges added successfully.")


def add_user_badges(user_id):
    # Fetch the badges
    hash_table_badge = Badge.query.filter_by(title="Hash Tables").first()
    streak_badge = Badge.query.filter_by(title="30 day streak").first()

    # Create UserBadge entries
    user_badges_to_add = []
    if hash_table_badge:
        user_badges_to_add.append(
            UserBadge(
                user_id=user_id,
                badge_id=hash_table_badge.id,
            )
        )

    if streak_badge:
        user_badges_to_add.append(
            UserBadge(
                user_id=user_id,
                badge_id=streak_badge.id,
            )
        )

    return user_badges_to_add


def add_goals():
    goals_data = [
        {
            "title": "Complete 2 modules",
            "metric": MetricType.COMPLETE_MODULES,
            "requirement": 2,
            "time_period": TimePeriodType.DAILY,
        },
        {
            "title": "Earn 5 gems",
            "metric": MetricType.EARN_GEMS,
            "requirement": 5,
            "time_period": TimePeriodType.DAILY,
        },
        {
            "title": "Extend streak by 1 day",
            "metric": MetricType.EXTEND_STREAK,
            "requirement": 1,
            "time_period": TimePeriodType.DAILY,
        },
        {
            "title": "Practice for 15 days",
            "metric": MetricType.EXTEND_STREAK,
            "requirement": 15,
            "time_period": TimePeriodType.MONTHLY,
        },
        {
            "title": "Complete 10 modules",
            "metric": MetricType.COMPLETE_MODULES,
            "requirement": 10,
            "time_period": TimePeriodType.MONTHLY,
        },
        {
            "title": "Earn 50 gems",
            "metric": MetricType.EARN_GEMS,
            "requirement": 50,
            "time_period": TimePeriodType.MONTHLY,
        },
    ]

    goals_to_add = []
    for goal_data in goals_data:
        existing_goal = Goal.query.filter_by(title=goal_data["title"]).first()
        if existing_goal:
            continue
        goal = Goal(
            title=goal_data["title"],
            metric=goal_data["metric"],
            requirement=goal_data["requirement"],
            time_period=goal_data["time_period"],
        )
        goals_to_add.append(goal)

    db.session.bulk_save_objects(goals_to_add)
    db.session.commit()

    print("Goals added successfully.")


def add_user_goals():
    # Query the goals back to get their IDs
    goals = Goal.query.all()

    if not goals:
        print("No goals found.")
        return

    # Assign goals to a user
    users = User.query.limit(3).all()
    if not users:
        user = User(
            username="testuser", email="testuser@example.com", password="password"
        )
        db.session.add(user)
        db.session.commit()

    user_goals_to_add = []
    for user in users:
        for goal in goals:
            user_goal = UserGoal(
                user_id=user.id,
                goal_id=goal.id,
                date_assigned=datetime.now(timezone.utc).date(),
            )
            user_goals_to_add.append(user_goal)

    db.session.bulk_save_objects(user_goals_to_add)
    db.session.commit()

    print("User goals added successfully.")


def add_hints():
    # Fetch all CHALLENGE modules
    challenge_modules = (
        db.session.query(Module)
        .filter(
            Module.module_type.in_([ModuleType.CHALLENGE, ModuleType.BONUS_CHALLENGE])
        )
        .all()
    )
    hints_data_template = [
        {
            "text": "This is hint 1",
            "order": 1,
        },
        {
            "text": "This is hint 2",
            "order": 2,
        },
        {
            "text": "This is hint 3",
            "order": 3,
        },
    ]

    hints_to_add = []
    for module in challenge_modules:
        # Check if hints already exist for this module
        existing_hints = db.session.query(Hint).filter_by(module_id=module.id).all()
        if existing_hints:
            continue

        for hint_data in hints_data_template:
            hint = Hint(
                text=hint_data["text"],
                order=hint_data["order"],
                module_id=module.id,
            )
            hints_to_add.append(hint)

    bulk_insert(hints_to_add)


def bulk_insert(objects_to_add):
    if objects_to_add:
        db.session.bulk_save_objects(objects_to_add)
        db.session.commit()


def clear_users():
    db.session.query(User).delete()
    db.session.commit()


def clear_user_modules():
    db.session.query(UserModule).delete()
    db.session.commit()


def clear_user_units():
    db.session.query(UserUnit).delete()
    db.session.commit()


def clear_user_badges():
    db.session.query(UserBadge).delete()
    db.session.commit()


def clear_badges():
    db.session.query(Badge).delete()
    db.session.commit()


def clear_daily_user_activity():
    db.session.query(DailyUserActivity).delete()
    db.session.commit()


def seed_data():
    with app.app_context():
        # Reset user progress
        # clear_users()
        # clear_user_units()
        clear_user_modules()
        # clear_user_badges()
        # clear_daily_user_activity()
        # db.session.query(UserGoal).delete()
        db.session.query(Module).delete()
        # db.session.query(Unit).delete()
        db.session.commit()
        # Check if the course already exists
        course = Course.query.filter_by(title="Technical Interview Prep").first()
        if not course:
            course = Course(title="Technical Interview Prep")
            db.session.add(course)
            db.session.commit()

        # Add units to the course
        units = [
            {"title": "Hash Maps", "order": 1},
        ]

        # Bulk insert units
        units_to_add = add_units(course.id, units)
        bulk_insert(units_to_add)

        # Add modules to the unit
        hashmaps_modules = [
            {
                "title": "Hash Maps",
                "order": 1,
                "module_type": ModuleType.CONCEPT_GUIDE,
            },
            {
                "title": "Hash Maps Quiz",
                "order": 2,
                "module_type": ModuleType.QUIZ,
            },
            {
                "title": "Hash Maps Code Challenge 1",
                "order": 3,
                "module_type": ModuleType.CHALLENGE,
            },
            {
                "title": "Two Sum",
                "order": -1,
                "module_type": ModuleType.BONUS_CHALLENGE,
            },
            {
                "title": "Hash Maps Code Challenge 1 Solution",
                "order": 4,
                "module_type": ModuleType.CHALLENGE_SOLUTION,
            },
        ]
        # Get the "Hash Maps" unit
        hashmaps_unit = Unit.query.filter_by(
            title="Hash Maps", course_id=course.id
        ).first()

        # Add modules and perform bulk insert
        if hashmaps_unit:
            modules_to_add = add_modules(hashmaps_unit.id, hashmaps_modules)
            bulk_insert(modules_to_add)

        # Fetch the "Hash Maps Quiz" module dynamically
        quiz_module = Module.query.filter_by(
            title="Hash Maps Quiz", unit_id=hashmaps_unit.id
        ).first()
        if quiz_module:
            # Add quiz questions and options
            quiz_questions_data = [
                {
                    "module_id": quiz_module.id,
                    "title": "What is a Hash Map?",
                    "options": [
                        {
                            "option_text": "A data structure that maps keys to values",
                            "is_correct": True,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "A type of array",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "A sorting algorithm",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                    ],
                },
                {
                    "module_id": quiz_module.id,
                    "title": "What is the time complexity of searching in a Hash Map?",
                    "options": [
                        {
                            "option_text": "O(1)",
                            "is_correct": True,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "O(n)",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "O(log n)",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                    ],
                },
                {
                    "module_id": quiz_module.id,
                    "title": "What is the time complexity of inserting in a Hash Map?",
                    "options": [
                        {
                            "option_text": "O(1)",
                            "is_correct": True,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "O(n)",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "O(log n)",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                    ],
                },
                {
                    "module_id": quiz_module.id,
                    "title": "What kind of hash function minimizes collisions in a hash table?",
                    "options": [
                        {
                            "option_text": "A function that returns a constant value.",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "A function that evenly distributes keys across all array indices.",
                            "is_correct": True,
                            "option_type": "CONCEPT",
                        },
                        {
                            "option_text": "A function that increases linearly with the number of entries.",
                            "is_correct": False,
                            "option_type": "CONCEPT",
                        },
                    ],
                },
            ]

            quiz_questions_to_add = add_quiz_questions(
                quiz_module.id, quiz_questions_data
            )
            bulk_insert(quiz_questions_to_add)

        # Add badges
        add_badges()
        # add goals
        add_goals()
        add_hints()

        # hardcode some user badges for testing
        # bulk_insert(add_user_badges(1))

        logger.info("Database seeded successfully.")


if __name__ == "__main__":
    seed_data()
