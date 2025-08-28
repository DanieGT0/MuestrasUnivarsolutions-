# -*- coding: utf-8 -*-
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user
    Note: This is a placeholder implementation
    """
    # For now, return a mock user to avoid authentication errors
    # In production, implement proper JWT token validation
    mock_user = User(
        id=1,
        email="admin@example.com",
        username="admin",
        is_active=True
    )
    return mock_user