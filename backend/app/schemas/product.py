from pydantic import BaseModel, validator, Field
from typing import Optional
from datetime import date, datetime
from enum import Enum

class CategoriaEnum(str, Enum):
    HIC = "HIC"
    BIC = "BIC" 
    CASE = "CASE"
    FOOD = "FOOD"
    PHARMA = "PHARMA"
    OTROS = "OTROS"

class EstadoVencimientoEnum(str, Enum):
    VIGENTE = "vigente"
    POR_VENCER = "por_vencer"
    VENCIDO = "vencido"

# Schema base para crear producto
class ProductBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255, description="Nombre del producto")
    lote: str = Field(..., min_length=1, max_length=100, description="Numero de lote")
    cantidad: int = Field(..., ge=0, description="Cantidad de unidades")
    peso_unitario: float = Field(..., gt=0, description="Peso unitario en Kg")
    peso_total: float = Field(..., gt=0, description="Peso total en Kg")
    fecha_registro: date = Field(default_factory=date.today, description="Fecha de registro")
    fecha_vencimiento: date = Field(..., description="Fecha de vencimiento")
    proveedor: str = Field(..., min_length=1, max_length=255, description="Nombre del proveedor")
    responsable: str = Field(..., min_length=1, max_length=255, description="Responsable del producto")
    comentarios: Optional[str] = Field(None, max_length=1000, description="Comentarios adicionales")
    categoria_id: int = Field(..., description="ID de la categoria")

    @validator('fecha_registro', pre=True)
    def validate_fecha_registro(cls, v, values):
        print(f"[FECHA_REGISTRO_VALIDATOR] Input received: {v} (type: {type(v)})")
        
        # Handle date string conversion to avoid timezone issues for fecha_registro
        if isinstance(v, str):
            try:
                from datetime import datetime, date
                # Parse date string in YYYY-MM-DD format without timezone conversion
                parsed_date = datetime.strptime(v, '%Y-%m-%d').date()
                print(f"[FECHA_REGISTRO_VALIDATOR] Successfully converted string '{v}' to date: {parsed_date}")
                return parsed_date
            except ValueError as e:
                print(f"[FECHA_REGISTRO_VALIDATOR] Error parsing date string '{v}': {e}")
                raise ValueError(f'Formato de fecha invalido. Use YYYY-MM-DD: {v}')
        
        # If it's already a date object, return as-is
        if isinstance(v, date):
            print(f"[FECHA_REGISTRO_VALIDATOR] Date object received: {v}")
            return v
        
        # Handle datetime objects by extracting just the date part
        if hasattr(v, 'date'):
            extracted_date = v.date()
            print(f"[FECHA_REGISTRO_VALIDATOR] Extracted date from datetime: {extracted_date}")
            return extracted_date
            
        print(f"[FECHA_REGISTRO_VALIDATOR] Returning value as-is: {v}")
        return v

    @validator('fecha_vencimiento', pre=True)
    def validate_fecha_vencimiento(cls, v, values):
        print(f"[FECHA_VENCIMIENTO_VALIDATOR] Input received: {v} (type: {type(v)})")
        
        # Validacion basica: asegurar que la fecha de vencimiento es valida
        # No restringimos que sea posterior a fecha_registro para permitir productos vencidos
        if not v:
            raise ValueError('La fecha de vencimiento es requerida')
        
        # Handle date string conversion to avoid timezone issues
        if isinstance(v, str):
            try:
                from datetime import datetime, date
                # Parse date string in YYYY-MM-DD format without timezone conversion
                parsed_date = datetime.strptime(v, '%Y-%m-%d').date()
                print(f"[FECHA_VENCIMIENTO_VALIDATOR] Successfully converted string '{v}' to date: {parsed_date}")
                return parsed_date
            except ValueError as e:
                print(f"[FECHA_VENCIMIENTO_VALIDATOR] Error parsing date string '{v}': {e}")
                raise ValueError(f'Formato de fecha invalido. Use YYYY-MM-DD: {v}')
        
        # If it's already a date object, return as-is
        if isinstance(v, date):
            print(f"[FECHA_VENCIMIENTO_VALIDATOR] Date object received: {v}")
            return v
        
        # Handle datetime objects by extracting just the date part
        if hasattr(v, 'date'):
            extracted_date = v.date()
            print(f"[FECHA_VENCIMIENTO_VALIDATOR] Extracted date from datetime: {extracted_date}")
            return extracted_date
            
        print(f"[FECHA_VENCIMIENTO_VALIDATOR] Returning value as-is: {v}")
        return v

    @validator('peso_total')
    def validate_peso_total(cls, v, values):
        peso_unitario = values.get('peso_unitario')
        cantidad = values.get('cantidad')
        if peso_unitario and cantidad:
            peso_calculado = peso_unitario * cantidad
            # Permitir una pequeña diferencia por redondeo
            if abs(v - peso_calculado) > 0.001:
                raise ValueError(f'El peso total ({v}) no coincide con peso_unitario * cantidad ({peso_calculado})')
        return v

