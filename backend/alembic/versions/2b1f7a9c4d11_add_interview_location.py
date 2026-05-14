"""add interview location

Revision ID: 2b1f7a9c4d11
Revises: 6d660ccbf7ff
Create Date: 2026-05-14 18:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2b1f7a9c4d11"
down_revision: Union[str, None] = "6d660ccbf7ff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("interviews", sa.Column("location", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("interviews", "location")
