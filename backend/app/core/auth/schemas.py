"""
Enterprise Authentication Schemas with FastAPI-Users integration
"""
import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator, Field
from fastapi_users import schemas


class UserRead(schemas.BaseUser[uuid.UUID]):
    """
    Schema for reading user data (API responses)
    Extends FastAPI-Users BaseUser with business fields
    """
    first_name: str
    last_name: str
    role_id: Optional[int] = None
    country_id: Optional[int] = None  # Backward compatibility
    category_id: Optional[int] = None  # Backward compatibility
    last_login: Optional[datetime] = None
    login_attempts: int = 0
    is_account_locked: bool = False
    
    # Computed fields
    full_name: str
    country_ids: List[int] = []
    category_ids: List[int] = []
    
    # Role helpers
    is_admin: bool
    is_user: bool
    is_commercial: bool
    
    class Config:
        from_attributes = True


class UserCreate(schemas.BaseUserCreate):
    """
    Schema for creating new users
    Enhanced with business validation rules
    """
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    role_id: int = Field(..., gt=0)
    country_id: Optional[int] = Field(None, gt=0)
    category_id: Optional[int] = Field(None, gt=0)
    
    @validator('email')
    def validate_email_domain(cls, v):
        """Validate email domain for enterprise security"""
        # Add your company domain restrictions if needed
        allowed_domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com']  # Configure as needed
        domain = v.split('@')[1].lower()
        # For now, allow all domains but you can restrict
        return v
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Enforce strong password policy"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')  
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        """Validate name format"""
        if not v.replace(' ', '').replace('-', '').replace("'", '').isalpha():
            raise ValueError('Name can only contain letters, spaces, hyphens and apostrophes')
        return v.title()


class UserUpdate(schemas.BaseUserUpdate):
    """
    Schema for updating user data  
    Allows partial updates with validation
    """
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role_id: Optional[int] = Field(None, gt=0)
    country_id: Optional[int] = Field(None, gt=0)
    category_id: Optional[int] = Field(None, gt=0)
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        """Validate name format if provided"""
        if v is not None:
            if not v.replace(' ', '').replace('-', '').replace("'", '').isalpha():
                raise ValueError('Name can only contain letters, spaces, hyphens and apostrophes')
            return v.title()
        return v


class UserAssignCountries(BaseModel):
    """Schema for assigning countries to users"""
    country_ids: List[int] = Field(..., min_items=1)
    
    @validator('country_ids')
    def validate_country_ids(cls, v):
        """Ensure all country IDs are positive"""
        for country_id in v:
            if country_id <= 0:
                raise ValueError('All country IDs must be positive integers')
        return list(set(v))  # Remove duplicates


class UserAssignCategories(BaseModel):
    """Schema for assigning categories to users"""
    category_ids: List[int] = Field(..., min_items=1)
    
    @validator('category_ids')
    def validate_category_ids(cls, v):
        """Ensure all category IDs are positive"""
        for category_id in v:
            if category_id <= 0:
                raise ValueError('All category IDs must be positive integers')
        return list(set(v))  # Remove duplicates


class LoginRequest(BaseModel):
    """Enhanced login request with security tracking"""
    email: EmailStr
    password: str
    remember_me: bool = False
    device_info: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "email": "admin@example.com",
                "password": "SecurePass123!",
                "remember_me": False,
                "device_info": "Chrome on Windows"
            }
        }


class LoginResponse(BaseModel):
    """Enhanced login response with user data"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
    permissions: List[str] = []
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer", 
                "expires_in": 3600,
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "admin@example.com",
                    "first_name": "Admin",
                    "last_name": "User",
                    "is_active": True,
                    "is_verified": True,
                    "is_admin": True
                },
                "permissions": ["users:read", "products:write", "reports:read"]
            }
        }


class PasswordChangeRequest(BaseModel):
    """Schema for password change requests"""
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('new_password')
    def validate_new_password_strength(cls, v):
        """Enforce strong password policy for new passwords"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Ensure password confirmation matches"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class UserSessionInfo(BaseModel):
    """Schema for user session information"""
    session_id: str
    ip_address: Optional[str]
    user_agent: Optional[str] 
    last_activity: datetime
    expires_at: datetime
    is_active: bool
    is_current: bool = False
    
    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """Complete user profile with all related data"""
    user: UserRead
    role: Optional[dict] = None
    countries: List[dict] = []
    categories: List[dict] = []
    active_sessions: List[UserSessionInfo] = []
    recent_activity: List[dict] = []
    
    class Config:
        from_attributes = True


class AuditLogEntry(BaseModel):
    """Schema for audit log entries"""
    id: int
    user_id: Optional[uuid.UUID]
    action: str
    resource: Optional[str]
    resource_id: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    details: Optional[str]
    created_at: datetime
    
    # User info
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class SecuritySettings(BaseModel):
    """Schema for security settings configuration"""
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    session_timeout_minutes: int = 60
    require_password_change_days: int = 90
    min_password_length: int = 8
    require_two_factor: bool = False
    
    class Config:
        schema_extra = {
            "example": {
                "max_login_attempts": 5,
                "lockout_duration_minutes": 30,
                "session_timeout_minutes": 60,
                "require_password_change_days": 90,
                "min_password_length": 8,
                "require_two_factor": False
            }
        }