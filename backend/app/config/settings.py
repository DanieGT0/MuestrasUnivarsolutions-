from pydantic import BaseSettings
from typing import Optional, List, Union
import json
import os

class Settings(BaseSettings):
    # Base de datos - SOLO para desarrollo local
    DATABASE_URL: str = os.getenv("DATABASE_URL_LOCAL", "postgresql://postgres:password@localhost:5432/muestras_univar")
    DATABASE_URL_PRODUCTION: Optional[str] = os.getenv("DATABASE_URL_PRODUCTION")
    
    # Configuración de zona horaria
    TIMEZONE: str = "America/El_Salvador"
    
    # Seguridad JWT - USAR VARIABLES DE ENTORNO EN PRODUCCIÓN
    SECRET_KEY: str = os.getenv("SECRET_KEY", "muestras-univar-secret-key-2025-development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Configuración de la aplicación
    PROJECT_NAME: str = "Muestras Univar API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False  # Cambiado a False por defecto para seguridad
    
    # CORS - Agregado para producción
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",  # React frontend local
        "http://127.0.0.1:3000",
        "http://localhost:8000",  # FastAPI docs local
        "https://muestras-univar-frontend.onrender.com",  # Frontend en Render
        "https://muestras-univar-api.onrender.com",  # Backend en Render para docs
    ]
    
    # Variables de entorno para producción
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Variable para forzar CORS (solo para desarrollo)
    CORS_ALLOW_ALL: bool = os.getenv("CORS_ALLOW_ALL", "false").lower() == "true"
    
    @property 
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from string or list"""
        # Verificar si hay orígenes de CORS personalizados desde variables de entorno
        custom_origins = os.getenv("BACKEND_CORS_ORIGINS")
        if custom_origins:
            try:
                # Intentar parsear como JSON
                return json.loads(custom_origins)
            except json.JSONDecodeError:
                # Si no es JSON, asumir que es una lista separada por comas
                return [origin.strip() for origin in custom_origins.split(",")]
        
        # Solo permitir todos los orígenes si está explícitamente habilitado
        if self.CORS_ALLOW_ALL:
            return ["*"]
            
        # Usar configuración por defecto
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                return json.loads(self.BACKEND_CORS_ORIGINS)
            except json.JSONDecodeError:
                return [self.BACKEND_CORS_ORIGINS]
        return self.BACKEND_CORS_ORIGINS
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Configuración de deployment
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    @property
    def database_url(self) -> str:
        """Get database URL based on environment"""
        # In production, try environment variables in order of preference
        if self.ENVIRONMENT == "production":
            # First try standard Render DATABASE_URL
            render_db_url = os.getenv("DATABASE_URL")
            if render_db_url:
                return render_db_url
            # Then try our custom production URL if it's a valid URL format
            if self.DATABASE_URL_PRODUCTION and self.DATABASE_URL_PRODUCTION.startswith("postgresql"):
                return self.DATABASE_URL_PRODUCTION
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

# Instancia global de configuración
settings = Settings()