"""Add date_assigned to UserGoal primary key

Revision ID: d65d4263d860
Revises: cf27bcdfcca9
Create Date: 2024-12-01 11:58:26.570786

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d65d4263d860"
down_revision = "cf27bcdfcca9"
branch_labels = None
depends_on = None


def upgrade():
    # Create a new table with the desired schema
    op.create_table(
        "user_goals_new",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("goal_id", sa.Integer(), nullable=False),
        sa.Column("date_assigned", sa.DateTime(), nullable=False),
        sa.Column("date_completed", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id", "goal_id", "date_assigned"),
    )

    # Copy data from the old table to the new table
    op.execute(
        "INSERT INTO user_goals_new (user_id, goal_id, date_assigned, date_completed) SELECT user_id, goal_id, date_assigned, date_completed FROM user_goals"
    )

    # Drop the old table
    op.drop_table("user_goals")

    # Rename the new table to the old table's name
    op.rename_table("user_goals_new", "user_goals")


def downgrade():
    # Create the original table
    op.create_table(
        "user_goals_old",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("goal_id", sa.Integer(), nullable=False),
        sa.Column("date_assigned", sa.DateTime(), nullable=False),
        sa.Column("date_completed", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id", "goal_id"),
    )

    # Copy data from the current table to the old table
    op.execute(
        "INSERT INTO user_goals_old (user_id, goal_id, date_assigned, date_completed) SELECT user_id, goal_id, date_assigned, date_completed FROM user_goals"
    )

    # Drop the current table
    op.drop_table("user_goals")

    # Rename the old table to the current table's name
    op.rename_table("user_goals_old", "user_goals")
