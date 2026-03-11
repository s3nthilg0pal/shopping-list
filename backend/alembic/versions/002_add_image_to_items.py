"""add image to shopping items

Revision ID: 002
Revises: 001
Create Date: 2026-03-11
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("shopping_items", sa.Column("image_data", sa.LargeBinary(), nullable=True))
    op.add_column("shopping_items", sa.Column("image_content_type", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("shopping_items", "image_content_type")
    op.drop_column("shopping_items", "image_data")
