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

@router.get("/test-inventory-simple")
async def test_inventory_simple(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Endpoint de prueba simple para inventory sin usar ReportService"""
    try:
        print(f"[TEST_INVENTORY] Starting simple test")
        print(f"[TEST_INVENTORY] User: {current_user.email}")
        
        # Consulta simple de productos
        from app.models.product import Product
        products = db.query(Product).limit(5).all()
        print(f"[TEST_INVENTORY] Found {len(products)} products")
        
        simple_data = []
        for product in products:
            simple_data.append({
                "id": product.id,
                "codigo": product.codigo,
                "nombre": product.nombre,
                "cantidad": product.cantidad
            })
        
        print(f"[TEST_INVENTORY] Returning {len(simple_data)} products")
        return {
            "message": "Simple inventory test successful",
            "products": simple_data,
            "total": len(simple_data)
        }
    except Exception as e:
        print(f"[TEST_INVENTORY] Error: {str(e)}")
        import traceback
        print(f"[TEST_INVENTORY] Traceback: {traceback.format_exc()}")
        return {"error": str(e), "message": "Test failed"}

@router.get("/commercial/inventory-table-simplified")
async def get_inventory_table_simplified(
    category_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Versión simplificada de inventory table sin usar ReportService"""
    try:
        print(f"[SIMPLE_INVENTORY] Starting simplified inventory table")
        
        from app.models.product import Product
        from app.models.category import Category
        from app.models.country import Country
        
        # Query básica con joins
        query = db.query(Product).join(
            Category, Product.categoria_id == Category.id, isouter=True
        ).join(
            Country, Product.country_id == Country.id, isouter=True
        )
        
        # Filtros según usuario
        if not current_user.is_admin:
            country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
            if country_ids:
                query = query.filter(Product.country_id.in_(country_ids))
        
        if category_id:
            query = query.filter(Product.categoria_id == category_id)
        
        # Total count
        total_count = query.count()
        
        # Paginated results
        products = query.offset(offset).limit(limit).all()
        
        # Format response
        products_data = []
        for product in products:
            products_data.append({
                "product_id": product.id,
                "codigo": product.codigo,
                "nombre": product.nombre,
                "lote": product.lote,
                "cantidad": product.cantidad,
                "peso_unitario": product.peso_unitario,
                "peso_total": product.peso_total,
                "fecha_registro": product.fecha_registro,
                "fecha_vencimiento": product.fecha_vencimiento,
                "proveedor": product.proveedor,
                "responsable": product.responsable,
                "categoria_nombre": product.categoria.name if product.categoria else "",
                "categoria_id": product.categoria_id,
                "pais_nombre": product.country.name if product.country else "",
                "pais_id": product.country_id,
                "comentarios": product.comentarios,
                "stock_status": "critical" if product.cantidad <= 5 else "warning" if product.cantidad <= 10 else "normal"
            })
        
        return {
            "products": products_data,
            "total_count": total_count,
            "page_info": {
                "limit": limit,
                "offset": offset,
                "has_next": (offset + limit) < total_count,
                "has_prev": offset > 0
            }
        }
        
    except Exception as e:
        print(f"[SIMPLE_INVENTORY] Error: {str(e)}")
        import traceback
        print(f"[SIMPLE_INVENTORY] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )

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
    try:
        print(f"[INVENTORY_TABLE] Starting inventory table endpoint")
        print(f"[INVENTORY_TABLE] User ID: {current_user.id}")
        print(f"[INVENTORY_TABLE] Category ID: {category_id}")
        print(f"[INVENTORY_TABLE] Limit: {limit}, Offset: {offset}")
        
        # Solo usuarios autenticados pueden acceder (admin, user, commercial)
        if not (current_user.is_admin or current_user.is_user or current_user.is_commercial):
            print(f"[INVENTORY_TABLE] User doesn't have required permissions")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a estos reportes"
            )
        
        # Obtener paises asignados
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        print(f"[INVENTORY_TABLE] User country IDs: {country_ids}")
        
        # Para usuarios admin, si no tienen países asignados, pueden ver todos
        if not country_ids and not current_user.is_admin:
            print(f"[INVENTORY_TABLE] User has no assigned countries")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene paises asignados"
            )
        
        # Si es admin sin países asignados, pasar None para ver todos
        if not country_ids and current_user.is_admin:
            country_ids = None
            print(f"[INVENTORY_TABLE] Admin user, allowing all countries")
        
        # Obtener datos de inventario
        print(f"[INVENTORY_TABLE] Calling ReportService.get_commercial_inventory_table")
        try:
            inventory_data = ReportService.get_commercial_inventory_table(
                db=db,
                country_ids=country_ids,
                category_id=category_id,
                limit=limit,
                offset=offset
            )
            print(f"[INVENTORY_TABLE] Retrieved {len(inventory_data['products'])} products")
        except Exception as service_error:
            print(f"[INVENTORY_TABLE] ReportService error: {str(service_error)}")
            import traceback
            print(f"[INVENTORY_TABLE] ReportService traceback: {traceback.format_exc()}")
            raise
        
        print(f"[INVENTORY_TABLE] Creating InventoryTableResponse")
        try:
            response = InventoryTableResponse(
                products=[InventoryTableItem(**item) for item in inventory_data["products"]],
                total_count=inventory_data["total_count"],
                page_info=PageInfo(**inventory_data["page_info"])
            )
            print(f"[INVENTORY_TABLE] Response created successfully")
        except Exception as response_error:
            print(f"[INVENTORY_TABLE] Response creation error: {str(response_error)}")
            import traceback
            print(f"[INVENTORY_TABLE] Response creation traceback: {traceback.format_exc()}")
            raise
        
        print(f"[INVENTORY_TABLE] Returning response successfully")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"[INVENTORY_TABLE] Unexpected error: {str(e)}")
        print(f"[INVENTORY_TABLE] Error type: {type(e)}")
        import traceback
        print(f"[INVENTORY_TABLE] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
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