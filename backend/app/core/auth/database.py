"""
Database configuration for FastAPI-Users authentication
"""
import uuid
from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.auth.models import User
from app.config.database import get_async_session  # We'll create this


class Database:
    def __init__(self, database_url: str):
        self.engine = create_async_engine(database_url)
        self.async_session_maker = async_sessionmaker(self.engine, expire_on_commit=False)


# This will be configured in your main database config
# For now, we'll use the existing session
async def get_user_db(session: AsyncSession = Depends(get_async_session)) -> AsyncGenerator[SQLAlchemyUserDatabase, None]:
    """
    Get user database instance for FastAPI-Users
    """
    yield SQLAlchemyUserDatabase(session, User)