"""
Enterprise User Model with FastAPI-Users integration
Compatible with existing user structure while adding security features
"""
import uuid
from typing import Optional, List
from sqlalchemy import Boolean, String, Integer, ForeignKey, Table, Column, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from datetime import datetime

from app.models.base import BaseModel


# Many-to-many association tables (keeping existing structure)
user_countries_table = Table(
    'user_countries',
    BaseModel.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('country_id', Integer, ForeignKey('countries.id'), primary_key=True)
)

user_categories_table = Table(
    'user_categories', 
    BaseModel.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)


class User(SQLAlchemyBaseUserTableUUID, BaseModel):
    """
    Enterprise User model with FastAPI-Users integration
    Maintains compatibility with existing user structure
    """
    __tablename__ = "users"
    
    # FastAPI-Users required fields (already included in SQLAlchemyBaseUserTableUUID):
    # - id: UUID (primary key) 
    # - email: String (unique)
    # - hashed_password: String
    # - is_active: Boolean
    # - is_superuser: Boolean  
    # - is_verified: Boolean
    
    # Business fields (maintaining existing structure)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Role system (enhanced from existing)
    role_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("roles.id"), nullable=True)
    
    # Backward compatibility fields (to be deprecated gradually)
    country_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("countries.id"), nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    
    # Security enhancements
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Audit fields
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships (maintaining existing structure)
    role = relationship("Role", back_populates="users")
    country = relationship("Country", foreign_keys=[country_id])
    category = relationship("Category", foreign_keys=[category_id])
    
    # Many-to-many relationships (enhanced)
    assigned_countries = relationship(
        "Country",
        secondary=user_countries_table,
        back_populates="assigned_users"
    )
    assigned_categories = relationship(
        "Category", 
        secondary=user_categories_table,
        back_populates="assigned_users"
    )
    
    # Audit relationships
    created_by_user = relationship("User", foreign_keys=[created_by], remote_side="User.id")
    updated_by_user = relationship("User", foreign_keys=[updated_by], remote_side="User.id")
    
    # Business relationships
    movements = relationship("Movement", back_populates="user")
    
    @property
    def full_name(self) -> str:
        """Full name for display purposes"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def country_ids(self) -> List[int]:
        """Get assigned country IDs (optimized for caching)"""
        if hasattr(self, '_country_ids_cache'):
            return self._country_ids_cache
        
        ids = []
        # Include backward compatibility country
        if self.country_id:
            ids.append(self.country_id)
        # Include assigned countries
        if self.assigned_countries:
            ids.extend([country.id for country in self.assigned_countries])
        
        # Remove duplicates and cache
        self._country_ids_cache = list(set(ids))
        return self._country_ids_cache
    
    @property
    def category_ids(self) -> List[int]:
        """Get assigned category IDs (optimized for caching)"""
        if hasattr(self, '_category_ids_cache'):
            return self._category_ids_cache
            
        ids = []
        # Include backward compatibility category
        if self.category_id:
            ids.append(self.category_id)
        # Include assigned categories  
        if self.assigned_categories:
            ids.extend([category.id for category in self.assigned_categories])
        
        # Remove duplicates and cache
        self._category_ids_cache = list(set(ids))
        return self._category_ids_cache
    
    # Role-based permission helpers (maintaining existing interface)
    @property
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.is_superuser or (self.role and self.role.name.lower() == 'admin')
    
    @property
    def is_user(self) -> bool:
        """Check if user has regular user role"""
        return self.role and self.role.name.lower() == 'user'
    
    @property
    def is_commercial(self) -> bool:
        """Check if user has commercial role"""  
        return self.role and self.role.name.lower() in ['commercial', 'comercial']
    
    def has_permission(self, resource: str, action: str) -> bool:
        """
        Check if user has specific permission
        Integrates with existing role_permissions system
        """
        if self.is_superuser:
            return True
            
        # Import here to avoid circular imports
        from app.core.role_permissions import RolePermissions
        return RolePermissions.has_permission(self, resource, action)
    
    def can_access_country(self, country_id: int) -> bool:
        """Check if user can access specific country data"""
        if self.is_admin:
            return True
        return country_id in self.country_ids
    
    def can_access_category(self, category_id: int) -> bool:
        """Check if user can access specific category data"""
        if self.is_admin:
            return True
        return category_id in self.category_ids
    
    def record_login_attempt(self, success: bool = True):
        """Record login attempt for security tracking"""
        if success:
            self.last_login = datetime.utcnow()
            self.login_attempts = 0
            self.locked_until = None
        else:
            self.login_attempts += 1
            # Lock account after 5 failed attempts
            if self.login_attempts >= 5:
                from datetime import timedelta
                self.locked_until = datetime.utcnow() + timedelta(minutes=30)
    
    @property
    def is_account_locked(self) -> bool:
        """Check if account is locked due to failed login attempts"""
        if not self.locked_until:
            return False
        return datetime.utcnow() < self.locked_until
    
    def __repr__(self):
        return f"<User {self.email} - {self.full_name}>"


class UserSession(BaseModel):
    """Track active user sessions for security"""
    __tablename__ = "user_sessions"
    
    session_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv6 support
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_activity: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationship
    user = relationship("User")
    
    @property
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at
    
    def refresh(self, extend_minutes: int = 60):
        """Refresh session expiry"""
        from datetime import timedelta
        self.last_activity = datetime.utcnow()
        self.expires_at = datetime.utcnow() + timedelta(minutes=extend_minutes)
    
    def __repr__(self):
        return f"<UserSession {self.session_id[:8]}... - {self.user.email}>"


class AuditLog(BaseModel):
    """Audit trail for security and compliance"""
    __tablename__ = "audit_logs"
    
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # login, logout, create, update, delete
    resource: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # user, product, movement, etc.
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string with additional data
    
    # Relationship
    user = relationship("User")
    
    def __repr__(self):
        return f"<AuditLog {self.action} - {self.user.email if self.user else 'Anonymous'} - {self.created_at}>"