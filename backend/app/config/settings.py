from pydantic import BaseSettings
from typing import Optional, List, Union
import json
import os

class Settings(BaseSettings):
    # Base de datos - SOLO para desarrollo local
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/muestras_univar"
    DATABASE_URL_PRODUCTION: Optional[str] = None
    
    # Configuración de zona horaria
    TIMEZONE: str = "America/El_Salvador"
    
    # Seguridad JWT - USAR VARIABLES DE ENTORNO EN PRODUCCIÓN
    SECRET_KEY: str = "muestras-univar-secret-key-2025-development"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuración de la aplicación
    PROJECT_NAME: str = "Muestras Univar API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False  # Cambiado a False por defecto para seguridad
    
    # CORS - Agregado para producción
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",  # React frontend local
        "http://127.0.0.1:3000",
        "http://localhost:8000",  # FastAPI docs local
        "https://*.onrender.com",  # Render frontend
        "https://*.render.com",    # Render alternativo
    ]
    
    # Variables de entorno para producción
    ENVIRONMENT: str = "development"
    
    @property 
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from string or list"""
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
        if self.ENVIRONMENT == "production" and self.DATABASE_URL_PRODUCTION:
            return self.DATABASE_URL_PRODUCTION
        return self.DATABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

# Instancia global de configuración
settings = Settings()