from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.config.database import get_db
from app.config.security import create_access_token, verify_password, verify_token
from app.config.settings import settings
from app.models import User
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo, TokenData
from app.core.rate_limit import limiter, check_failed_login_attempts, record_failed_login_attempt, clear_failed_login_attempts, get_remote_address_with_forwarded
from app.core.role_permissions import RolePermissions
from sqlalchemy.orm import joinedload

router = APIRouter()

# OAuth2 scheme para autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")  # Máximo 5 intentos por minuto
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Endpoint para iniciar sesión"""
    
    # Obtener IP del cliente
    client_ip = get_remote_address_with_forwarded(request)
    
    # Verificar intentos fallidos previos
    check_failed_login_attempts(client_ip)
    
    # Buscar usuario por email con países asignados
    user = db.query(User).options(
        joinedload(User.role),
        joinedload(User.assigned_countries),
        joinedload(User.category),
        joinedload(User.country)
    ).filter(User.email == login_data.email).first()
    
    if not user:
        # Registrar intento fallido
        record_failed_login_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(login_data.password, user.password_hash):
        # Registrar intento fallido
        record_failed_login_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo",
        )
    
    # Crear token JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role.name if user.role else None,
        "country_id": user.country_id,
        "category_id": user.category_id,
        "country_ids": user.country_ids,  # Nuevos países asignados
    }
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    # Limpiar intentos fallidos ya que el login fue exitoso
    clear_failed_login_attempts(client_ip)
    
    # Actualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Preparar información del usuario
    user_info = UserInfo(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        role=user.role.name if user.role else "unknown",
        country=user.country.name if user.country else None,
        category=user.category.name if user.category else None,
        last_login=user.last_login,
        # Nuevos campos para múltiples países
        country_ids=user.country_ids,
        country_codes=user.country_codes,
        assigned_countries=[c.name for c in user.assigned_countries]
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_info
    )

@router.post("/logout")
async def logout():
    """Endpoint para cerrar sesión"""
    # En JWT stateless, el logout se maneja en el frontend
    # eliminando el token del almacenamiento local
    return {"message": "Sesión cerrada exitosamente"}

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Obtener usuario actual desde token JWT"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verificar token
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        # Extraer información del token
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        # Buscar usuario en BD con países asignados
        user = db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.category),
            joinedload(User.country)
        ).filter(User.email == email).first()
        
        if user is None:
            raise credentials_exception
        
        # Verificar que esté activo
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo"
            )
        
        return user
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    return UserInfo(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        full_name=current_user.full_name,
        role=current_user.role.name if current_user.role else "unknown",
        country=current_user.country.name if current_user.country else None,
        category=current_user.category.name if current_user.category else None,
        last_login=current_user.last_login,
        # Nuevos campos para múltiples países
        country_ids=current_user.country_ids,
        country_codes=current_user.country_codes,
        assigned_countries=[c.name for c in current_user.assigned_countries]
    )

@router.get("/permissions")
async def get_user_permissions(
    current_user: User = Depends(get_current_user)
):
    """Obtener permisos y módulos disponibles para el usuario actual"""
    accessible_modules = RolePermissions.get_accessible_modules(current_user)
    
    return {
        "user_id": current_user.id,
        "role": current_user.role.name if current_user.role else "unknown",
        "accessible_modules": accessible_modules,
        "permissions": {
            "can_access_users": RolePermissions.has_module_access(current_user, "users"),
            "can_access_products": RolePermissions.has_module_access(current_user, "products"),
            "can_access_movements": RolePermissions.has_module_access(current_user, "movements"),
            "can_access_reports": RolePermissions.has_module_access(current_user, "reports"),
            "can_access_countries": RolePermissions.has_module_access(current_user, "countries"),
            "can_access_categories": RolePermissions.has_module_access(current_user, "categories"),
            "can_access_statistics": RolePermissions.has_module_access(current_user, "statistics"),
        },
        "filters": {
            "requires_country_filter": RolePermissions.requires_country_filter(current_user),
            "requires_category_filter": RolePermissions.requires_category_filter(current_user),
            "allowed_countries": RolePermissions.filter_countries(current_user),
            "allowed_categories": RolePermissions.filter_categories(current_user)
        }
    }