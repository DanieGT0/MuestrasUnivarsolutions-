from sqlalchemy import Column, String, Integer, Float, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class Product(BaseModel):
    __tablename__ = "products"
    
    # Información básica del producto
    codigo = Column(String(20), unique=True, nullable=False, index=True)  # SV100825001
    nombre = Column(String(255), nullable=False, index=True)
    lote = Column(String(100), nullable=False)
    
    # Cantidades y pesos
    cantidad = Column(Integer, nullable=False, default=0)
    peso_unitario = Column(Float, nullable=False)  # En Kg
    peso_total = Column(Float, nullable=False)     # En Kg
    
    # Fechas importantes
    fecha_registro = Column(Date, nullable=False, default=datetime.utcnow().date())
    fecha_vencimiento = Column(Date, nullable=False)
    
    # Información del proveedor y responsable
    proveedor = Column(String(255), nullable=False)
    responsable = Column(String(255), nullable=False)
    
    # Comentarios adicionales
    comentarios = Column(Text, nullable=True)
    
    # Relaciones con otras tablas
    categoria_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relaciones ORM
    categoria = relationship("Category", back_populates="products")
    country = relationship("Country", back_populates="products") 
    creator = relationship("User", back_populates="products")
    movements = relationship("Movement", back_populates="product", cascade="all, delete-orphan")
    
    @property
    def codigo_pais(self):
        """Obtener el prefijo del país del código"""
        return self.codigo[:2] if len(self.codigo) >= 2 else ""
    
    @property
    def numero_secuencial(self):
        """Obtener el número secuencial del código"""
        return self.codigo[-3:] if len(self.codigo) >= 3 else ""
    
    @property
    def dias_para_vencer(self):
        """Calcular días hasta vencimiento"""
        from datetime import date
        today = date.today()
        return (self.fecha_vencimiento - today).days
    
    @property
    def estado_vencimiento(self):
        """Obtener estado del producto basado en fecha de vencimiento"""
        dias = self.dias_para_vencer
        if dias < 0:
            return "vencido"
        elif dias <= 30:
            return "por_vencer"
        else:
            return "vigente"
    
    def __repr__(self):
        return f"<Product {self.codigo}: {self.nombre}>"