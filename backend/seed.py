from app import create_app
from models import db, Unit, Course, Module
from enums import ModuleType
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

def bulk_insert(objects_to_add):
    if objects_to_add:
        db.session.bulk_save_objects(objects_to_add)
        db.session.commit()

def seed_data():
    with app.app_context():
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
            # Add more modules
        ]
        # Get the "Hash Maps" unit
        hashmaps_unit = Unit.query.filter_by(title="Hash Maps", course_id=course.id).first()

        # Add modules and perform bulk insert
        if hashmaps_unit:
            modules_to_add = add_modules(hashmaps_unit.id, hashmaps_modules)
            bulk_insert(modules_to_add)

        logger.info("Database seeded successfully.")


if __name__ == "__main__":
    seed_data()
