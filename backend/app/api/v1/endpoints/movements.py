from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.config.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.schemas.movement import (
    MovementEntrada, MovementSalida, MovementAjuste,
    MovementResponse, MovementList, MovementFilters, MovementStats,
    KardexResponse
)
from app.services.movement_service import MovementService

router = APIRouter()

@router.get("/test")
async def test_movements():
    """Endpoint de prueba para verificar que los movimientos funcionan"""
    return {"message": "Movements endpoint working", "status": "ok"}

@router.options("/salida")
async def salida_options():
    """Handle preflight OPTIONS request for salida endpoint"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

@router.options("/entrada")
async def entrada_options():
    """Handle preflight OPTIONS request for entrada endpoint"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

@router.post("/entrada", response_model=MovementResponse, status_code=status.HTTP_201_CREATED)
async def registrar_entrada(
    entrada_data: MovementEntrada,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar entrada de inventario
    - Requiere rol: user o admin
    - Usuarios solo pueden hacer entradas en productos de sus paises asignados
    """
    # Agregar headers CORS explícitos
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    # Validar permisos
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para registrar entradas"
        )
    
    # Verificar acceso al producto (se hace en el servicio)
    if not current_user.is_admin:
        # Para usuarios normales, verificar que el producto pertenece a sus paises asignados
        from app.models.product import Product
        product = db.query(Product).filter(Product.id == entrada_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        user_country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        if product.country_id not in user_country_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para hacer entradas en este producto"
            )
    
    # Registrar entrada
    movement = MovementService.create_entrada(
        db=db,
        entrada_data=entrada_data,
        user_id=current_user.id
    )
    
    # Preparar respuesta
    return MovementResponse(
        id=movement.id,
        tipo=movement.tipo,
        cantidad=movement.cantidad,
        cantidad_anterior=movement.cantidad_anterior,
        cantidad_nueva=movement.cantidad_nueva,
        responsable=movement.responsable,
        motivo=movement.motivo,
        observaciones=movement.observaciones,
        fecha_movimiento=movement.fecha_movimiento,
        product_id=movement.product_id,
        user_id=movement.user_id,
        created_at=movement.created_at,
        updated_at=movement.updated_at or movement.created_at,
        product_codigo=movement.product.codigo if movement.product else None,
        product_nombre=movement.product.nombre if movement.product else None,
        user_email=movement.user.email if movement.user else None,
        user_full_name=movement.user.full_name if movement.user else None
    )

@router.post("/salida", response_model=MovementResponse, status_code=status.HTTP_201_CREATED)
async def registrar_salida(
    salida_data: MovementSalida,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar salida de inventario
    - Requiere rol: user o admin
    - Usuarios solo pueden hacer salidas en productos de sus paises asignados
    - Verifica que hay suficiente stock disponible
    """
    # Agregar headers CORS explícitos
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    # Validar permisos
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para registrar salidas"
        )
    
    # Verificar acceso al producto
    if not current_user.is_admin:
        from app.models.product import Product
        product = db.query(Product).filter(Product.id == salida_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        user_country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        if product.country_id not in user_country_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para hacer salidas en este producto"
            )
    
    # Registrar salida
    movement = MovementService.create_salida(
        db=db,
        salida_data=salida_data,
        user_id=current_user.id
    )
    
    # Preparar respuesta
    return MovementResponse(
        id=movement.id,
        tipo=movement.tipo,
        cantidad=movement.cantidad,
        cantidad_anterior=movement.cantidad_anterior,
        cantidad_nueva=movement.cantidad_nueva,
        responsable=movement.responsable,
        motivo=movement.motivo,
        observaciones=movement.observaciones,
        fecha_movimiento=movement.fecha_movimiento,
        product_id=movement.product_id,
        user_id=movement.user_id,
        created_at=movement.created_at,
        updated_at=movement.updated_at or movement.created_at,
        product_codigo=movement.product.codigo if movement.product else None,
        product_nombre=movement.product.nombre if movement.product else None,
        user_email=movement.user.email if movement.user else None,
        user_full_name=movement.user.full_name if movement.user else None
    )

