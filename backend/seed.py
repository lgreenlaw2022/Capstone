import yaml
from datetime import datetime, timezone
from app import create_app
from models import (
    Goal,
    Hint,
    TestCase,
    TestCaseOutput,
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
from enums import (
    MetricType,
    ModuleType,
    BadgeType,
    EventType,
    TimePeriodType,
    RuntimeValues,
)
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

app = create_app()


def load_yaml(file_path):
    with open(file_path) as file:
        return yaml.safe_load(file)


def load_goals():
    data = load_yaml("seed_data/goals.yaml")
    for goal in data["goals"]:
        new_goal = Goal(
            title=goal["title"],
            metric=MetricType[goal["metric"]],
            requirement=goal["requirement"],
            time_period=TimePeriodType[goal["time_period"]],
        )
        db.session.add(new_goal)
    db.session.commit()  # NOTE: can optimize to bulk inserts if efficiency becomes a problem
    logger.info("Goals loaded successfully.")


def load_badges():
    data = load_yaml("seed_data/badges.yaml")
    for badge in data["badges"]:
        new_badge = Badge(
            title=badge["title"],
            description=badge["description"],
            type=BadgeType[badge["type"]],
            criteria_expression=badge["criteria_expression"],
            event_type=EventType[badge["event_type"]],
        )
        db.session.add(new_badge)
    db.session.commit()
    logger.info("Badges loaded successfully.")


def load_units():
    data = load_yaml("seed_data/units.yaml")["units"]
    units_to_add = []
    for unit_data in data:
        unit = Unit(
            title=unit_data["title"],
            order=unit_data["order"],
            course_id=unit_data["course_id"],
        )
        units_to_add.append(unit)

    db.session.bulk_save_objects(units_to_add)
    db.session.commit()
    logger.info("Units loaded successfully.")


def load_modules():
    # Load units and create a mapping of unit titles to unit IDs
    units = Unit.query.all()
    unit_title_to_id = {unit.title: unit.id for unit in units}

    data = load_yaml("seed_data/modules.yaml")["modules"]
    modules_to_add = []
    for module_data in data:
        unit_id = unit_title_to_id.get(module_data["unit_title"])
        if unit_id:
            module = Module(
                unit_id=unit_id,
                title=module_data["title"],
                order=module_data["order"],
                module_type=ModuleType[module_data["module_type"]],
            )
            modules_to_add.append(module)
        else:
            logger.error(f"Unit with title {module_data['unit_title']} not found.")
    db.session.bulk_save_objects(modules_to_add)
    db.session.commit()
    logger.info("Modules loaded successfully.")


def load_quiz_questions():
    # Load modules and create a mapping of module titles to module IDs
    modules = Module.query.all()
    module_title_to_id = {module.title: module.id for module in modules}

    data = load_yaml("seed_data/quiz_questions.yaml")["quiz_questions"]
    for question_data in data:
        module_id = module_title_to_id.get(question_data["module_title"])
        if module_id:
            question = QuizQuestion(module_id=module_id, title=question_data["title"])
            db.session.add(question)
            db.session.flush()  # Ensure the question id is available for options data

            for option in question_data["options"]:
                quiz_question_option = QuizQuestionOption(
                    question_id=question.id,
                    option_text=option["option_text"],
                    is_correct=option["is_correct"],
                    option_type=option["option_type"],
                )
                db.session.add(quiz_question_option)
        else:
            logger.error(
                f"Module with title {question_data['module_title']} not found."
            )
    db.session.commit()
    logger.info("Quiz questions loaded successfully.")


def load_hints():
    # Load modules with BONUS_CHALLENGE and CHALLENGE types and create a mapping of module titles to module IDs
    modules = (
        db.session.query(Module)
        .filter(
            Module.module_type.in_([ModuleType.BONUS_CHALLENGE, ModuleType.CHALLENGE])
        )
        .all()
    )
    module_title_to_id = {module.title: module.id for module in modules}

    data = load_yaml("seed_data/hints.yaml")["hints"]
    hints_to_add = []
    for module_data in data:
        module_id = module_title_to_id.get(module_data["module_title"])
        if module_id:
            for hint in module_data["hints"]:
                hint_instance = Hint(
                    module_id=module_id,
                    text=hint["text"],
                    order=hint["order"],
                )
                hints_to_add.append(hint_instance)
        else:
            logger.error(f"Module with title {module_data['module_title']} not found.")

    db.session.bulk_save_objects(hints_to_add)
    db.session.commit()
    logger.info("Hints loaded successfully.")


def load_code_checks():
    # Load modules with BONUS_CHALLENGE and CHALLENGE types and create a mapping of module titles to modules
    modules = (
        db.session.query(Module)
        .filter(
            Module.module_type.in_([ModuleType.BONUS_CHALLENGE, ModuleType.CHALLENGE])
        )
        .all()
    )
    module_title_to_module = {module.title: module for module in modules}

    data = load_yaml("seed_data/test_cases.yaml")["test_cases"]
    test_cases_to_add = []
    test_case_outputs_to_add = []
    for module_data in data:
        module = module_title_to_module.get(module_data["module_title"])
        if module:
            module.target_runtime = RuntimeValues[module_data.get("target_runtime")]
            for test_case in module_data["test_cases"]:
                test_case_instance = TestCase(
                    module_id=module.id,
                    input=test_case["input"],
                    # output=test_case["output"],
                )
                test_cases_to_add.append(test_case_instance)
                db.session.add(test_case_instance)
                db.session.flush()  # Ensure the test case id is available for outputs data

                # add outputs for each test case
                outputs = test_case["outputs"]
                for output in outputs:
                    test_case_output_instance = TestCaseOutput(
                        test_case_id=test_case_instance.id,
                        output=output,
                    )
                    test_case_outputs_to_add.append(test_case_output_instance)
        else:
            logger.error(f"Module with title {module_data['module_title']} not found.")

    db.session.bulk_save_objects(test_case_outputs_to_add)
    db.session.commit()
    logger.info("Code checks loaded successfully.")


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
        logger.info("Dropping all tables...")
        db.drop_all()
        logger.info("Creating all tables...")
        db.create_all()
        logger.info("Database reset complete")

        # Check if the course already exists
        course = Course.query.filter_by(title="Technical Interview Prep").first()
        if not course:
            course = Course(title="Technical Interview Prep")
            db.session.add(course)
            db.session.commit()

        logger.info("Seeding badges...")
        load_badges()

        logger.info("Seeding goals...")
        load_goals()

        logger.info("Seeding units...")
        load_units()

        logger.info("Seeding modules...")
        load_modules()

        logger.info("Seeding quiz questions...")
        load_quiz_questions()

        logger.info("Seeding hints...")
        load_hints()

        logger.info("Seeding code checks...")
        load_code_checks()

        logger.info("Database seeded successfully.")


if __name__ == "__main__":
    seed_data()
