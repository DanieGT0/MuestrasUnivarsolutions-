from fastapi import APIRouter

from .endpoints import users, reports, movements

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(movements.router, prefix="/movements", tags=["movements"])