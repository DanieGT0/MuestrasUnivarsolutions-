"""
Enterprise Database Configuration
Supports both sync and async operations for FastAPI-Users integration
"""
from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings


# === SYNC DATABASE CONFIGURATION (Existing) ===
# Crear motor de base de datos con configuración UTF-8
# Usar database_url property que maneja dev/prod automáticamente
engine = create_engine(
    settings.database_url,  # Cambiado para usar la property
    echo=settings.DEBUG,  # Mostrar SQL queries en desarrollo
    pool_pre_ping=True,   # Verificar conexión antes de usar
    pool_size=20,         # Increased connection pool
    max_overflow=30,      # Allow overflow connections
    pool_recycle=3600,    # Recycle connections after 1 hour
    connect_args={
        "check_same_thread": False
    } if settings.database_url.startswith("sqlite") else (
        {"sslmode": "require"} if "render.com" in settings.database_url else {
            "options": "-c client_encoding=utf8",
            "client_encoding": "utf8"
        }
    )
)

# Crear sesión (existing)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# === ASYNC DATABASE CONFIGURATION (New for FastAPI-Users) ===
# Convert sync URL to async URL 
async_database_url = settings.database_url
if async_database_url.startswith("postgresql://"):
    async_database_url = async_database_url.replace("postgresql://", "postgresql+asyncpg://")
elif async_database_url.startswith("sqlite"):
    async_database_url = async_database_url.replace("sqlite:///", "sqlite+aiosqlite:///")
async_database_url = async_database_url.replace("psycopg2", "asyncpg")

# Create async engine
async_engine = create_async_engine(
    async_database_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=30,
    pool_recycle=3600,
    # Async-specific config
    future=True,
    connect_args={
        "server_settings": {
            "client_encoding": "utf8",
        }
    } if "render.com" not in settings.database_url else {}
)

# Create async session maker
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# === DECLARATIVE BASE ===
Base = declarative_base()


# === SYNC SESSION DEPENDENCY (Existing) ===
def get_db():
    """Sync database session dependency (existing)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# === ASYNC SESSION DEPENDENCY (New for FastAPI-Users) ===
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Async database session dependency for FastAPI-Users"""
    async with async_session_maker() as session:
        yield session


# === DATABASE UTILITIES ===
class DatabaseManager:
    """Enterprise database manager with both sync and async support"""
    
    @staticmethod
    async def create_all_tables():
        """Create all tables using async engine"""
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    @staticmethod
    async def drop_all_tables():
        """Drop all tables using async engine (use with caution!)"""
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    
    @staticmethod
    async def check_connection():
        """Check database connection health"""
        try:
            async with async_session_maker() as session:
                await session.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"Database connection failed: {e}")
            return False
    
    @staticmethod
    def sync_create_all_tables():
        """Create all tables using sync engine (existing)"""
        Base.metadata.create_all(bind=engine)
    
    @staticmethod
    def sync_check_connection():
        """Check sync database connection"""
        try:
            with SessionLocal() as session:
                session.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"Sync database connection failed: {e}")
            return False


# === MIGRATION SUPPORT ===
def get_sync_engine():
    """Get sync engine for Alembic migrations"""
    return engine


def get_async_engine():
    """Get async engine for async operations"""
    return async_engine


# === CONNECTION MONITORING ===
def get_connection_info():
    """Get database connection information for monitoring"""
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "invalid": pool.invalid(),
        "overflow": pool.overflow(),
        "url": str(engine.url).replace(engine.url.password or "", "****")
    }