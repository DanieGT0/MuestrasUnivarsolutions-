# Importar todos los modelos para SQLAlchemy
from .base import BaseModel
from .role import Role
from .country import Country
from .category import Category
from .user_country import user_countries_table
from .user import User
from .product import Product
from .movement import Movement

__all__ = ['BaseModel', 'Role', 'Country', 'Category', 'User', 'Product', 'Movement', 'user_countries_table']