from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date, LargeBinary
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.sql import func
from app.database import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, server_default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("ShoppingItem", back_populates="shopping_list", cascade="all, delete-orphan")


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    checked = Column(Boolean, default=False)
    image_data = deferred(Column(LargeBinary, nullable=True))
    image_content_type = Column(String(50), nullable=True)
    shopping_list_id = Column(Integer, ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shopping_list = relationship("ShoppingList", back_populates="items")
