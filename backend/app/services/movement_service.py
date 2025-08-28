from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Tuple
from datetime import datetime
import pytz
from app.config.settings import settings

from app.models.movement import Movement, MovementType
from app.models.product import Product
from app.models.user import User
from app.schemas.movement import (
    MovementCreate, MovementEntrada, MovementSalida, MovementAjuste,
    MovementResponse, MovementList, MovementFilters, MovementStats,
    KardexEntry, KardexResponse
)
from fastapi import HTTPException, status

class MovementService:
    
    @staticmethod
    def _get_current_time():
        """Obtener tiempo actual en timezone de Centro América"""
        try:
            # Usar timezone configurado
            tz = pytz.timezone(settings.TIMEZONE)
            # Obtener tiempo actual en timezone específico
            now_utc = datetime.utcnow()
            utc_tz = pytz.UTC
            local_tz = pytz.timezone(settings.TIMEZONE)
            
            # Convertir UTC a tiempo local
            utc_time = utc_tz.localize(now_utc)
            local_time = utc_time.astimezone(local_tz)
            
            # Retornar sin timezone info para SQLAlchemy
            return local_time.replace(tzinfo=None)
        except Exception as e:
            print(f"Error getting timezone: {e}")
            # Fallback: usar tiempo local de la máquina
            return datetime.now()
    
    @staticmethod
    def create_entrada(
        db: Session,
        entrada_data: MovementEntrada,
        user_id: int
    ) -> Movement:
        """Registrar una entrada de inventario"""
        
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == entrada_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Cantidad anterior y nueva
        cantidad_anterior = product.cantidad
        cantidad_nueva = cantidad_anterior + entrada_data.cantidad
        
        # Crear el movimiento
        movement = Movement(
            tipo=MovementType.ENTRADA,
            cantidad=entrada_data.cantidad,
            cantidad_anterior=cantidad_anterior,
            cantidad_nueva=cantidad_nueva,
            responsable=entrada_data.responsable,
            motivo=entrada_data.motivo,
            observaciones=entrada_data.observaciones,
            fecha_movimiento=MovementService._get_current_time(),
            product_id=entrada_data.product_id,
            user_id=user_id
        )
        
        # Actualizar cantidad del producto
        product.cantidad = cantidad_nueva
        
        # Guardar en la base de datos
        db.add(movement)
        db.commit()
        db.refresh(movement)
        
        return movement
    
    @staticmethod
    def create_salida(
        db: Session,
        salida_data: MovementSalida,
        user_id: int
    ) -> Movement:
        """Registrar una salida de inventario"""
        
        print(f"=== SALIDA DEBUG ===")
        print(f"Product ID: {salida_data.product_id}")
        print(f"Cantidad solicitada: {salida_data.cantidad}")
        print(f"User ID: {user_id}")
        
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == salida_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        print(f"Stock actual del producto: {product.cantidad}")
        
        # Verificar que hay suficiente stock
        if product.cantidad < salida_data.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Stock actual: {product.cantidad}, Cantidad solicitada: {salida_data.cantidad}"
            )
        
        # Cantidad anterior y nueva
        cantidad_anterior = product.cantidad
        cantidad_nueva = cantidad_anterior - salida_data.cantidad
        
        print(f"Cantidad anterior: {cantidad_anterior}")
        print(f"Cantidad nueva: {cantidad_nueva}")
        
        # Crear el movimiento
        movement = Movement(
            tipo=MovementType.SALIDA,
            cantidad=salida_data.cantidad,
            cantidad_anterior=cantidad_anterior,
            cantidad_nueva=cantidad_nueva,
            responsable=salida_data.responsable,
            motivo=salida_data.motivo,
            observaciones=salida_data.observaciones,
            fecha_movimiento=MovementService._get_current_time(),
            product_id=salida_data.product_id,
            user_id=user_id
        )
        
        # Actualizar cantidad del producto
        product.cantidad = cantidad_nueva
        print(f"Stock actualizado del producto: {product.cantidad}")
        
        # Guardar en la base de datos
        db.add(movement)
        db.commit()
        db.refresh(movement)
        
        print(f"Movimiento creado con ID: {movement.id}")
        print(f"=== FIN SALIDA DEBUG ===")
        
        return movement
    
    @staticmethod
    def create_ajuste(
        db: Session,
        ajuste_data: MovementAjuste,
        user_id: int
    ) -> Movement:
        """Registrar un ajuste de inventario"""
        
        # Verificar que el producto existe
        product = db.query(Product).filter(Product.id == ajuste_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Cantidad anterior y nueva
        cantidad_anterior = product.cantidad
        cantidad_nueva = ajuste_data.cantidad_nueva
        
        # Calcular la diferencia para el campo cantidad
        diferencia = abs(cantidad_nueva - cantidad_anterior)
        
        # Crear el movimiento
        movement = Movement(
            tipo=MovementType.AJUSTE,
            cantidad=diferencia,
            cantidad_anterior=cantidad_anterior,
            cantidad_nueva=cantidad_nueva,
            responsable=ajuste_data.responsable,
            motivo=ajuste_data.motivo,
            observaciones=ajuste_data.observaciones,
            fecha_movimiento=MovementService._get_current_time(),
            product_id=ajuste_data.product_id,
            user_id=user_id
        )
        
        # Actualizar cantidad del producto
        product.cantidad = cantidad_nueva
        
        # Guardar en la base de datos
        db.add(movement)
        db.commit()
        db.refresh(movement)
        
        return movement
    
    @staticmethod
    def create_initial_stock(
        db: Session,
        product_id: int,
        cantidad_inicial: int,
        user_id: int
    ) -> Movement:
        """Registrar el stock inicial cuando se crea un producto"""
        
        movement = Movement(
            tipo=MovementType.INICIAL,
            cantidad=cantidad_inicial,
            cantidad_anterior=0,
            cantidad_nueva=cantidad_inicial,
            responsable="Sistema",
            motivo="Stock inicial del producto",
            observaciones="Registro automatico al crear el producto",
            fecha_movimiento=MovementService._get_current_time(),
            product_id=product_id,
            user_id=user_id
        )
        
        db.add(movement)
        db.commit()
        db.refresh(movement)
        
        return movement
    
    @staticmethod
    def get_movements(
        db: Session,
        filters: MovementFilters,
        skip: int = 0,
        limit: int = 100,
        country_ids: Optional[List[int]] = None
    ) -> List[Movement]:
        """Obtener lista de movimientos con filtros"""
        
        query = db.query(Movement).options(
            joinedload(Movement.product),
            joinedload(Movement.user)
        )
        
        # Determinar si necesitamos hacer JOIN con Product
        need_product_join = (
            country_ids is not None or 
            filters.country_id or 
            filters.search or 
            filters.product_id
        )
        
        if need_product_join:
            query = query.join(Product)
        
        # Filtrar por pa�ses si se especifica (para usuarios no admin)
        if country_ids is not None:
            query = query.filter(Product.country_id.in_(country_ids))
        elif filters.country_id:
            # Filtro específico por país (para admins)
            query = query.filter(Product.country_id == filters.country_id)
        
        # Aplicar filtros
        if filters.search:
            if need_product_join:
                search_filter = or_(
                    Product.codigo.ilike(f"%{filters.search}%"),
                    Product.nombre.ilike(f"%{filters.search}%"),
                    Movement.responsable.ilike(f"%{filters.search}%"),
                    Movement.motivo.ilike(f"%{filters.search}%")
                )
            else:
                search_filter = or_(
                    Movement.responsable.ilike(f"%{filters.search}%"),
                    Movement.motivo.ilike(f"%{filters.search}%")
                )
            query = query.filter(search_filter)
        
        if filters.tipo:
            # Convertir string a enum (de minúsculas del frontend a mayúsculas de la DB)
            try:
                # Convertir a mayúsculas para coincidir con la base de datos
                tipo_upper = filters.tipo.upper()
                tipo_enum = MovementType(tipo_upper)
                query = query.filter(Movement.tipo == tipo_enum)
                print(f"[MOVEMENT_SERVICE] Applied tipo filter: {filters.tipo} -> {tipo_upper} -> {tipo_enum}")
            except ValueError:
                # Si el string no es válido, no aplicar el filtro
                print(f"Warning: Invalid movement type filter: {filters.tipo}")
                pass
        
        if filters.product_id:
            query = query.filter(Movement.product_id == filters.product_id)
        
        if filters.fecha_desde:
            query = query.filter(Movement.fecha_movimiento >= filters.fecha_desde)
        
        if filters.fecha_hasta:
            query = query.filter(Movement.fecha_movimiento <= filters.fecha_hasta)
        
        if filters.responsable:
            query = query.filter(Movement.responsable.ilike(f"%{filters.responsable}%"))
        
        # Ordenar por fecha m�s reciente
        query = query.order_by(desc(Movement.fecha_movimiento))
        
        # Paginaci�n
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_movement_by_id(
        db: Session,
        movement_id: int,
        country_ids: Optional[List[int]] = None
    ) -> Optional[Movement]:
        """Obtener un movimiento por ID"""
        
        query = db.query(Movement).options(
            joinedload(Movement.product),
            joinedload(Movement.user)
        ).filter(Movement.id == movement_id)
        
        # Filtrar por pa�ses si se especifica
        if country_ids is not None:
            query = query.join(Product).filter(Product.country_id.in_(country_ids))
        
        return query.first()
    
    @staticmethod
    def get_kardex_by_product(
        db: Session,
        product_id: int,
        country_ids: Optional[List[int]] = None
    ) -> Optional[dict]:
        """Obtener el Kardex (historial completo) de un producto"""
        
        # Verificar que el producto existe y el usuario tiene acceso
        product_query = db.query(Product).filter(Product.id == product_id)
        
        if country_ids is not None:
            product_query = product_query.filter(Product.country_id.in_(country_ids))
        
        product = product_query.first()
        if not product:
            return None
        
        # Obtener todos los movimientos del producto
        movements = db.query(Movement).options(
            joinedload(Movement.user)
        ).filter(
            Movement.product_id == product_id
        ).order_by(Movement.fecha_movimiento.asc()).all()
        
        # Formatear para el Kardex
        kardex_entries = []
        for movement in movements:
            kardex_entries.append({
                "id": movement.id,
                "fecha": movement.fecha_movimiento,
                "tipo": movement.tipo,
                "motivo": movement.motivo,
                "responsable": movement.responsable,
                "cantidad_movimiento": movement.cantidad,
                "cantidad_anterior": movement.cantidad_anterior,
                "cantidad_nueva": movement.cantidad_nueva,
                "saldo": movement.cantidad_nueva,
                "observaciones": movement.observaciones
            })
        
        return {
            "product_id": product.id,
            "product_codigo": product.codigo,
            "product_nombre": product.nombre,
            "saldo_actual": product.cantidad,
            "movimientos": kardex_entries
        }
    
    @staticmethod
    def get_movement_stats(
        db: Session,
        country_ids: Optional[List[int]] = None
    ) -> dict:
        """Obtener estad�sticas de movimientos"""
        
        # Query base
        base_query = db.query(Movement)
        
        # Filtrar por pa�ses si se especifica
        if country_ids is not None:
            base_query = base_query.join(Product).filter(Product.country_id.in_(country_ids))
        
        # Total de movimientos
        total_movimientos = base_query.count()
        
        # Movimientos por tipo
        entradas_total = base_query.filter(Movement.tipo == MovementType.ENTRADA).count()
        salidas_total = base_query.filter(Movement.tipo == MovementType.SALIDA).count()
        ajustes_total = base_query.filter(Movement.tipo == MovementType.AJUSTE).count()
        
        # Movimientos del mes actual
        now = datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        movimientos_mes_actual = base_query.filter(
            Movement.fecha_movimiento >= start_of_month
        ).count()
        
        # Productos con movimientos
        productos_con_movimientos = base_query.with_entities(
            Movement.product_id
        ).distinct().count()
        
        return {
            "total_movimientos": total_movimientos,
            "entradas_total": entradas_total,
            "salidas_total": salidas_total,
            "ajustes_total": ajustes_total,
            "movimientos_mes_actual": movimientos_mes_actual,
            "productos_con_movimientos": productos_con_movimientos
        }