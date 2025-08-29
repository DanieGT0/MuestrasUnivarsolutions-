from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel
from .user_country import user_countries_table

class User(BaseModel):
    __tablename__ = "users"
    
    # Información básica
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Metadatos
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relaciones ORM
    role = relationship("Role", back_populates="users")
    country = relationship("Country", back_populates="users")  # País principal (backward compatibility)
    category = relationship("Category", back_populates="users")
    creator = relationship("User", foreign_keys=[created_by])
    
    # Relación con productos creados por este usuario
    products = relationship("Product", back_populates="creator")
    
    # Relación con movimientos registrados por este usuario
    movements = relationship("Movement", back_populates="user")
    
    # Relación many-to-many con países asignados
    assigned_countries = relationship(
        "Country",
        secondary=user_countries_table,
        back_populates="assigned_users"
    )
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_admin(self):
        return self.role.name in ["admin", "administrador"] if self.role else False
    
    @property
    def is_user(self):
        return self.role.name == "user" if self.role else False
    
    @property
    def is_commercial(self):
        return self.role.name == "comercial" if self.role else False
    
    @property
    def country_ids(self):
        """Obtener IDs de países asignados"""
        return [country.id for country in self.assigned_countries]
    
    @property
    def country_codes(self):
        """Obtener códigos de países asignados"""
        return [country.code for country in self.assigned_countries]
    
    def has_country_access(self, country_id):
        """Verificar si el usuario tiene acceso a un país específico"""
        if self.is_admin:
            return True  # Admin puede acceder a todos los países
        return country_id in self.country_ids
    
    def __repr__(self):
        return f"<User {self.email}>"