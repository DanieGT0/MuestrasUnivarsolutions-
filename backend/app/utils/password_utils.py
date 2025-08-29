# -*- coding: utf-8 -*-
from passlib.context import CryptContext

# Configurar contexto de hash de contrase�as
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Genera hash de contrase�a usando bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contrase�a contra hash"""
    return pwd_context.verify(plain_password, hashed_password)