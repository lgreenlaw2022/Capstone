"""increase quiz question title length and user password length

Revision ID: 799a2343955g
Revises: 799a2343955f
Create Date: 2024-03-05 16:50:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "799a2343955g"
down_revision = "799a2343955f"
branch_labels = None
depends_on = None


def upgrade():
    # Increase quiz question title length
    op.alter_column(
        "quiz_questions",
        "title",
        existing_type=sa.String(length=255),
        type_=sa.String(length=500),
        existing_nullable=False,
    )

    # Increase user password length
    op.alter_column(
        "users",
        "password",
        existing_type=sa.String(length=100),
        type_=sa.String(length=255),
        existing_nullable=False,
    )


def downgrade():
    # Decrease quiz question title length
    op.alter_column(
        "quiz_questions",
        "title",
        existing_type=sa.String(length=500),
        type_=sa.String(length=255),
        existing_nullable=False,
    )

    # Decrease user password length
    op.alter_column(
        "users",
        "password",
        existing_type=sa.String(length=255),
        type_=sa.String(length=100),
        existing_nullable=False,
    )