# Schema para crear producto (sin codigo, se genera automaticamente)
class ProductCreate(ProductBase):
    country_id: int = Field(..., description="ID del pais donde se crea el producto")

# Schema para actualizar producto
class ProductUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    lote: Optional[str] = Field(None, min_length=1, max_length=100)
    cantidad: Optional[int] = Field(None, ge=0)
    peso_unitario: Optional[float] = Field(None, gt=0)
    peso_total: Optional[float] = Field(None, gt=0)
    fecha_vencimiento: Optional[date] = None
    proveedor: Optional[str] = Field(None, min_length=1, max_length=255)
    responsable: Optional[str] = Field(None, min_length=1, max_length=255)
    comentarios: Optional[str] = Field(None, max_length=1000)
    categoria_id: Optional[int] = None

# Schema de respuesta básico
class ProductBase_Response(BaseModel):
    id: int
    codigo: str
    nombre: str
    lote: str
    cantidad: int
    peso_unitario: float
    peso_total: float
    fecha_registro: date
    fecha_vencimiento: date
    proveedor: str
    responsable: str
    comentarios: Optional[str]
    categoria_id: int
    country_id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Schema de respuesta completo con relaciones
class ProductResponse(ProductBase_Response):
    # Informacion calculada
    codigo_pais: str
    numero_secuencial: str
    dias_para_vencer: int
    estado_vencimiento: EstadoVencimientoEnum
    
    # Informacion de relaciones (opcional)
    categoria_nombre: Optional[str] = None
    country_nombre: Optional[str] = None
    creator_nombre: Optional[str] = None

# Schema para lista de productos (más completo para UI profesional)
class ProductList(BaseModel):
    id: int
    codigo: str
    nombre: str
    lote: str
    cantidad: int
    peso_unitario: float
    peso_total: float
    fecha_registro: date
    fecha_vencimiento: date
    proveedor: str
    responsable: str
    comentarios: Optional[str]
    categoria_nombre: str
    country_nombre: str
    estado_vencimiento: EstadoVencimientoEnum
    dias_para_vencer: int

    class Config:
        from_attributes = True

# Schema para filtros de búsqueda
class ProductFilters(BaseModel):
    search: Optional[str] = Field(None, description="Buscar en nombre, codigo o lote")
    categoria_id: Optional[int] = Field(None, description="Filtrar por categoria")
    estado_vencimiento: Optional[EstadoVencimientoEnum] = Field(None, description="Filtrar por estado")
    fecha_vencimiento_desde: Optional[date] = Field(None, description="Fecha vencimiento desde")
    fecha_vencimiento_hasta: Optional[date] = Field(None, description="Fecha vencimiento hasta")
    country_id: Optional[int] = Field(None, description="Filtrar por pais")

# Schema para estadisticas
class ProductStats(BaseModel):
    total_productos: int
    productos_vigentes: int
    productos_por_vencer: int
    productos_vencidos: int
    productos_este_mes: int
    
    class Config:
        from_attributes = True