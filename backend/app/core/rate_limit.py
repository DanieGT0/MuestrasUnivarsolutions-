# -*- coding: utf-8 -*-
"""
Rate limiting configuration for API endpoints
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
import time
from typing import Dict

# Simple in-memory storage for rate limiting
# In production, use Redis or similar
_failed_attempts: Dict[str, Dict[str, any]] = {}

def get_remote_address_with_forwarded(request: Request) -> str:
    """
    Get client IP address considering proxy headers
    """
    # Check for forwarded headers first (for production behind proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct connection
    return get_remote_address(request)

# Initialize limiter
limiter = Limiter(
    key_func=get_remote_address_with_forwarded,
    default_limits=["100/minute"]  # Default rate limit for all endpoints
)

def check_failed_login_attempts(client_ip: str) -> None:
    """
    Check if client has too many failed login attempts
    """
    current_time = time.time()
    
    # Clean old entries (older than 15 minutes)
    if client_ip in _failed_attempts:
        attempts = _failed_attempts[client_ip]
        if current_time - attempts.get("last_attempt", 0) > 900:  # 15 minutes
            del _failed_attempts[client_ip]
            return
        
        # Check if blocked
        if attempts.get("count", 0) >= 5:
            time_remaining = 900 - (current_time - attempts["last_attempt"])
            if time_remaining > 0:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Demasiados intentos de login fallidos. Intenta de nuevo en {int(time_remaining/60)} minutos."
                )

def record_failed_login_attempt(client_ip: str) -> None:
    """
    Record a failed login attempt
    """
    current_time = time.time()
    
    if client_ip not in _failed_attempts:
        _failed_attempts[client_ip] = {"count": 1, "last_attempt": current_time}
    else:
        _failed_attempts[client_ip]["count"] += 1
        _failed_attempts[client_ip]["last_attempt"] = current_time

def clear_failed_login_attempts(client_ip: str) -> None:
    """
    Clear failed login attempts for successful login
    """
    if client_ip in _failed_attempts:
        del _failed_attempts[client_ip]

# Rate limit exceeded handler
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom rate limit exceeded handler
    """
    response = _rate_limit_exceeded_handler(request, exc)
    return response