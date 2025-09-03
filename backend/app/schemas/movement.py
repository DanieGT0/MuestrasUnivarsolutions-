from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class MovementTypeSchema(str, Enum):
    ENTRADA = "ENTRADA"
    SALIDA = "SALIDA"
    AJUSTE = "AJUSTE"
    INICIAL = "INICIAL"

class MovementBase(BaseModel):
    tipo: MovementTypeSchema
    cantidad: int = Field(..., gt=0, description="Cantidad del movimiento")
    responsable: str = Field(..., min_length=1, max_length=255)
    motivo: str = Field(..., min_length=1, max_length=500)
    observaciones: Optional[str] = Field(None, max_length=1000)
    fecha_movimiento: Optional[datetime] = None

class MovementCreate(MovementBase):
    product_id: int = Field(..., gt=0, description="ID del producto")
    
    @validator('cantidad')
    def validate_cantidad(cls, v):
        if v <= 0:
            raise ValueError('La cantidad debe ser mayor a 0')
        return v

class MovementEntrada(BaseModel):
    """Esquema especifico para registrar entradas de inventario"""
    product_id: int = Field(..., gt=0, description="ID del producto")
    cantidad: int = Field(..., gt=0, description="Cantidad a agregar")
    responsable: str = Field(..., min_length=1, max_length=255)
    motivo: str = Field(..., min_length=1, max_length=500)
    observaciones: Optional[str] = Field(None, max_length=1000)

class MovementSalida(BaseModel):
    """Esquema especifico para registrar salidas de inventario"""
    product_id: int = Field(..., gt=0, description="ID del producto")
    cantidad: int = Field(..., gt=0, description="Cantidad a descontar")
    responsable: str = Field(..., min_length=1, max_length=255)
    motivo: str = Field(..., min_length=1, max_length=500)
    observaciones: Optional[str] = Field(None, max_length=1000)

class MovementAjuste(BaseModel):
    """Esquema especifico para ajustes de inventario"""
    product_id: int = Field(..., gt=0, description="ID del producto")
    cantidad_nueva: int = Field(..., ge=0, description="Nueva cantidad del producto")
    responsable: str = Field(..., min_length=1, max_length=255)
    motivo: str = Field(..., min_length=1, max_length=500)
    observaciones: Optional[str] = Field(None, max_length=1000)

class MovementResponse(BaseModel):
    id: int
    tipo: MovementTypeSchema
    cantidad: int
    cantidad_anterior: int
    cantidad_nueva: int
    responsable: str
    motivo: str
    observaciones: Optional[str]
    fecha_movimiento: datetime
    product_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Informacion del producto
    product_codigo: Optional[str] = None
    product_nombre: Optional[str] = None
    
    # Informacion del usuario
    user_email: Optional[str] = None
    user_full_name: Optional[str] = None
    
    @validator('tipo', pre=True)
    def validate_tipo(cls, v):
        """Convertir valores de enum a mayúsculas si es necesario"""
        if isinstance(v, str):
            return v.upper()
        elif hasattr(v, 'value'):
            return v.value.upper()
        return v
    
    class Config:
        from_attributes = True

class MovementList(BaseModel):
    """Esquema simplificado para listas de movimientos"""
    id: int
    tipo: MovementTypeSchema
    cantidad: int
    cantidad_anterior: int
    cantidad_nueva: int
    responsable: str
    motivo: str
    fecha_movimiento: datetime
    product_codigo: str
    product_nombre: str
    user_full_name: str
    diferencia: int  # Calculado: positivo para entradas, negativo para salidas
    
    @validator('tipo', pre=True)
    def validate_tipo(cls, v):
        """Convertir valores de enum a mayúsculas si es necesario"""
        if isinstance(v, str):
            return v.upper()
        elif hasattr(v, 'value'):
            return v.value.upper()
        return v
    
    class Config:
        from_attributes = True

class MovementFilters(BaseModel):
    """Filtros para buscar movimientos"""
    search: Optional[str] = None  # Buscar en codigo, nombre, responsable, motivo
    tipo: Optional[str] = None  # Acepta string que luego se convierte a enum
    product_id: Optional[int] = None
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    responsable: Optional[str] = None
    country_id: Optional[int] = None

class MovementStats(BaseModel):
    """Estadisticas de movimientos"""
    total_movimientos: int
    entradas_total: int
    salidas_total: int
    ajustes_total: int
    movimientos_mes_actual: int
    productos_con_movimientos: int

class KardexEntry(BaseModel):
    """Entrada del Kardex para un producto"""
    id: int
    fecha: datetime
    tipo: MovementTypeSchema
    motivo: str
    responsable: str
    cantidad_movimiento: int
    cantidad_anterior: int
    cantidad_nueva: int
    saldo: int  # Cantidad nueva
    observaciones: Optional[str]
    
    class Config:
        from_attributes = True

class KardexResponse(BaseModel):
    """Respuesta completa del Kardex de un producto"""
    product_id: int
    product_codigo: str
    product_nombre: str
    saldo_actual: int
    movimientos: List[KardexEntry]
    
    class Config:
        from_attributes = True