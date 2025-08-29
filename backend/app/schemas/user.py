from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role_id: int
    country_ids: List[int] = []  # Lista de pa�ses asignados
    category_id: Optional[int] = None  # Solo para usuarios comerciales
    
    @validator('country_ids')
    def validate_countries(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Al menos un pais debe ser asignado')
        return v
    
    @validator('category_id')
    def validate_category_for_commercial(cls, v, values):
        # Esta validaci�n se complementar� en el service layer
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    country_ids: Optional[List[int]] = None
    category_id: Optional[int] = None
    password: Optional[str] = None

class CountryInfo(BaseModel):
    id: int
    name: str
    code: str
    
    class Config:
        from_attributes = True
        orm_mode = True

class RoleInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
        orm_mode = True

class CategoryInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True
        orm_mode = True

class UserResponse(UserBase):
    id: int
    role: Optional[RoleInfo] = None
    assigned_countries: List[CountryInfo] = []
    category: Optional[CategoryInfo] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    full_name: str
    country_ids: List[int] = []
    country_codes: List[str] = []
    
    class Config:
        from_attributes = True
        orm_mode = True

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
    pages: int