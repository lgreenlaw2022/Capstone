"""added criteria and event type to badge model

Revision ID: 15b4419563fb
Revises: 2acf22907e17
Create Date: 2024-11-10 15:50:46.096205

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '15b4419563fb'
down_revision = '2acf22907e17'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('badges', schema=None) as batch_op:
        batch_op.add_column(sa.Column('criteria_expression', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('event_type', sa.Enum('COMPLETE_MODULE', 'UNIT_COMPLETION', 'QUIZ_PERFECT_SCORE', 'STREAK_ACHIEVEMENT', name='eventtype'), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('badges', schema=None) as batch_op:
        batch_op.drop_column('event_type')
        batch_op.drop_column('criteria_expression')

    # ### end Alembic commands ###
