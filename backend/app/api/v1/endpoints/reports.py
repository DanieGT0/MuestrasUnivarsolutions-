from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.config.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.schemas.report import (
    StockByCategoryResponse, StockByCategoryItem,
    MovementsSummaryResponse, MovementTimelineResponse, MovementTimelineItem,
    CountrySummaryResponse, CountrySummaryItem,
    LowStockAlertsResponse, LowStockAlert,
    InventoryTableResponse, InventoryTableItem, PageInfo,
    CommercialDashboardData, CommercialReportFilters,
    TimeGroupBy, AlertLevel, StockStatus
)
from app.services.report_service import ReportService
from app.core.role_permissions import RolePermissions, require_module_access

router = APIRouter()

@router.get("/test")
async def test_reports():
    """Endpoint de prueba para verificar que los reportes funcionan"""
    return {"message": "Reports endpoint working", "status": "ok"}

@router.get("/commercial/stock-by-category", response_model=StockByCategoryResponse)
@require_module_access("reports")
async def get_stock_by_category(
    category_id: Optional[int] = Query(None, description="Filtrar por categoria especifica"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener stock agrupado por categoria
    - Para usuarios con acceso a reportes (admin, user, comercial)
    - Aplica filtros según permisos del usuario
    """
    # Filtrar países según permisos del usuario
    allowed_country_ids = RolePermissions.filter_countries(current_user)
    
    # Si el usuario no tiene países asignados y requiere filtro, no puede ver nada
    if allowed_country_ids is not None and not allowed_country_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not allowed_country_ids and current_user.is_admin:
        allowed_country_ids = None
    
    # Obtener datos
    stock_data = ReportService.get_commercial_stock_by_category(
        db=db,
        country_ids=allowed_country_ids,
        category_id=category_id
    )
    
    total_stock = sum(item["total_stock"] for item in stock_data)
    total_categories = len(stock_data)
    
    return StockByCategoryResponse(
        data=[StockByCategoryItem(**item) for item in stock_data],
        total_stock=total_stock,
        total_categories=total_categories
    )

@router.get("/commercial/movements-summary", response_model=MovementsSummaryResponse)
async def get_movements_summary(
    fecha_desde: Optional[datetime] = Query(None, description="Fecha inicio del periodo"),
    fecha_hasta: Optional[datetime] = Query(None, description="Fecha fin del periodo"),
    category_id: Optional[int] = Query(None, description="Filtrar por categoria"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener resumen de movimientos
    - Solo para usuarios comerciales
    - Filtros por fechas y categoria
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Si no se especifican fechas, usar ultimo mes
    if not fecha_desde:
        fecha_desde = datetime.now() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = datetime.now()
    
    # Obtener resumen
    summary = ReportService.get_commercial_movements_summary(
        db=db,
        country_ids=country_ids,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        category_id=category_id
    )
    
    return MovementsSummaryResponse(**summary)

@router.get("/commercial/movements-timeline", response_model=MovementTimelineResponse)
async def get_movements_timeline(
    fecha_desde: Optional[datetime] = Query(None, description="Fecha inicio del periodo"),
    fecha_hasta: Optional[datetime] = Query(None, description="Fecha fin del periodo"),
    group_by: TimeGroupBy = Query(TimeGroupBy.DAY, description="Agrupar por: day, week, month"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener timeline de movimientos
    - Solo para usuarios comerciales
    - Agrupado por dia, semana o mes
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Si no se especifican fechas, usar ultimo mes
    if not fecha_desde:
        fecha_desde = datetime.now() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = datetime.now()
    
    # Obtener timeline
    timeline_data = ReportService.get_commercial_movements_timeline(
        db=db,
        country_ids=country_ids,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        group_by=group_by.value
    )
    
    return MovementTimelineResponse(
        data=[MovementTimelineItem(**item) for item in timeline_data],
        group_by=group_by,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta
    )

@router.get("/commercial/countries-summary", response_model=CountrySummaryResponse)
async def get_countries_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener resumen por paises asignados
    - Solo para usuarios comerciales
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Obtener resumen por paises
    countries_data = ReportService.get_commercial_countries_summary(
        db=db,
        country_ids=country_ids
    )
    
    return CountrySummaryResponse(
        data=[CountrySummaryItem(**item) for item in countries_data],
        total_countries=len(countries_data)
    )

@router.get("/commercial/low-stock-alerts", response_model=LowStockAlertsResponse)
async def get_low_stock_alerts(
    min_stock_threshold: int = Query(10, ge=0, le=100, description="Umbral minimo de stock"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener alertas de stock bajo
    - Solo para usuarios comerciales
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Obtener alertas
    alerts_data = ReportService.get_commercial_low_stock_alerts(
        db=db,
        country_ids=country_ids,
        min_stock_threshold=min_stock_threshold
    )
    
    # Contar por nivel de alerta
    critical_count = sum(1 for alert in alerts_data if alert["alert_level"] == "critical")
    warning_count = sum(1 for alert in alerts_data if alert["alert_level"] == "warning")
    
    return LowStockAlertsResponse(
        alerts=[LowStockAlert(**alert) for alert in alerts_data],
        total_alerts=len(alerts_data),
        critical_count=critical_count,
        warning_count=warning_count
    )

@router.get("/commercial/dashboard", response_model=CommercialDashboardData)
async def get_commercial_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todos los datos del dashboard comercial
    - Solo para usuarios comerciales
    - Combina todos los reportes en una sola respuesta
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Obtener todos los datos
    stock_data = ReportService.get_commercial_stock_by_category(db=db, country_ids=country_ids)
    
    # Resumen de movimientos del ultimo mes
    fecha_desde = datetime.now() - timedelta(days=30)
    fecha_hasta = datetime.now()
    movements_summary = ReportService.get_commercial_movements_summary(
        db=db, country_ids=country_ids, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta
    )
    
    countries_data = ReportService.get_commercial_countries_summary(db=db, country_ids=country_ids)
    
    alerts_data = ReportService.get_commercial_low_stock_alerts(db=db, country_ids=country_ids)
    
    return CommercialDashboardData(
        stock_by_category=[StockByCategoryItem(**item) for item in stock_data],
        movements_summary=MovementsSummaryResponse(**movements_summary),
        countries_summary=[CountrySummaryItem(**item) for item in countries_data],
        low_stock_alerts=[LowStockAlert(**alert) for alert in alerts_data],
        last_updated=datetime.now()
    )

@router.get("/commercial/inventory-table", response_model=InventoryTableResponse)
async def get_inventory_table(
    category_id: Optional[int] = Query(None, description="Filtrar por categoria especifica"),
    limit: int = Query(100, ge=1, le=500, description="Número de registros por página"),
    offset: int = Query(0, ge=0, description="Número de registros a saltar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener tabla completa de inventarios
    - Solo para usuarios autenticados
    - Muestra productos de países y categorías asignados
    - Incluye paginación
    """
    # Solo usuarios autenticados pueden acceder (admin, user, commercial)
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Obtener datos de inventario
    inventory_data = ReportService.get_commercial_inventory_table(
        db=db,
        country_ids=country_ids,
        category_id=category_id,
        limit=limit,
        offset=offset
    )
    
    return InventoryTableResponse(
        products=[InventoryTableItem(**item) for item in inventory_data["products"]],
        total_count=inventory_data["total_count"],
        page_info=PageInfo(**inventory_data["page_info"])
    )

@router.get("/commercial/inventory-rotation")
async def get_inventory_rotation_metrics(
    category_id: Optional[int] = Query(None, description="Filtrar por categoria especifica"),
    days_back: int = Query(90, ge=30, le=365, description="Días hacia atrás para análisis"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener métricas de rotación de inventario y días de permanencia
    - Días desde primera entrada
    - Velocidad de salida (unidades/día)
    - Tasa de rotación por producto
    - Clasificación por edad del stock
    """
    # Solo usuarios autenticados pueden acceder
    if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a estos reportes"
        )
    
    # Obtener paises asignados
    country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
    
    # Para usuarios admin, si no tienen países asignados, pueden ver todos
    if not country_ids and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene paises asignados"
        )
    
    # Si es admin sin países asignados, pasar None para ver todos
    if not country_ids and current_user.is_admin:
        country_ids = None
    
    # Obtener métricas de rotación
    rotation_metrics = ReportService.get_inventory_rotation_metrics(
        db=db,
        country_ids=country_ids,
        category_id=category_id,
        days_back=days_back
    )
    
    return rotation_metrics