from app import create_app
from models import (
    db,
    Unit,
    Course,
    Module,
    QuizQuestion,
    QuizQuestionOption,
    UserModule,
)
from enums import ModuleType, QuizType
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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
                order=module_data["order"],
                module_type=module_data["module_type"],
            )
            modules_to_add.append(module)
    return modules_to_add


def add_modules_to_user_1(user_id, unit_id):
    if user_id:
        # Fetch the modules
        concept_guide_module = Module.query.filter_by(
            title="Hash Maps", unit_id=unit_id
        ).first()
        quiz_module = Module.query.filter_by(
            title="Hash Maps Quiz", unit_id=unit_id
        ).first()

        # Create UserModule entries
        user_modules_to_add = []
        if concept_guide_module:
            user_modules_to_add.append(
                UserModule(
                    user_id=user_id,
                    module_id=concept_guide_module.id,
                )
            )

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
            db.session.flush()  # Ensure the question ID is available for options

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


def bulk_insert(objects_to_add):
    if objects_to_add:
        db.session.bulk_save_objects(objects_to_add)
        db.session.commit()


def clear_user_modules():
    db.session.query(UserModule).delete()
    db.session.commit()


def seed_data():
    with app.app_context():

        # Clear the user_modules table
        clear_user_modules()
        # db.session.query(QuizQuestion).delete()
        # db.session.commit()
        # db.session.query(QuizQuestionOption).delete()
        # db.session.commit()

        # Check if the course already exists
        course = Course.query.filter_by(title="Technical Interview Prep").first()
        if not course:
            course = Course(title="Technical Interview Prep")
            db.session.add(course)
            db.session.commit()

        # Add units to the course
        units = [
            {"title": "Hash Maps", "order": 1},
            # Add more units
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
            # Add more modules
        ]
        # Get the "Hash Maps" unit
        hashmaps_unit = Unit.query.filter_by(
            title="Hash Maps", course_id=course.id
        ).first()

        # Add modules and perform bulk insert
        if hashmaps_unit:
            modules_to_add = add_modules(hashmaps_unit.id, hashmaps_modules)
            bulk_insert(modules_to_add)
            # add the specific hashmap modules to userModule table so they are open
            userModules_to_add = add_modules_to_user_1(1, hashmaps_unit.id)
            bulk_insert(userModules_to_add)

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
            ]

            quiz_questions_to_add = add_quiz_questions(
                quiz_module.id, quiz_questions_data
            )
            bulk_insert(quiz_questions_to_add)

        logger.info("Database seeded successfully.")


if __name__ == "__main__":
    seed_data()
