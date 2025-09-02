from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
from .user_category import user_categories_table

class Category(BaseModel):
    __tablename__ = "categories"
    
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    # Relación con usuarios comerciales (backward compatibility)
    users = relationship("User", back_populates="category")
    
    # Relación many-to-many con usuarios asignados
    assigned_users = relationship(
        "User",
        secondary=user_categories_table,
        back_populates="assigned_categories"
    )
    
    # Relación con productos
    products = relationship("Product", back_populates="categoria")
    
    def __repr__(self):
        return f"<Category {self.name}>"