from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserInfo"

class UserInfo(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    full_name: str
    role: str
    country: Optional[str] = None  # País principal (backward compatibility)
    category: Optional[str] = None
    last_login: Optional[datetime] = None
    # Nuevos campos para múltiples países
    country_ids: List[int] = []
    country_codes: List[str] = []
    assigned_countries: List[str] = []  # Nombres de países asignados
    
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    country_id: Optional[int] = None
    category_id: Optional[int] = None
    country_ids: List[int] = []  # Nuevos países asignados

# Actualizar referencia forward
LoginResponse.model_rebuild()