from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import BaseModel

# Tabla de asociación many-to-many entre usuarios y categorías
user_categories_table = Table(
    'user_categories',
    BaseModel.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)