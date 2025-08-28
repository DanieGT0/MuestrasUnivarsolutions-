from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel
import enum

class MovementType(enum.Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE = "AJUSTE"
    INICIAL = "INICIAL"  # Para el stock inicial cuando se crea el producto

class Movement(BaseModel):
    __tablename__ = "movements"
    
    # Informaci�n b�sica del movimiento
    tipo = Column(Enum(MovementType), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False)
    cantidad_anterior = Column(Integer, nullable=False)
    cantidad_nueva = Column(Integer, nullable=False)
    
    # Informaci�n del responsable y motivo
    responsable = Column(String(255), nullable=False)
    motivo = Column(String(500), nullable=False)
    observaciones = Column(Text, nullable=True)
    
    # Fecha del movimiento
    fecha_movimiento = Column(DateTime, nullable=False)
    
    # Relaciones
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relaciones ORM
    product = relationship("Product", back_populates="movements")
    user = relationship("User", back_populates="movements")
    
    @property
    def is_entrada(self):
        return self.tipo == MovementType.ENTRADA
    
    @property
    def is_salida(self):
        return self.tipo == MovementType.SALIDA
    
    @property
    def is_ajuste(self):
        return self.tipo == MovementType.AJUSTE
    
    @property
    def diferencia(self):
        """Diferencia de cantidad (positiva para entradas, negativa para salidas)"""
        if self.tipo in [MovementType.ENTRADA, MovementType.INICIAL]:
            return self.cantidad
        elif self.tipo == MovementType.SALIDA:
            return -self.cantidad
        else:  # AJUSTE
            return self.cantidad_nueva - self.cantidad_anterior
    
    def __repr__(self):
        return f"<Movement {self.tipo.value}: {self.cantidad} - {self.product.codigo if self.product else 'N/A'}>"