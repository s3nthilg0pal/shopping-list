from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


# --- Shopping Item Schemas ---
class ShoppingItemBase(BaseModel):
    name: str


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    checked: Optional[bool] = None


class ShoppingItemResponse(ShoppingItemBase):
    id: int
    checked: bool
    shopping_list_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Shopping List Schemas ---
class ShoppingListBase(BaseModel):
    name: str


class ShoppingListCreate(ShoppingListBase):
    items: list[ShoppingItemCreate] = []


class ShoppingListUpdate(BaseModel):
    name: Optional[str] = None


class ShoppingListResponse(ShoppingListBase):
    id: int
    date: date
    created_at: datetime
    updated_at: datetime
    items: list[ShoppingItemResponse] = []

    class Config:
        from_attributes = True


class ShoppingListSummary(ShoppingListBase):
    id: int
    date: date
    item_count: int
    checked_count: int

    class Config:
        from_attributes = True
