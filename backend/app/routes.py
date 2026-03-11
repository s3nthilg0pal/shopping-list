from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional

from app.database import get_db
from app.models import ShoppingList, ShoppingItem
from app.schemas import (
    ShoppingListCreate,
    ShoppingListUpdate,
    ShoppingListResponse,
    ShoppingListSummary,
    ShoppingItemCreate,
    ShoppingItemUpdate,
    ShoppingItemResponse,
)

router = APIRouter(prefix="/api", tags=["shopping"])


# --- Shopping Lists ---
@router.post("/lists", response_model=ShoppingListResponse, status_code=201)
def create_shopping_list(payload: ShoppingListCreate, db: Session = Depends(get_db)):
    shopping_list = ShoppingList(name=payload.name)
    for item_data in payload.items:
        shopping_list.items.append(ShoppingItem(name=item_data.name))
    db.add(shopping_list)
    db.commit()
    db.refresh(shopping_list)
    return shopping_list


@router.get("/lists", response_model=list[ShoppingListSummary])
def get_shopping_lists(
    date_filter: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(
        ShoppingList.id,
        ShoppingList.name,
        ShoppingList.date,
        func.count(ShoppingItem.id).label("item_count"),
        func.count(ShoppingItem.id).filter(ShoppingItem.checked == True).label("checked_count"),
    ).outerjoin(ShoppingItem).group_by(ShoppingList.id)

    if date_filter:
        query = query.filter(ShoppingList.date == date_filter)

    query = query.order_by(ShoppingList.date.desc(), ShoppingList.created_at.desc())
    results = query.all()

    return [
        ShoppingListSummary(
            id=r.id, name=r.name, date=r.date,
            item_count=r.item_count, checked_count=r.checked_count,
        )
        for r in results
    ]


@router.get("/lists/dates", response_model=list[date])
def get_available_dates(db: Session = Depends(get_db)):
    """Return all distinct dates that have shopping lists, newest first."""
    results = (
        db.query(ShoppingList.date)
        .distinct()
        .order_by(ShoppingList.date.desc())
        .all()
    )
    return [r.date for r in results]


@router.get("/lists/{list_id}", response_model=ShoppingListResponse)
def get_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    return shopping_list


@router.put("/lists/{list_id}", response_model=ShoppingListResponse)
def update_shopping_list(list_id: int, payload: ShoppingListUpdate, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    if payload.name is not None:
        shopping_list.name = payload.name
    db.commit()
    db.refresh(shopping_list)
    return shopping_list


@router.delete("/lists/{list_id}", status_code=204)
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    db.delete(shopping_list)
    db.commit()


# --- Shopping Items ---
@router.post("/lists/{list_id}/items", response_model=ShoppingItemResponse, status_code=201)
def add_item(list_id: int, payload: ShoppingItemCreate, db: Session = Depends(get_db)):
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    item = ShoppingItem(name=payload.name, shopping_list_id=list_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/lists/{list_id}/items/{item_id}", response_model=ShoppingItemResponse)
def update_item(list_id: int, item_id: int, payload: ShoppingItemUpdate, db: Session = Depends(get_db)):
    item = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.id == item_id, ShoppingItem.shopping_list_id == list_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if payload.name is not None:
        item.name = payload.name
    if payload.checked is not None:
        item.checked = payload.checked
    db.commit()
    db.refresh(item)
    return item


@router.delete("/lists/{list_id}/items/{item_id}", status_code=204)
def delete_item(list_id: int, item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.id == item_id, ShoppingItem.shopping_list_id == list_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()


# --- Item Images ---
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/lists/{list_id}/items/{item_id}/image", response_model=ShoppingItemResponse, status_code=200)
async def upload_item_image(
    list_id: int,
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    item = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.id == item_id, ShoppingItem.shopping_list_id == list_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {file.content_type}")
    data = await file.read()
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 5 MB limit")
    item.image_data = data
    item.image_content_type = file.content_type
    db.commit()
    db.refresh(item)
    return item


@router.get("/lists/{list_id}/items/{item_id}/image")
def get_item_image(list_id: int, item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.id == item_id, ShoppingItem.shopping_list_id == list_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not item.image_data:
        raise HTTPException(status_code=404, detail="No image for this item")
    return Response(content=item.image_data, media_type=item.image_content_type)


@router.delete("/lists/{list_id}/items/{item_id}/image", response_model=ShoppingItemResponse)
def delete_item_image(list_id: int, item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.id == item_id, ShoppingItem.shopping_list_id == list_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.image_data = None
    item.image_content_type = None
    db.commit()
    db.refresh(item)
    return item
