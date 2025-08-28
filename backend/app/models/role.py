from sqlalchemy import Column, String, Text, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Role(BaseModel):
    __tablename__ = "roles"
    
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    permissions = Column(JSON, default=list)  # Lista de permisos
    
    # Relación con usuarios
    users = relationship("User", back_populates="role")
    
    def __repr__(self):
        return f"<Role {self.name}>"