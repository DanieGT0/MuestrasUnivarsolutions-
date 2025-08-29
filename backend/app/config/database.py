from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings

# Crear motor de base de datos con configuración UTF-8
# Usar database_url property que maneja dev/prod automáticamente
engine = create_engine(
    settings.database_url,  # Cambiado para usar la property
    echo=settings.DEBUG,  # Mostrar SQL queries en desarrollo
    pool_pre_ping=True,   # Verificar conexión antes de usar
    connect_args={
        "sslmode": "require"
    } if "render.com" in settings.database_url else {
        "options": "-c client_encoding=utf8",
        "client_encoding": "utf8"
    }
)

# Crear sesión
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para modelos
Base = declarative_base()

# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()