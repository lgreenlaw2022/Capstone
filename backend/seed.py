from app import create_app
from models import db, Unit, Course, Module
from enums import ModuleType

app = create_app()


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

        for unit_data in units:
            unit = Unit.query.filter_by(
                title=unit_data["title"], course_id=course.id
            ).first()
            if not unit:
                unit = Unit(
                    course_id=course.id,
                    title=unit_data["title"],
                    order=unit_data["order"],
                )
                db.session.add(unit)

            # Add modules to the unit
            # TODO this won't work when I add more units
            modules = [
                {
                    "title": "Hash Maps",
                    "order": 1,
                    "module_type": ModuleType.CONCEPT_GUIDE,
                },
                # Add more modules
            ]

            for module_data in modules:
                module = Module.query.filter_by(
                    title=module_data["title"], unit_id=unit.id
                ).first()
                if not module:
                    module = Module(
                        unit_id=unit.id,
                        title=module_data["title"],
                        order=module_data["order"],
                        module_type=module_data["module_type"],
                    )
                    db.session.add(module)

        db.session.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    seed_data()
