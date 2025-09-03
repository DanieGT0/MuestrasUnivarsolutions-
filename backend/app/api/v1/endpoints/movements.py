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

@router.get("/test-movements-simple")
async def test_movements_simple(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Endpoint de prueba simple para verificar movimientos"""
    try:
        from app.models.movement import Movement
        from app.models.product import Product
        
        # Contar movimientos totales
        total_movements = db.query(Movement).count()
        
        # Obtener algunos movimientos simples
        movements = db.query(Movement).join(Product).limit(5).all()
        
        simple_movements = []
        for movement in movements:
            simple_movements.append({
                "id": movement.id,
                "tipo": movement.tipo.value if movement.tipo else None,
                "cantidad": movement.cantidad,
                "responsable": movement.responsable,
                "motivo": movement.motivo,
                "product_codigo": movement.product.codigo if movement.product else "N/A",
                "product_nombre": movement.product.nombre if movement.product else "N/A"
            })
        
        return {
            "message": "Simple movements test",
            "total_movements": total_movements,
            "sample_movements": simple_movements,
            "user_countries": current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        }
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.post("/fix-missing-initial-movements")
async def fix_missing_initial_movements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear movimientos iniciales faltantes para productos que no los tienen"""
    try:
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo administradores pueden ejecutar esta función"
            )
        
        from app.models.product import Product
        from app.models.movement import Movement, MovementType
        
        # Encontrar productos sin movimientos iniciales
        products_without_movements = db.query(Product).filter(
            ~Product.id.in_(
                db.query(Movement.product_id).filter(
                    Movement.tipo == MovementType.INICIAL
                ).subquery()
            )
        ).all()
        
        created_movements = 0
        for product in products_without_movements:
            # Crear movimiento inicial
            from app.services.movement_service import MovementService
            MovementService.create_initial_stock(
                db=db,
                product_id=product.id,
                cantidad_inicial=product.cantidad,
                user_id=current_user.id
            )
            created_movements += 1
        
        return {
            "message": f"Created {created_movements} initial movements",
            "products_fixed": len(products_without_movements),
            "created_movements": created_movements
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

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
    try:
        print(f"[ENTRADA_DEBUG] Starting entrada registration")
        print(f"[ENTRADA_DEBUG] User ID: {current_user.id}")
        print(f"[ENTRADA_DEBUG] User Role: {current_user.role.name if current_user.role else 'No role'}")
        print(f"[ENTRADA_DEBUG] User is_admin: {current_user.is_admin}")
        print(f"[ENTRADA_DEBUG] User is_user: {current_user.is_user}")
        print(f"[ENTRADA_DEBUG] Entrada data: {entrada_data}")
        
        # Agregar headers CORS explícitos
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        
        # Validar permisos
        if not (current_user.is_admin or current_user.is_user):
            print(f"[ENTRADA_DEBUG] Permission denied - user role: {current_user.role.name if current_user.role else 'No role'}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para registrar entradas"
            )
        
        print(f"[ENTRADA_DEBUG] Permissions validated")
        
        # Verificar acceso al producto (se hace en el servicio)
        if not current_user.is_admin:
            print(f"[ENTRADA_DEBUG] Checking product access for non-admin user")
            # Para usuarios normales, verificar que el producto pertenece a sus paises asignados
            from app.models.product import Product
            product = db.query(Product).filter(Product.id == entrada_data.product_id).first()
            if not product:
                print(f"[ENTRADA_DEBUG] Product not found: {entrada_data.product_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto no encontrado"
                )
            
            user_country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
            print(f"[ENTRADA_DEBUG] User country IDs: {user_country_ids}")
            print(f"[ENTRADA_DEBUG] Product country ID: {product.country_id}")
            
            if product.country_id not in user_country_ids:
                print(f"[ENTRADA_DEBUG] No access to product country")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permisos para hacer entradas en este producto"
                )
        
        print(f"[ENTRADA_DEBUG] Product access validated, calling service")
        
        # Registrar entrada
        movement = MovementService.create_entrada(
            db=db,
            entrada_data=entrada_data,
            user_id=current_user.id
        )
        
        print(f"[ENTRADA_DEBUG] Movement created successfully: {movement.id}")
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ENTRADA_DEBUG] Unexpected error: {str(e)}")
        print(f"[ENTRADA_DEBUG] Error type: {type(e).__name__}")
        import traceback
        print(f"[ENTRADA_DEBUG] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
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
        if current_user.is_admin:
            # Admin puede ver todos los movimientos sin restricción
            print(f"[MOVEMENTS] Admin user - showing all movements without country restriction")
            country_ids = None
        else:
            # Usuarios normales solo ven movimientos de sus países asignados
            country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
            print(f"[MOVEMENTS] Non-admin user - filtering by country_ids: {country_ids}")
            if not country_ids:
                # Si no hay países asignados, devolver lista vacía en lugar de error
                print(f"[MOVEMENTS] User has no assigned countries - returning empty list")
                return []
        
        # Obtener movimientos
        print(f"[MOVEMENTS] Calling MovementService.get_movements with country_ids: {country_ids}")
        movements = MovementService.get_movements(
            db=db,
            filters=filters,
            skip=skip,
            limit=limit,
            country_ids=country_ids
        )
        
        print(f"[MOVEMENTS] Retrieved {len(movements)} movements from service")
        
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
        
        print(f"[MOVEMENTS] Created {len(result)} MovementList objects")
        print(f"[MOVEMENTS] Returning result with {len(result)} movements")
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