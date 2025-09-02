from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional
from app.models.user import User
from app.models.country import Country
from app.models.role import Role
from app.models.category import Category

class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Obtener usuario por ID con todas sus relaciones"""
        return self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        ).filter(User.id == user_id).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Obtener usuario por email"""
        return self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        ).filter(User.email == email).first()
    
    def get_all(self, skip: int = 0, limit: int = 100, 
                role_id: Optional[int] = None, 
                country_id: Optional[int] = None,
                is_active: Optional[bool] = None) -> List[User]:
        """Obtener todos los usuarios con filtros opcionales"""
        query = self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        )
        
        if role_id:
            query = query.filter(User.role_id == role_id)
        
        if country_id:
            query = query.join(User.assigned_countries).filter(Country.id == country_id)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    def count(self, role_id: Optional[int] = None, 
              country_id: Optional[int] = None,
              is_active: Optional[bool] = None) -> int:
        """Contar usuarios con filtros opcionales"""
        query = self.db.query(User)
        
        if role_id:
            query = query.filter(User.role_id == role_id)
        
        if country_id:
            query = query.join(User.assigned_countries).filter(Country.id == country_id)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        return query.count()
    
    def create(self, user: User) -> User:
        """Crear nuevo usuario"""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user: User) -> User:
        """Actualizar usuario existente"""
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete(self, user_id: int) -> bool:
        """Eliminar usuario por ID"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
    
    def assign_countries(self, user: User, country_ids: List[int]) -> User:
        """Asignar pa�ses a un usuario"""
        # Limpiar pa�ses existentes
        user.assigned_countries.clear()
        
        # Asignar nuevos pa�ses
        if country_ids:
            countries = self.db.query(Country).filter(Country.id.in_(country_ids)).all()
            user.assigned_countries = countries
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def assign_categories(self, user: User, category_ids: List[int]) -> User:
        """Asignar categorías a un usuario"""
        # Limpiar categorías existentes
        user.assigned_categories.clear()
        
        # Asignar nuevas categorías
        if category_ids:
            categories = self.db.query(Category).filter(Category.id.in_(category_ids)).all()
            user.assigned_categories = categories
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_users_by_country(self, country_id: int) -> List[User]:
        """Obtener usuarios asignados a un pa�s espec�fico"""
        return self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        ).join(User.assigned_countries).filter(
            Country.id == country_id,
            User.is_active == True
        ).all()
    
    def get_commercial_users_by_category(self, category_id: int) -> List[User]:
        """Obtener usuarios comerciales por categor�a"""
        return self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        ).join(User.role).filter(
            and_(
                Role.name == "commercial",
                User.category_id == category_id,
                User.is_active == True
            )
        ).all()
    
    def search_users(self, query: str, limit: int = 50) -> List[User]:
        """Buscar usuarios por nombre o email"""
        search = f"%{query}%"
        return self.db.query(User).options(
            joinedload(User.role),
            joinedload(User.assigned_countries),
            joinedload(User.assigned_categories),
            joinedload(User.category)
        ).filter(
            or_(
                User.first_name.ilike(search),
                User.last_name.ilike(search),
                User.email.ilike(search)
            )
        ).limit(limit).all()