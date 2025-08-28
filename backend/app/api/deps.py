# -*- coding: utf-8 -*-
from typing import Generator
from app.config.database import SessionLocal

def get_db() -> Generator:
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()