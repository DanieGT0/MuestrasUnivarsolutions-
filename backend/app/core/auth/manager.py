"""
Enterprise User Manager with FastAPI-Users integration
Handles user lifecycle, security policies, and business logic
"""
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase

from app.core.auth.models import User, AuditLog, UserSession
from app.core.auth.schemas import UserCreate, UserUpdate
from app.core.auth.database import get_user_db
from app.config.settings import settings


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """
    Enterprise User Manager with enhanced security features
    """
    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY
    
    # Security policies
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = timedelta(minutes=30)
    SESSION_TIMEOUT = timedelta(hours=1)
    
    async def create(
        self,
        user_create: UserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        """
        Enhanced user creation with business validation and audit trail
        """
        # Validate role exists
        await self._validate_role_exists(user_create.role_id)
        
        # Check for duplicate email
        existing_user = await self.user_db.get_by_email(user_create.email)
        if existing_user:
            raise ValueError(f"User with email {user_create.email} already exists")
        
        # Create user with enhanced fields
        user_dict = user_create.dict()
        password = user_dict.pop("password")
        user_dict["hashed_password"] = self.password_helper.hash(password)
        user_dict["is_verified"] = False  # Require email verification in production
        
        # Create user
        user = User(**user_dict)
        user = await self.user_db.create(user)
        
        # Create audit log
        await self._create_audit_log(
            user_id=user.id,
            action="user_created",
            resource="user",
            resource_id=str(user.id),
            details=f"User created: {user.email}",
            request=request
        )
        
        await self.on_after_register(user, request)
        return user
    
    async def update(
        self,
        user_update: UserUpdate,
        user: User,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        """
        Enhanced user update with validation and audit trail
        """
        update_dict = user_update.dict(exclude_unset=True)
        
        # Validate role if being updated
        if "role_id" in update_dict:
            await self._validate_role_exists(update_dict["role_id"])
        
        # Hash password if being updated
        if "password" in update_dict:
            password = update_dict.pop("password")
            update_dict["hashed_password"] = self.password_helper.hash(password)
        
        # Update user
        updated_user = await self.user_db.update(user, update_dict)
        
        # Create audit log
        await self._create_audit_log(
            user_id=user.id,
            action="user_updated", 
            resource="user",
            resource_id=str(user.id),
            details=f"User updated: {user.email}. Fields: {list(update_dict.keys())}",
            request=request
        )
        
        return updated_user
    
    async def delete(self, user: User, request: Optional[Request] = None) -> None:
        """
        Soft delete user with audit trail
        """
        # Soft delete - just deactivate
        await self.user_db.update(user, {"is_active": False})
        
        # Create audit log
        await self._create_audit_log(
            user_id=user.id,
            action="user_deleted",
            resource="user", 
            resource_id=str(user.id),
            details=f"User deactivated: {user.email}",
            request=request
        )
    
    async def authenticate(
        self, 
        credentials: Dict[str, Any],
        request: Optional[Request] = None
    ) -> Optional[User]:
        """
        Enhanced authentication with security policies
        """
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            return None
        
        # Get user by email
        user = await self.user_db.get_by_email(email)
        if not user:
            # Log failed attempt for non-existent user
            await self._create_audit_log(
                action="login_failed",
                details=f"Login attempt for non-existent email: {email}",
                request=request
            )
            return None
        
        # Check if account is locked
        if user.is_account_locked:
            await self._create_audit_log(
                user_id=user.id,
                action="login_blocked",
                details=f"Login blocked - account locked: {email}",
                request=request
            )
            return None
        
        # Check if account is active
        if not user.is_active:
            await self._create_audit_log(
                user_id=user.id,
                action="login_blocked", 
                details=f"Login blocked - account inactive: {email}",
                request=request
            )
            return None
        
        # Verify password
        verified = self.password_helper.verify_and_update(password, user.hashed_password)
        if not verified:
            # Record failed login attempt
            user.record_login_attempt(success=False)
            await self.user_db.update(user, {
                "login_attempts": user.login_attempts,
                "locked_until": user.locked_until
            })
            
            await self._create_audit_log(
                user_id=user.id,
                action="login_failed",
                details=f"Invalid password for: {email}. Attempts: {user.login_attempts}",
                request=request
            )
            return None
        
        # Successful authentication
        user.record_login_attempt(success=True)
        await self.user_db.update(user, {
            "last_login": user.last_login,
            "login_attempts": user.login_attempts,
            "locked_until": user.locked_until
        })
        
        # Create user session
        await self._create_user_session(user, request)
        
        await self._create_audit_log(
            user_id=user.id,
            action="login_success",
            details=f"Successful login: {email}",
            request=request
        )
        
        return user
    
    async def on_after_register(self, user: User, request: Optional[Request] = None):
        """Actions after user registration"""
        print(f"User {user.email} has registered.")
        
        # Send verification email in production
        # await self.send_verification_email(user, request)
    
    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        """Actions after forgot password request"""
        await self._create_audit_log(
            user_id=user.id,
            action="password_reset_requested",
            details=f"Password reset requested for: {user.email}",
            request=request
        )
        print(f"User {user.email} has forgot their password. Reset token: {token}")
    
    async def on_after_reset_password(self, user: User, request: Optional[Request] = None):
        """Actions after password reset"""
        await self._create_audit_log(
            user_id=user.id,
            action="password_reset_completed",
            details=f"Password reset completed for: {user.email}",
            request=request
        )
        print(f"User {user.email} has reset their password.")
    
    # Business methods
    async def assign_countries(self, user: User, country_ids: List[int]) -> User:
        """Assign countries to user"""
        # Validate countries exist
        from app.models.country import Country
        from sqlalchemy.orm import sessionmaker
        
        # This would need proper session handling - simplified for example
        # countries = await session.execute(
        #     select(Country).where(Country.id.in_(country_ids))
        # )
        # user.assigned_countries = countries.all()
        
        await self._create_audit_log(
            user_id=user.id,
            action="countries_assigned",
            resource="user",
            resource_id=str(user.id),
            details=f"Countries assigned to {user.email}: {country_ids}"
        )
        
        return user
    
    async def assign_categories(self, user: User, category_ids: List[int]) -> User:
        """Assign categories to user"""
        # Similar implementation to assign_countries
        await self._create_audit_log(
            user_id=user.id,
            action="categories_assigned",
            resource="user",
            resource_id=str(user.id),
            details=f"Categories assigned to {user.email}: {category_ids}"
        )
        
        return user
    
    # Security helper methods
    async def _validate_role_exists(self, role_id: int):
        """Validate that role exists"""
        from app.models.role import Role
        from sqlalchemy.orm import sessionmaker
        
        # This would need proper session handling - simplified for example
        # role = await session.get(Role, role_id)
        # if not role:
        #     raise ValueError(f"Role with ID {role_id} does not exist")
        pass  # Simplified for now
    
    async def _create_audit_log(
        self,
        action: str,
        user_id: Optional[uuid.UUID] = None,
        resource: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        request: Optional[Request] = None
    ):
        """Create audit log entry"""
        audit_data = {
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "resource_id": resource_id,
            "details": details,
            "ip_address": request.client.host if request and request.client else None,
            "user_agent": request.headers.get("user-agent") if request else None
        }
        
        # This would need proper session handling - simplified for example
        # audit_log = AuditLog(**audit_data)
        # session.add(audit_log)
        # await session.commit()
        
        # For now, just log to console
        print(f"AUDIT: {action} - User: {user_id} - {details}")
    
    async def _create_user_session(self, user: User, request: Optional[Request] = None):
        """Create user session for tracking"""
        session_data = {
            "session_id": str(uuid.uuid4()),
            "user_id": user.id,
            "ip_address": request.client.host if request and request.client else None,
            "user_agent": request.headers.get("user-agent") if request else None,
            "last_activity": datetime.utcnow(),
            "expires_at": datetime.utcnow() + self.SESSION_TIMEOUT
        }
        
        # This would need proper session handling - simplified for example
        # session = UserSession(**session_data)
        # db_session.add(session)
        # await db_session.commit()
        
        print(f"SESSION: Created for user {user.email} - {session_data['session_id']}")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    """Dependency to get user manager instance"""
    yield UserManager(user_db)