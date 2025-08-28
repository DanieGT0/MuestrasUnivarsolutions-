from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import BaseModel

# Tabla de asociación many-to-many entre usuarios y países
user_countries_table = Table(
    'user_countries',
    BaseModel.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('country_id', Integer, ForeignKey('countries.id'), primary_key=True)
)