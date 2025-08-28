# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    product_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AvailableCategoriesResponse(BaseModel):
    categories: List[CategoryResponse]
    
    class Config:
        from_attributes = True