@router.post("/ajuste", response_model=MovementResponse, status_code=status.HTTP_201_CREATED)
async def registrar_ajuste(
    ajuste_data: MovementAjuste,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registrar ajuste de inventario
    - Requiere rol: admin (solo administradores pueden hacer ajustes)
    """
    # Solo administradores pueden hacer ajustes
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar ajustes de inventario"
        )
    
    # Registrar ajuste
    movement = MovementService.create_ajuste(
        db=db,
        ajuste_data=ajuste_data,
        user_id=current_user.id
    )
    
    # Preparar respuesta
    return MovementResponse(
        id=movement.id,
        tipo=movement.tipo,
        cantidad=movement.cantidad,
        cantidad_anterior=movement.cantidad_anterior,
        cantidad_nueva=movement.cantidad_nueva,
        responsable=movement.responsable,
        motivo=movement.motivo,
        observaciones=movement.observaciones,
        fecha_movimiento=movement.fecha_movimiento,
        product_id=movement.product_id,
        user_id=movement.user_id,
        created_at=movement.created_at,
        updated_at=movement.updated_at or movement.created_at,
        product_codigo=movement.product.codigo if movement.product else None,
        product_nombre=movement.product.nombre if movement.product else None,
        user_email=movement.user.email if movement.user else None,
        user_full_name=movement.user.full_name if movement.user else None
    )

@router.get("/", response_model=List[MovementList])
async def get_movements(
    search: Optional[str] = Query(None, description="Buscar en codigo, nombre, responsable, motivo"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: entrada, salida, ajuste, inicial"),
    product_id: Optional[int] = Query(None, description="Filtrar por producto"),
    responsable: Optional[str] = Query(None, description="Filtrar por responsable"),
    country_id: Optional[int] = Query(None, description="Filtrar por pais"),
    fecha_desde: Optional[datetime] = Query(None, description="Fecha desde (YYYY-MM-DD o YYYY-MM-DD HH:MM:SS)"),
    fecha_hasta: Optional[datetime] = Query(None, description="Fecha hasta (YYYY-MM-DD o YYYY-MM-DD HH:MM:SS)"),
    skip: int = Query(0, ge=0, description="Registros a omitir"),
    limit: int = Query(100, ge=1, le=25000, description="Limite de registros (máximo 25,000 para exportación)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de movimientos
    - Usuarios ven solo movimientos de productos de sus paises asignados
    - Admins pueden ver todos los movimientos
    """
    try:
        # Debug: imprimir parámetros recibidos
        print(f"[MOVEMENTS] Parameters received:")
        print(f"  search: {search}")
        print(f"  tipo: {tipo}")
        print(f"  product_id: {product_id}")
        print(f"  responsable: {responsable}")
        print(f"  country_id: {country_id}")
        print(f"  fecha_desde: {fecha_desde}")
        print(f"  fecha_hasta: {fecha_hasta}")
        
        # Construir filtros
        filters = MovementFilters(
            search=search,
            tipo=tipo,
            product_id=product_id,
            responsable=responsable,
            country_id=country_id,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta
        )
        
        print(f"[MOVEMENTS] Filters object created: {filters}")
        print(f"[MOVEMENTS] Filters.tipo value: {filters.tipo}")
        
        # Determinar paises segun rol del usuario
        country_ids = None
        if not current_user.is_admin:
            country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
            if not country_ids:
                # Si no hay movimientos, devolver lista vacía en lugar de error
                return []
        
        # Obtener movimientos
        movements = MovementService.get_movements(
            db=db,
            filters=filters,
            skip=skip,
            limit=limit,
            country_ids=country_ids
        )
        
        # Convertir a lista simplificada
        result = []
        for movement in movements:
            result.append(MovementList(
                id=movement.id,
                tipo=movement.tipo,
                cantidad=movement.cantidad,
                cantidad_anterior=movement.cantidad_anterior,
                cantidad_nueva=movement.cantidad_nueva,
                responsable=movement.responsable,
                motivo=movement.motivo,
                fecha_movimiento=movement.fecha_movimiento,
                product_codigo=movement.product.codigo if movement.product else "",
                product_nombre=movement.product.nombre if movement.product else "",
                user_full_name=movement.user.full_name if movement.user else "",
                diferencia=movement.diferencia
            ))
        
        return result
        
    except Exception as e:
        print(f"Error in get_movements: {str(e)}")
        # Devolver lista vacía si hay error para evitar que falle la página
        return []

@router.get("/{movement_id}", response_model=MovementResponse)
async def get_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener movimiento por ID
    - Usuarios solo pueden ver movimientos de productos de sus paises asignados
    """
    # Determinar paises segun rol del usuario
    country_ids = None
    if not current_user.is_admin:
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        if not country_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene paises asignados"
            )
    
    movement = MovementService.get_movement_by_id(
        db=db,
        movement_id=movement_id,
        country_ids=country_ids
    )
    
    if not movement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimiento no encontrado"
        )
    
    return MovementResponse(
        id=movement.id,
        tipo=movement.tipo,
        cantidad=movement.cantidad,
        cantidad_anterior=movement.cantidad_anterior,
        cantidad_nueva=movement.cantidad_nueva,
        responsable=movement.responsable,
        motivo=movement.motivo,
        observaciones=movement.observaciones,
        fecha_movimiento=movement.fecha_movimiento,
        product_id=movement.product_id,
        user_id=movement.user_id,
        created_at=movement.created_at,
        updated_at=movement.updated_at or movement.created_at,
        product_codigo=movement.product.codigo if movement.product else None,
        product_nombre=movement.product.nombre if movement.product else None,
        user_email=movement.user.email if movement.user else None,
        user_full_name=movement.user.full_name if movement.user else None
    )

@router.get("/kardex/{product_id}", response_model=KardexResponse)
async def get_kardex_by_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener Kardex (historial completo) de un producto
    - Usuarios solo pueden ver Kardex de productos de sus paises asignados
    """
    # Determinar paises segun rol del usuario
    country_ids = None
    if not current_user.is_admin:
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        if not country_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene paises asignados"
            )
    
    kardex_data = MovementService.get_kardex_by_product(
        db=db,
        product_id=product_id,
        country_ids=country_ids
    )
    
    if not kardex_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado o sin acceso"
        )
    
    return KardexResponse(**kardex_data)

@router.get("/stats/summary", response_model=MovementStats)
async def get_movement_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener estadisticas de movimientos
    - Usuarios ven estadisticas de sus paises asignados
    - Admins ven estadisticas globales
    """
    # Solo usuarios y admins pueden ver estadisticas
    if current_user.is_commercial:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rol comercial no tiene acceso a estadisticas de movimientos"
        )
    
    # Determinar paises segun rol del usuario
    country_ids = None
    if not current_user.is_admin:
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        if not country_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene paises asignados"
            )
    
    stats = MovementService.get_movement_stats(
        db=db,
        country_ids=country_ids
    )
    
    return MovementStats(**stats)