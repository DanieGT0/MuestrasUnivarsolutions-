# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CountryBase(BaseModel):
    name: str
    code: str
    is_active: bool = True

class CountryCreate(CountryBase):
    pass

class CountryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None

class CountryResponse(CountryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AvailableCountriesResponse(BaseModel):
    countries: List[CountryResponse]
    
    class Config:
        from_attributes = True