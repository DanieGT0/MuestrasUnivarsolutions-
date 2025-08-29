# -*- coding: utf-8 -*-
"""
Sistema de permisos y control de acceso por roles
"""
from functools import wraps
from fastapi import HTTPException, status
from app.models.user import User
from typing import List, Optional

class RolePermissions:
    """
    Control de permisos basado en roles
    
    Roles y sus permisos:
    - administrador: Acceso completo a todos los módulos
    - user: Productos, movimientos, reportes (limitado a países asignados)
    - comercial: Solo reportes (limitado a países y categorías asignadas)
    """
    
    # Definir módulos disponibles
    MODULES = {
        "users": "Gestión de usuarios",
        "products": "Gestión de productos", 
        "movements": "Gestión de movimientos",
        "reports": "Reportes y estadísticas",
        "countries": "Gestión de países",
        "categories": "Gestión de categorías",
        "statistics": "Estadísticas del sistema"
    }
    
    # Permisos por rol
    ROLE_PERMISSIONS = {
        "administrador": {
            "modules": ["users", "products", "movements", "reports", "countries", "categories", "statistics"],
            "country_filter": False,  # No tiene filtro de país
            "category_filter": False  # No tiene filtro de categoría
        },
        "user": {
            "modules": ["products", "movements", "reports", "countries", "categories", "statistics"],
            "country_filter": True,   # Filtrado por países asignados
            "category_filter": False  # Ve todas las categorías
        },
        "comercial": {
            "modules": ["reports"],   # Solo reportes
            "country_filter": True,   # Filtrado por países asignados
            "category_filter": True   # Filtrado por categorías asignadas
        }
    }
    
    @classmethod
    def has_module_access(cls, user: User, module: str) -> bool:
        """
        Verificar si un usuario tiene acceso a un módulo específico
        """
        if not user or not user.role:
            return False
            
        role_name = user.role.name
        if role_name not in cls.ROLE_PERMISSIONS:
            return False
            
        return module in cls.ROLE_PERMISSIONS[role_name]["modules"]
    
    @classmethod
    def requires_country_filter(cls, user: User) -> bool:
        """
        Verificar si el usuario debe tener filtro por país
        """
        if not user or not user.role:
            return True
            
        role_name = user.role.name
        if role_name not in cls.ROLE_PERMISSIONS:
            return True
            
        return cls.ROLE_PERMISSIONS[role_name]["country_filter"]
    
    @classmethod
    def requires_category_filter(cls, user: User) -> bool:
        """
        Verificar si el usuario debe tener filtro por categoría
        """
        if not user or not user.role:
            return False
            
        role_name = user.role.name
        if role_name not in cls.ROLE_PERMISSIONS:
            return False
            
        return cls.ROLE_PERMISSIONS[role_name]["category_filter"]
    
    @classmethod
    def get_accessible_modules(cls, user: User) -> List[str]:
        """
        Obtener lista de módulos accesibles para un usuario
        """
        if not user or not user.role:
            return []
            
        role_name = user.role.name
        if role_name not in cls.ROLE_PERMISSIONS:
            return []
            
        return cls.ROLE_PERMISSIONS[role_name]["modules"]
    
    @classmethod
    def filter_countries(cls, user: User, country_ids: List[int] = None) -> Optional[List[int]]:
        """
        Filtrar países basado en los permisos del usuario
        
        Returns:
        - None: Si el usuario puede ver todos los países
        - List[int]: Lista de IDs de países permitidos
        - []: Lista vacía si no tiene acceso a ningún país
        """
        if not user or not user.role:
            return []
            
        # Admin puede ver todos los países
        if user.is_admin:
            return None
            
        # Si el usuario no requiere filtro por país, puede ver todos
        if not cls.requires_country_filter(user):
            return None
            
        # Filtrar por países asignados al usuario
        user_country_ids = user.country_ids
        
        if not user_country_ids:
            return []  # No tiene países asignados
            
        # Si se proporciona una lista específica, filtrar
        if country_ids is not None:
            return [cid for cid in country_ids if cid in user_country_ids]
            
        return user_country_ids
    
    @classmethod
    def filter_categories(cls, user: User, category_ids: List[int] = None) -> Optional[List[int]]:
        """
        Filtrar categorías basado en los permisos del usuario
        
        Returns:
        - None: Si el usuario puede ver todas las categorías
        - List[int]: Lista de IDs de categorías permitidos
        """
        if not user or not user.role:
            return []
            
        # Si el usuario no requiere filtro por categoría, puede ver todas
        if not cls.requires_category_filter(user):
            return None
            
        # Para usuarios comerciales, filtrar por categoría asignada
        if user.is_commercial and user.category_id:
            user_category_ids = [user.category_id]
            
            if category_ids is not None:
                return [cid for cid in category_ids if cid in user_category_ids]
                
            return user_category_ids
            
        return None

def require_module_access(module: str):
    """
    Decorador para requerir acceso a un módulo específico
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Buscar el usuario en los argumentos
            current_user = None
            for key, value in kwargs.items():
                if key == 'current_user' and isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no autenticado"
                )
            
            if not RolePermissions.has_module_access(current_user, module):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"No tienes permisos para acceder al módulo {module}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_role(required_roles: List[str]):
    """
    Decorador para requerir roles específicos
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Buscar el usuario en los argumentos
            current_user = None
            for key, value in kwargs.items():
                if key == 'current_user' and isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no autenticado"
                )
            
            if not current_user.role or current_user.role.name not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Requiere uno de estos roles: {', '.join(required_roles)}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator