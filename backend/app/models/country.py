from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Country(BaseModel):
    __tablename__ = "countries"
    
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(5), unique=True, nullable=False)  # GT, SV, CR, PA
    is_active = Column(Boolean, default=True)
    
    # Relación con usuarios (país principal)
    users = relationship("User", back_populates="country")
    
    # Relación con productos
    products = relationship("Product", back_populates="country")
    
    # Relación many-to-many con usuarios asignados
    assigned_users = relationship(
        "User",
        secondary="user_countries",
        back_populates="assigned_countries"
    )
    
    def __repr__(self):
        return f"<Country {self.name} ({self.code})>"