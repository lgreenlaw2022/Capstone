"""PostgreSQL enum fix

Revision ID: 799a2343955f
Revises: 4b77ac3913c1
Create Date: 2024-03-05 16:30:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "799a2343955f"
down_revision = "4b77ac3913c1"
branch_labels = None
depends_on = None


def upgrade():
    # Create a temporary string column
    op.add_column("modules", sa.Column("module_type_new", sa.String(50)))

    # Convert existing values to uppercase
    op.execute(
        """
        UPDATE modules 
        SET module_type_new = CASE 
            WHEN module_type::text = 'concept_guide' THEN 'CONCEPT_GUIDE'
            WHEN module_type::text = 'python_guide' THEN 'PYTHON_GUIDE'
            WHEN module_type::text = 'recognition_guide' THEN 'RECOGNITION_GUIDE'
            WHEN module_type::text = 'quiz' THEN 'QUIZ'
            WHEN module_type::text = 'challenge' THEN 'CHALLENGE'
            WHEN module_type::text = 'challenge_solution' THEN 'CHALLENGE_SOLUTION'
            WHEN module_type::text = 'bonus_challenge' THEN 'BONUS_CHALLENGE'
            WHEN module_type::text = 'bonus_solution' THEN 'BONUS_SOLUTION'
            ELSE upper(replace(module_type::text, ' ', '_'))
        END
    """
    )

    # Create the new enum type
    module_type = postgresql.ENUM(
        "CONCEPT_GUIDE",
        "PYTHON_GUIDE",
        "RECOGNITION_GUIDE",
        "QUIZ",
        "CHALLENGE",
        "CHALLENGE_SOLUTION",
        "BONUS_CHALLENGE",
        "BONUS_SOLUTION",
        name="moduletype",
        create_type=True,
    )
    module_type.create(op.get_bind())

    # Add the new column as nullable first
    op.add_column("modules", sa.Column("module_type_enum", module_type, nullable=True))

    # Copy the data
    op.execute("UPDATE modules SET module_type_enum = module_type_new::moduletype")

    # Now make it non-nullable
    op.alter_column("modules", "module_type_enum", nullable=False)

    # Drop the old columns
    op.drop_column("modules", "module_type_new")
    op.drop_column("modules", "module_type")

    # Rename the new column to module_type
    op.alter_column("modules", "module_type_enum", new_column_name="module_type")


def downgrade():
    # If needed to downgrade, convert back to string
    op.alter_column(
        "modules",
        "module_type",
        existing_type=postgresql.ENUM(
            "CONCEPT_GUIDE",
            "PYTHON_GUIDE",
            "RECOGNITION_GUIDE",
            "QUIZ",
            "CHALLENGE",
            "CHALLENGE_SOLUTION",
            "BONUS_CHALLENGE",
            "BONUS_SOLUTION",
            name="moduletype",
        ),
        type_=sa.String(50),
        postgresql_using="module_type::text",
    )

    # Drop the enum type
    op.execute("DROP TYPE moduletype")
