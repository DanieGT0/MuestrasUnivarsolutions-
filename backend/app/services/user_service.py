from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status

from app.models.user import User
from app.models.role import Role
from app.models.category import Category
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = UserRepository(db)
    
    def get_password_hash(self, password: str) -> str:
        """Generar hash de contrase�a"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verificar contrase�a"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_user(self, user_data: UserCreate, created_by: Optional[int] = None) -> UserResponse:
        """Crear nuevo usuario con validaciones de negocio"""
        
        # Verificar que el email no exista
        existing_user = self.repository.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email ya est� registrado"
            )
        
        # Verificar que el rol exista
        role = self.db.query(Role).filter(Role.id == user_data.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rol no encontrado"
            )
        
        # Validar categorías para usuarios comerciales
        if role.name in ["commercial", "comercial"]:
            # Verificar si tiene categorías múltiples o single category
            has_categories = (hasattr(user_data, 'category_ids') and user_data.category_ids) or user_data.category_id
            if not has_categories:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Usuarios comerciales deben tener al menos una categoría asignada"
                )
            
            # Validar categorías múltiples si existen
            if hasattr(user_data, 'category_ids') and user_data.category_ids:
                categories = self.db.query(Category).filter(Category.id.in_(user_data.category_ids)).all()
                if len(categories) != len(user_data.category_ids):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Una o más categorías no fueron encontradas"
                    )
                    
            # Validar single category si existe (backward compatibility)
            if user_data.category_id:
                category = self.db.query(Category).filter(Category.id == user_data.category_id).first()
                if not category:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Categoría no encontrada"
                    )
        else:
            # Solo usuarios comerciales pueden tener categorías
            if user_data.category_id:
                user_data.category_id = None
            if hasattr(user_data, 'category_ids'):
                user_data.category_ids = []
        
        # Crear usuario
        user = User(
            email=user_data.email,
            password_hash=self.get_password_hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=user_data.is_active,
            role_id=user_data.role_id,
            category_id=user_data.category_id,
            created_by=created_by
        )
        
        # Guardar usuario
        user = self.repository.create(user)
        
        # Asignar países
        if user_data.country_ids:
            user = self.repository.assign_countries(user, user_data.country_ids)
        
        # Asignar categorías múltiples
        if hasattr(user_data, 'category_ids') and user_data.category_ids:
            user = self.repository.assign_categories(user, user_data.category_ids)
        
        return UserResponse.from_orm(user)
    
    def update_user(self, user_id: int, user_data: UserUpdate, updated_by: Optional[int] = None) -> UserResponse:
        """Actualizar usuario existente"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar email �nico si se est� actualizando
        if user_data.email and user_data.email != user.email:
            existing_user = self.repository.get_by_email(user_data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email ya est� registrado"
                )
            user.email = user_data.email
        
        # Actualizar campos b�sicos
        if user_data.first_name is not None:
            user.first_name = user_data.first_name
        if user_data.last_name is not None:
            user.last_name = user_data.last_name
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        
        # Actualizar contrase�a si se proporciona
        if user_data.password:
            user.password_hash = self.get_password_hash(user_data.password)
        
        # Actualizar rol y validar categor�a
        if user_data.role_id is not None:
            role = self.db.query(Role).filter(Role.id == user_data.role_id).first()
            if not role:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Rol no encontrado"
                )
            
            user.role_id = user_data.role_id
            
            # Validar categor�a para usuarios comerciales
            if role.name == "commercial":
                if user_data.category_id is not None:
                    if user_data.category_id:
                        category = self.db.query(Category).filter(Category.id == user_data.category_id).first()
                        if not category:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Categor�a no encontrada"
                            )
                    user.category_id = user_data.category_id
                elif not user.category_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Usuarios comerciales deben tener una categor�a asignada"
                    )
            else:
                # Solo usuarios comerciales pueden tener categor�a
                user.category_id = None
        elif user_data.category_id is not None:
            # Actualizar solo categor�a
            if user.role and user.role.name == "commercial":
                if user_data.category_id:
                    category = self.db.query(Category).filter(Category.id == user_data.category_id).first()
                    if not category:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Categor�a no encontrada"
                        )
                user.category_id = user_data.category_id
        
        # Actualizar pa�ses asignados
        if user_data.country_ids is not None:
            user = self.repository.assign_countries(user, user_data.country_ids)
        
        user = self.repository.update(user)
        return UserResponse.from_orm(user)
    
    def get_user(self, user_id: int) -> UserResponse:
        """Obtener usuario por ID"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return UserResponse.from_orm(user)
    
    def get_users(self, skip: int = 0, limit: int = 100, 
                  role_id: Optional[int] = None,
                  country_id: Optional[int] = None,
                  is_active: Optional[bool] = None) -> Dict[str, Any]:
        """Obtener lista paginada de usuarios"""
        users = self.repository.get_all(
            skip=skip, 
            limit=limit, 
            role_id=role_id, 
            country_id=country_id,
            is_active=is_active
        )
        total = self.repository.count(
            role_id=role_id, 
            country_id=country_id,
            is_active=is_active
        )
        
        return {
            "users": [UserResponse.from_orm(user) for user in users],
            "total": total,
            "page": (skip // limit) + 1,
            "per_page": limit,
            "pages": (total + limit - 1) // limit
        }
    
    def delete_user(self, user_id: int) -> bool:
        """Eliminar usuario"""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return self.repository.delete(user_id)
    
    def search_users(self, query: str, limit: int = 50) -> List[UserResponse]:
        """Buscar usuarios por nombre o email"""
        users = self.repository.search_users(query, limit)
        return [UserResponse.from_orm(user) for user in users]
    
    def get_users_by_country(self, country_id: int) -> List[UserResponse]:
        """Obtener usuarios asignados a un pa�s"""
        users = self.repository.get_users_by_country(country_id)
        return [UserResponse.from_orm(user) for user in users]
    
    def get_commercial_users_by_category(self, category_id: int) -> List[UserResponse]:
        """Obtener usuarios comerciales por categor�a"""
        users = self.repository.get_commercial_users_by_category(category_id)
        return [UserResponse.from_orm(user) for user in users]
    
    def validate_user_country_access(self, user_id: int, country_id: int) -> bool:
        """Validar si un usuario tiene acceso a un pa�s espec�fico"""
        user = self.repository.get_by_id(user_id)
        if not user:
            return False
        
        return user.has_country_access(country_id)