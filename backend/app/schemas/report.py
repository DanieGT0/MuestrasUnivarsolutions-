from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class TimeGroupBy(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"

class AlertLevel(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"

class StockStatus(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"

# Esquemas para Stock por Categoria
class StockByCategoryItem(BaseModel):
    """Item de stock agrupado por categoria"""
    category_id: int
    category_name: str
    total_stock: int
    total_products: int
    percentage: float
    
    class Config:
        from_attributes = True

class StockByCategoryResponse(BaseModel):
    """Respuesta completa de stock por categoria"""
    data: List[StockByCategoryItem]
    total_stock: int
    total_categories: int
    
    class Config:
        from_attributes = True

# Esquemas para Resumen de Movimientos
class MovementsSummaryResponse(BaseModel):
    """Resumen de movimientos comerciales"""
    total_entradas: int
    total_salidas: int
    total_ajustes: int
    diferencia_neta: int
    total_movimientos: int
    periodo: dict
    
    class Config:
        from_attributes = True

# Esquemas para Timeline de Movimientos
class MovementTimelineItem(BaseModel):
    """Item del timeline de movimientos"""
    periodo: str
    fecha: datetime
    entradas: int
    salidas: int
    ajustes: int
    total_movimientos: int
    
    class Config:
        from_attributes = True

class MovementTimelineResponse(BaseModel):
    """Respuesta del timeline de movimientos"""
    data: List[MovementTimelineItem]
    group_by: TimeGroupBy
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas para Resumen por Paises
class CountrySummaryItem(BaseModel):
    """Item de resumen por pais"""
    country_id: int
    country_name: str
    total_stock: int
    total_products: int
    percentage: float
    
    class Config:
        from_attributes = True

class CountrySummaryResponse(BaseModel):
    """Respuesta de resumen por paises"""
    data: List[CountrySummaryItem]
    total_countries: int
    
    class Config:
        from_attributes = True

# Esquemas para Alertas de Stock Bajo
class LowStockAlert(BaseModel):
    """Alerta de stock bajo"""
    product_id: int
    product_codigo: str
    product_nombre: str
    current_stock: int
    category_name: str
    country_name: str
    alert_level: AlertLevel
    
    class Config:
        from_attributes = True

class LowStockAlertsResponse(BaseModel):
    """Respuesta de alertas de stock bajo"""
    alerts: List[LowStockAlert]
    total_alerts: int
    critical_count: int
    warning_count: int
    
    class Config:
        from_attributes = True

# Esquemas para Dashboard Comercial Completo
class CommercialDashboardData(BaseModel):
    """Datos completos del dashboard comercial"""
    stock_by_category: List[StockByCategoryItem]
    movements_summary: MovementsSummaryResponse
    countries_summary: List[CountrySummaryItem]
    low_stock_alerts: List[LowStockAlert]
    last_updated: datetime
    
    class Config:
        from_attributes = True

# Filtros para reportes
class CommercialReportFilters(BaseModel):
    """Filtros para reportes comerciales"""
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    category_id: Optional[int] = None
    country_id: Optional[int] = None
    group_by: Optional[TimeGroupBy] = TimeGroupBy.DAY
    min_stock_threshold: Optional[int] = Field(default=10, ge=0, le=100)
    
    class Config:
        from_attributes = True

# Esquemas para Tabla de Inventarios
class InventoryTableItem(BaseModel):
    """Item de la tabla de inventarios"""
    product_id: int
    codigo: str
    nombre: str
    lote: Optional[str] = None
    cantidad: int
    peso_unitario: Optional[float] = None
    peso_total: Optional[float] = None
    fecha_registro: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    proveedor: Optional[str] = None
    responsable: Optional[str] = None
    categoria_nombre: str
    categoria_id: Optional[int] = None
    pais_nombre: str
    pais_id: Optional[int] = None
    comentarios: Optional[str] = None
    stock_status: StockStatus
    
    class Config:
        from_attributes = True

class PageInfo(BaseModel):
    """Información de paginación"""
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
    
    class Config:
        from_attributes = True

class InventoryTableResponse(BaseModel):
    """Respuesta de la tabla de inventarios"""
    products: List[InventoryTableItem]
    total_count: int
    page_info: PageInfo
    
    class Config:
        from_attributes = True