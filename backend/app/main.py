from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.config.settings import settings
from app.config.database import engine
from app.api.v1.endpoints import auth, products, users, movements, reports, countries, categories, statistics
from app.core.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
# Importar modelos para SQLAlchemy
from app import models
from app.models.base import BaseModel
import os

# Configurar zona horaria para Centroamerica
os.environ['TZ'] = settings.TIMEZONE
try:
    import time
    time.tzset()
    print(f"[TIMEZONE] Successfully set timezone to: {settings.TIMEZONE}")
except:
    print(f"[TIMEZONE] Warning: Could not set timezone to {settings.TIMEZONE}")

# Crear aplicacion FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API para Sistema de Gestion de Muestras Univar",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"[VALIDATION_ERROR] Request URL: {request.url}")
    print(f"[VALIDATION_ERROR] Request method: {request.method}")
    print(f"[VALIDATION_ERROR] Validation errors: {exc.errors()}")
    print(f"[VALIDATION_ERROR] Request body: {await request.body()}")
    
    # Log detailed error information
    for error in exc.errors():
        print(f"[VALIDATION_ERROR] Field: {error.get('loc')}")
        print(f"[VALIDATION_ERROR] Message: {error.get('msg')}")
        print(f"[VALIDATION_ERROR] Type: {error.get('type')}")
        print(f"[VALIDATION_ERROR] Input: {error.get('input')}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )

# Middleware para configurar encoding UTF-8
@app.middleware("http")
async def add_utf8_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response

# Middleware para manejar redirecciones y CORS en producción
@app.middleware("http")
async def handle_cors_redirects(request: Request, call_next):
    # Agregar headers CORS adicionales para manejar redirecciones
    if request.method == "OPTIONS":
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
    
    response = await call_next(request)
    
    # Agregar headers adicionales para production
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# Configurar CORS usando settings
print(f"[CORS] Configured origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Cache-Control",
        "X-File-Name"
    ],
    expose_headers=["*"],
    max_age=86400  # Cache preflight requests for 24 hours
)

# Incluir rutas de autenticacion
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["authentication"]
)

# Incluir rutas de productos
app.include_router(
    products.router,
    prefix=f"{settings.API_V1_PREFIX}/products",
    tags=["products"]
)

# Incluir rutas de usuarios
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_PREFIX}/users",
    tags=["users"]
)

# Incluir rutas de movimientos
from app.api.v1.endpoints import movements
app.include_router(
    movements.router,
    prefix=f"{settings.API_V1_PREFIX}/movements",
    tags=["movements"]
)

# Incluir rutas de reportes
app.include_router(
    reports.router,
    prefix=f"{settings.API_V1_PREFIX}/reports",
    tags=["reports"]
)

# Incluir rutas de países
app.include_router(
    countries.router,
    prefix=f"{settings.API_V1_PREFIX}/countries",
    tags=["countries"]
)

# Incluir rutas de categorías
app.include_router(
    categories.router,
    prefix=f"{settings.API_V1_PREFIX}/categories",
    tags=["categories"]
)

# Incluir rutas de estadísticas
app.include_router(
    statistics.router,
    prefix=f"{settings.API_V1_PREFIX}/statistics",
    tags=["statistics"]
)

# Inicializar base de datos al arrancar la aplicación
@app.on_event("startup")
async def startup_event():
    """Inicializar base de datos y seeds al arrancar"""
    try:
        print("[STARTUP] Initializing database...")
        
        # Crear todas las tablas
        BaseModel.metadata.create_all(bind=engine)
        print("[STARTUP] Tables created successfully")
        
        # Ejecutar seeds básicos
        from app.db.seeds.countries import seed_countries
        from app.db.seeds.roles import seed_roles
        from app.db.seeds.categories import seed_categories
        from app.db.seeds.admin_user import seed_admin_user
        
        seed_countries()
        seed_roles()
        seed_categories()
        seed_admin_user()
        
        print("[STARTUP] Database initialization completed successfully")
        
    except Exception as e:
        print(f"[STARTUP] Error during database initialization: {str(e)}")
        # No fallar el startup, solo logear el error

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "Muestras Univar API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )