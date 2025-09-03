"""
Enterprise Authentication Routes with FastAPI-Users integration
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy

from app.core.auth.database import get_user_db
from app.core.auth.manager import get_user_manager, UserManager
from app.core.auth.models import User
from app.core.auth.schemas import (
    UserRead, UserCreate, UserUpdate, UserAssignCountries, UserAssignCategories,
    LoginResponse, PasswordChangeRequest, UserProfile, SecuritySettings
)
from app.config.settings import settings


# Authentication configuration
bearer_transport = BearerTransport(tokenUrl="auth/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.SECRET_KEY, lifetime_seconds=3600)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPI-Users instance
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

# Get current user dependencies
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)

# Create routers
auth_router = fastapi_users.get_auth_router(auth_backend)
users_router = fastapi_users.get_users_router(UserRead, UserUpdate)
register_router = fastapi_users.get_register_router(UserRead, UserCreate)

# Custom enhanced router for additional functionality
enhanced_auth_router = APIRouter(prefix="/auth", tags=["Enhanced Authentication"])


@enhanced_auth_router.post("/login", response_model=LoginResponse)
async def enhanced_login(
    request: Request,
    credentials: dict,
    user_manager: UserManager = Depends(get_user_manager)
):
    """
    Enhanced login with additional user data and permissions
    """
    user = await user_manager.authenticate(credentials, request)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive"
        )
    
    if user.is_account_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account is locked due to too many failed login attempts"
        )
    
    # Generate JWT token
    strategy = get_jwt_strategy()
    token = await strategy.write_token(user)
    
    # Get user permissions
    permissions = await _get_user_permissions(user)
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=3600,
        user=UserRead.from_orm(user),
        permissions=permissions
    )


@enhanced_auth_router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    request: Request,
    current_user: User = Depends(current_active_user),
    user_manager: UserManager = Depends(get_user_manager)
):
    """
    Change user password with validation
    """
    # Verify current password
    if not user_manager.password_helper.verify_and_update(
        password_data.current_password, 
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    # Update password
    await user_manager.update(
        UserUpdate(password=password_data.new_password),
        current_user,
        request=request
    )
    
    return {"message": "Password changed successfully"}


@enhanced_auth_router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(current_active_user)
):
    """
    Get complete user profile with related data
    """
    # This would include relationships loaded from database
    profile_data = {
        "user": UserRead.from_orm(current_user),
        "role": current_user.role.__dict__ if current_user.role else None,
        "countries": [country.__dict__ for country in current_user.assigned_countries],
        "categories": [category.__dict__ for category in current_user.assigned_categories],
        "active_sessions": [],  # Would load from UserSession table
        "recent_activity": []   # Would load from AuditLog table
    }
    
    return UserProfile(**profile_data)


# Enhanced user management router
enhanced_users_router = APIRouter(prefix="/users", tags=["Enhanced User Management"])


@enhanced_users_router.post("/{user_id}/assign-countries")
async def assign_countries_to_user(
    user_id: uuid.UUID,
    country_assignment: UserAssignCountries,
    current_user: User = Depends(current_superuser),
    user_manager: UserManager = Depends(get_user_manager)
):
    """
    Assign countries to a user (admin only)
    """
    # Get user
    user_db = Depends(get_user_db)
    target_user = await user_db.get(user_id)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Assign countries
    updated_user = await user_manager.assign_countries(
        target_user, 
        country_assignment.country_ids
    )
    
    return {"message": f"Assigned {len(country_assignment.country_ids)} countries to user"}


@enhanced_users_router.post("/{user_id}/assign-categories")
async def assign_categories_to_user(
    user_id: uuid.UUID,
    category_assignment: UserAssignCategories,
    current_user: User = Depends(current_superuser),
    user_manager: UserManager = Depends(get_user_manager)
):
    """
    Assign categories to a user (admin only)
    """
    # Get user
    user_db = Depends(get_user_db)
    target_user = await user_db.get(user_id)
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Assign categories
    updated_user = await user_manager.assign_categories(
        target_user,
        category_assignment.category_ids
    )
    
    return {"message": f"Assigned {len(category_assignment.category_ids)} categories to user"}


@enhanced_users_router.get("/me/permissions")
async def get_my_permissions(
    current_user: User = Depends(current_active_user)
):
    """
    Get current user's permissions
    """
    permissions = await _get_user_permissions(current_user)
    return {"permissions": permissions}


@enhanced_users_router.get("/security-settings", response_model=SecuritySettings)
async def get_security_settings(
    current_user: User = Depends(current_superuser)
):
    """
    Get security settings (admin only)
    """
    return SecuritySettings(
        max_login_attempts=5,
        lockout_duration_minutes=30,
        session_timeout_minutes=60,
        require_password_change_days=90,
        min_password_length=8,
        require_two_factor=False
    )


# Helper functions
async def _get_user_permissions(user: User) -> List[str]:
    """
    Get user permissions based on role and assignments
    """
    permissions = []
    
    if user.is_admin:
        permissions.extend([
            "users:read", "users:write", "users:delete",
            "products:read", "products:write", "products:delete",
            "movements:read", "movements:write", "movements:delete", 
            "reports:read", "reports:write",
            "settings:read", "settings:write"
        ])
    elif user.is_commercial:
        permissions.extend([
            "products:read", "products:write",
            "movements:read", "movements:write",
            "reports:read"
        ])
    elif user.is_user:
        permissions.extend([
            "products:read",
            "movements:read", "movements:write",
            "reports:read"
        ])
    
    # Add country-specific permissions
    if user.country_ids:
        for country_id in user.country_ids:
            permissions.append(f"country:{country_id}:access")
    
    # Add category-specific permissions  
    if user.category_ids:
        for category_id in user.category_ids:
            permissions.append(f"category:{category_id}:access")
    
    return permissions


def get_auth_routers():
    """
    Get all authentication routers
    """
    return [
        (auth_router, {"prefix": "/auth", "tags": ["Authentication"]}),
        (register_router, {"prefix": "/auth", "tags": ["Authentication"]}),
        (enhanced_auth_router, {}),
        (users_router, {"prefix": "/users", "tags": ["User Management"]}),
        (enhanced_users_router, {})
    ]