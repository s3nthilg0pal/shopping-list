"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-03-08
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shopping_lists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_shopping_lists_id"), "shopping_lists", ["id"], unique=False)

    op.create_table(
        "shopping_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("checked", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("shopping_list_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["shopping_list_id"], ["shopping_lists.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_shopping_items_id"), "shopping_items", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_shopping_items_id"), table_name="shopping_items")
    op.drop_table("shopping_items")
    op.drop_index(op.f("ix_shopping_lists_id"), table_name="shopping_lists")
    op.drop_table("shopping_lists")
