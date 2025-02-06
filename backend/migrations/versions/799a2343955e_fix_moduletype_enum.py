"""Fix ModuleType enum

Revision ID: 799a2343955e
Revises: 65e049e2083e
Create Date: 2025-02-01 16:05:07.853996

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "799a2343955e"
down_revision = "65e049e2083e"
branch_labels = None
depends_on = None

# Define the old and new enum types
old_module_type = sa.Enum(
    "concept_guide",
    "python_guide",
    "recognition_guide",
    "quiz",
    "challenge",
    "solution_guide",
    "bonus_challenge",
    "bonus_solution_guide",
    name="moduletype",
)
new_module_type = sa.Enum(
    "CONCEPT_GUIDE",
    "PYTHON_GUIDE",
    "RECOGNITION_GUIDE",
    "QUIZ",
    "CHALLENGE",
    "CHALLENGE_SOLUTION",
    "BONUS_CHALLENGE",
    "BONUS_SOLUTION",
    name="moduletype",
)


def upgrade():
    # Create a temporary column to hold the new enum values
    with op.batch_alter_table("modules", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("module_type_temp", new_module_type, nullable=True)
        )

    # Map old values to new values
    mapping = {
        "concept_guide": "CONCEPT_GUIDE",
        "python_guide": "PYTHON_GUIDE",
        "recognition_guide": "RECOGNITION_GUIDE",
        "quiz": "QUIZ",
        "challenge": "CHALLENGE",
        "solution_guide": "CHALLENGE_SOLUTION",
        "bonus_challenge": "BONUS_CHALLENGE",
        "bonus_solution_guide": "BONUS_SOLUTION",
    }

    # Update the temporary column with the new enum values
    for old_value, new_value in mapping.items():
        op.execute(
            f"UPDATE modules SET module_type_temp = '{new_value}' WHERE module_type = '{old_value}'"
        )

    # Create a new table with the updated schema
    with op.batch_alter_table("modules", schema=None) as batch_op:
        batch_op.drop_column("module_type")
        batch_op.alter_column(
            "module_type_temp",
            new_column_name="module_type",
            existing_type=new_module_type,
            nullable=False,
        )

    # Drop the old enum type
    old_module_type.drop(op.get_bind(), checkfirst=False)


def downgrade():
    # Create a temporary column to hold the old enum values
    with op.batch_alter_table("modules", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("module_type_temp", old_module_type, nullable=True)
        )

    # Map new values to old values
    mapping = {
        "CONCEPT_GUIDE": "concept_guide",
        "PYTHON_GUIDE": "python_guide",
        "RECOGNITION_GUIDE": "recognition_guide",
        "QUIZ": "quiz",
        "CHALLENGE": "challenge",
        "CHALLENGE_SOLUTION": "solution_guide",
        "BONUS_CHALLENGE": "bonus_challenge",
        "BONUS_SOLUTION": "bonus_solution_guide",
    }

    # Update the temporary column with the old enum values
    for new_value, old_value in mapping.items():
        op.execute(
            f"UPDATE modules SET module_type_temp = '{old_value}' WHERE module_type = '{new_value}'"
        )

    # Create a new table with the updated schema
    with op.batch_alter_table("modules", schema=None) as batch_op:
        batch_op.drop_column("module_type")
        batch_op.alter_column(
            "module_type_temp",
            new_column_name="module_type",
            existing_type=old_module_type,
            nullable=False,
        )

    # Drop the new enum type
    new_module_type.drop(op.get_bind(), checkfirst=False)
