from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.config.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.models.role import Role
from app.models.category import Category
from app.models.country import Country

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service),
    current_user_id: Optional[int] = None  # TODO: Implementar autenticaci�n
):
    """Crear nuevo usuario"""
    return user_service.create_user(user_data, created_by=current_user_id)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Obtener usuario por ID"""
    return user_service.get_user(user_id)

@router.put("/{user_id}")
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = None  # TODO: Implementar autenticaci�n
):
    """Actualizar usuario"""
    try:
        from app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Actualizar campos básicos si están presentes
        if user_data.email is not None:
            user.email = user_data.email
        if user_data.first_name is not None:
            user.first_name = user_data.first_name
        if user_data.last_name is not None:
            user.last_name = user_data.last_name
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        if user_data.role_id is not None:
            user.role_id = user_data.role_id
        if user_data.category_id is not None:
            user.category_id = user_data.category_id
            
        # Actualizar contraseña si se proporciona
        if user_data.password:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            user.password_hash = pwd_context.hash(user_data.password)
        
        # Actualizar países asignados
        if user_data.country_ids is not None:
            user = user_repo.assign_countries(user, user_data.country_ids)
        
        # Guardar cambios
        user = user_repo.update(user)
        
        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "role": {"id": user.role.id, "name": user.role.name} if user.role else None,
            "assigned_countries": [{"id": c.id, "name": c.name, "code": c.code} for c in user.assigned_countries],
            "category": {"id": user.category.id, "name": user.category.name} if user.category else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "full_name": user.full_name,
            "country_ids": [c.id for c in user.assigned_countries],
            "country_codes": [c.code for c in user.assigned_countries]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Eliminar usuario"""
    if not user_service.delete_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

@router.get("/", response_model=UserListResponse)
def get_users(
    skip: int = Query(0, ge=0, description="Numero de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Numero de registros a retornar"),
    role_id: Optional[int] = Query(None, description="Filtrar por ID de rol"),
    country_id: Optional[int] = Query(None, description="Filtrar por ID de pais"),
    is_active: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    user_service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista paginada de usuarios con filtros opcionales - Solo administradores"""
    # Verificar que el usuario actual es administrador
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver la lista de usuarios"
        )
    
    result = user_service.get_users(
        skip=skip, 
        limit=limit, 
        role_id=role_id, 
        country_id=country_id, 
        is_active=is_active
    )
    return UserListResponse(**result)

@router.get("/search/{query}", response_model=List[UserResponse])
def search_users(
    query: str,
    limit: int = Query(50, ge=1, le=100, description="Numero maximo de resultados"),
    user_service: UserService = Depends(get_user_service)
):
    """Buscar usuarios por nombre o email"""
    return user_service.search_users(query, limit)

@router.get("/by-country/{country_id}", response_model=List[UserResponse])
def get_users_by_country(
    country_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Obtener usuarios asignados a un pa�s espec�fico"""
    return user_service.get_users_by_country(country_id)

@router.get("/commercial/by-category/{category_id}", response_model=List[UserResponse])
def get_commercial_users_by_category(
    category_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Obtener usuarios comerciales por categor�a"""
    return user_service.get_commercial_users_by_category(category_id)

@router.get("/{user_id}/validate-country/{country_id}")
def validate_user_country_access(
    user_id: int,
    country_id: int,
    user_service: UserService = Depends(get_user_service)
):
    """Validar si un usuario tiene acceso a un pa�s espec�fico"""
    has_access = user_service.validate_user_country_access(user_id, country_id)
    return {"user_id": user_id, "country_id": country_id, "has_access": has_access}

# Endpoints auxiliares para obtener datos de referencia
@router.get("/reference/roles", response_model=List[dict])
def get_roles(db: Session = Depends(get_db)):
    """Obtener lista de roles disponibles"""
    roles = db.query(Role).filter(Role.id.isnot(None)).all()
    return [{"id": role.id, "name": role.name, "description": role.description} for role in roles]

@router.get("/reference/categories", response_model=List[dict])
def get_categories(db: Session = Depends(get_db)):
    """Obtener lista de categor�as disponibles"""
    categories = db.query(Category).filter(Category.is_active == True).all()
    return [{"id": cat.id, "name": cat.name, "description": cat.description} for cat in categories]

@router.get("/reference/countries", response_model=List[dict])
def get_countries(db: Session = Depends(get_db)):
    """Obtener lista de pa�ses disponibles"""
    countries = db.query(Country).filter(Country.is_active == True).all()
    return [{"id": country.id, "name": country.name, "code": country.code} for country in countries]

@router.put("/{user_id}/assign-countries")
def assign_countries_to_user(
    user_id: int,
    country_ids: dict,
    db: Session = Depends(get_db)
):
    """Asignar países a un usuario - endpoint simple para depurar"""
    try:
        from app.repositories.user_repository import UserRepository
        
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Obtener country_ids del body
        country_id_list = country_ids.get("country_ids", [])
        
        # Asignar países
        user = user_repo.assign_countries(user, country_id_list)
        
        return {
            "message": "Países asignados exitosamente", 
            "user_id": user_id,
            "assigned_countries": [{"id": c.id, "name": c.name} for c in user.assigned_countries]
        }
        
    except Exception as e:
        print(f"Error assigning countries: {e}")
        raise HTTPException(status_code=500, detail=str(e))