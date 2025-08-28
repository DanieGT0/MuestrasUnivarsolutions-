from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc, case
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

from app.models.product import Product
from app.models.category import Category
from app.models.country import Country
from app.models.movement import Movement, MovementType
from app.models.user import User

class ReportService:
    
    @staticmethod
    def get_commercial_stock_by_category(
        db: Session,
        country_ids: Optional[List[int]] = None,
        category_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Obtener stock agrupado por categoria para usuarios comerciales"""
        
        query = db.query(
            Category.id.label('category_id'),
            Category.name.label('category_name'),
            func.sum(Product.cantidad).label('total_stock'),
            func.count(Product.id).label('total_products')
        ).join(
            Product, Product.categoria_id == Category.id
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Product.country_id.in_(country_ids))
        
        query = query.group_by(
            Category.id, Category.name
        )
        
        # Filtrar por categoria especifica si se proporciona
        if category_id:
            query = query.filter(Category.id == category_id)
        
        results = query.all()
        
        stock_data = []
        total_stock = sum(result.total_stock or 0 for result in results)
        
        for result in results:
            stock_amount = result.total_stock or 0
            percentage = (stock_amount / total_stock * 100) if total_stock > 0 else 0
            
            stock_data.append({
                "category_id": result.category_id,
                "category_name": result.category_name,
                "total_stock": stock_amount,
                "total_products": result.total_products,
                "percentage": round(percentage, 2)
            })
        
        return stock_data
    
    @staticmethod
    def get_commercial_movements_summary(
        db: Session,
        country_ids: Optional[List[int]] = None,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        category_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Obtener resumen de movimientos para usuarios comerciales"""
        
        # Construir query base
        query = db.query(Movement).join(
            Product, Movement.product_id == Product.id
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Product.country_id.in_(country_ids))
        
        # Aplicar filtros de fecha
        if fecha_desde:
            query = query.filter(Movement.fecha_movimiento >= fecha_desde)
        if fecha_hasta:
            query = query.filter(Movement.fecha_movimiento <= fecha_hasta)
        
        # Filtrar por categoria si se especifica
        if category_id:
            query = query.filter(Product.categoria_id == category_id)
        
        # Obtener totales por tipo de movimiento
        entradas = query.filter(Movement.tipo == MovementType.ENTRADA).all()
        salidas = query.filter(Movement.tipo == MovementType.SALIDA).all()
        ajustes = query.filter(Movement.tipo == MovementType.AJUSTE).all()
        
        # Calcular totales
        total_entradas = sum(mov.cantidad for mov in entradas)
        total_salidas = sum(mov.cantidad for mov in salidas)
        total_ajustes = sum(abs(mov.cantidad_nueva - mov.cantidad_anterior) for mov in ajustes)
        
        # Diferencia neta
        diferencia_neta = total_entradas - total_salidas
        
        return {
            "total_entradas": total_entradas,
            "total_salidas": total_salidas,
            "total_ajustes": total_ajustes,
            "diferencia_neta": diferencia_neta,
            "total_movimientos": len(entradas) + len(salidas) + len(ajustes),
            "periodo": {
                "fecha_desde": fecha_desde,
                "fecha_hasta": fecha_hasta
            }
        }
    
    @staticmethod
    def get_commercial_movements_timeline(
        db: Session,
        country_ids: Optional[List[int]] = None,
        fecha_desde: Optional[datetime] = None,
        fecha_hasta: Optional[datetime] = None,
        group_by: str = "day"  # day, week, month
    ) -> List[Dict[str, Any]]:
        """Obtener timeline de movimientos agrupados por periodo"""
        
        # Definir formato de fecha segun agrupacion
        if group_by == "month":
            date_format = func.date_trunc('month', Movement.fecha_movimiento)
        elif group_by == "week":
            date_format = func.date_trunc('week', Movement.fecha_movimiento)
        else:  # day
            date_format = func.date_trunc('day', Movement.fecha_movimiento)
        
        # Query base
        query = db.query(
            date_format.label('periodo'),
            Movement.tipo,
            func.sum(Movement.cantidad).label('total_cantidad'),
            func.count(Movement.id).label('total_movimientos')
        ).join(
            Product, Movement.product_id == Product.id
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Product.country_id.in_(country_ids))
        
        # Aplicar filtros de fecha
        if fecha_desde:
            query = query.filter(Movement.fecha_movimiento >= fecha_desde)
        if fecha_hasta:
            query = query.filter(Movement.fecha_movimiento <= fecha_hasta)
        
        # Agrupar por periodo y tipo
        query = query.group_by(date_format, Movement.tipo).order_by(date_format)
        
        results = query.all()
        
        # Procesar resultados para formato de timeline
        timeline_data = {}
        
        for result in results:
            periodo_str = result.periodo.strftime('%Y-%m-%d')
            if group_by == "month":
                periodo_str = result.periodo.strftime('%Y-%m')
            elif group_by == "week":
                periodo_str = f"Semana {result.periodo.strftime('%U-%Y')}"
            
            if periodo_str not in timeline_data:
                timeline_data[periodo_str] = {
                    "periodo": periodo_str,
                    "fecha": result.periodo,
                    "entradas": 0,
                    "salidas": 0,
                    "ajustes": 0,
                    "total_movimientos": 0
                }
            
            if result.tipo == MovementType.ENTRADA:
                timeline_data[periodo_str]["entradas"] = result.total_cantidad
            elif result.tipo == MovementType.SALIDA:
                timeline_data[periodo_str]["salidas"] = result.total_cantidad
            elif result.tipo == MovementType.AJUSTE:
                timeline_data[periodo_str]["ajustes"] = result.total_cantidad
            
            timeline_data[periodo_str]["total_movimientos"] += result.total_movimientos
        
        return list(timeline_data.values())
    
    @staticmethod
    def get_commercial_countries_summary(
        db: Session,
        country_ids: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """Obtener resumen por paises asignados al usuario comercial"""
        
        query = db.query(
            Country.id.label('country_id'),
            Country.name.label('country_name'),
            func.sum(Product.cantidad).label('total_stock'),
            func.count(Product.id).label('total_products')
        ).join(
            Product, Product.country_id == Country.id
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Country.id.in_(country_ids))
        
        query = query.group_by(
            Country.id, Country.name
        )
        
        results = query.all()
        
        countries_data = []
        total_stock = sum(result.total_stock or 0 for result in results)
        
        for result in results:
            stock_amount = result.total_stock or 0
            percentage = (stock_amount / total_stock * 100) if total_stock > 0 else 0
            
            countries_data.append({
                "country_id": result.country_id,
                "country_name": result.country_name,
                "total_stock": stock_amount,
                "total_products": result.total_products,
                "percentage": round(percentage, 2)
            })
        
        return countries_data
    
    @staticmethod
    def get_commercial_low_stock_alerts(
        db: Session,
        country_ids: Optional[List[int]] = None,
        min_stock_threshold: int = 10
    ) -> List[Dict[str, Any]]:
        """Obtener productos con stock bajo para alertas"""
        
        query = db.query(Product).options(
            joinedload(Product.categoria),
            joinedload(Product.country)
        ).filter(
            Product.cantidad <= min_stock_threshold
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Product.country_id.in_(country_ids))
        
        query = query.order_by(Product.cantidad.asc())
        
        products = query.all()
        
        alerts = []
        for product in products:
            alerts.append({
                "product_id": product.id,
                "product_codigo": product.codigo,
                "product_nombre": product.nombre,
                "current_stock": product.cantidad,
                "category_name": product.categoria.name if product.categoria else "",
                "country_name": product.country.name if product.country else "",
                "alert_level": "critical" if product.cantidad <= 5 else "warning"
            })
        
        return alerts
    
    @staticmethod
    def get_commercial_inventory_table(
        db: Session,
        country_ids: Optional[List[int]] = None,
        category_id: Optional[int] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Obtener tabla completa de inventario con filtros"""
        
        query = db.query(Product).options(
            joinedload(Product.categoria),
            joinedload(Product.country)
        )
        
        # Filtrar por paises solo si se especifican
        if country_ids:
            query = query.filter(Product.country_id.in_(country_ids))
        
        # Filtrar por categoria si se especifica
        if category_id:
            query = query.filter(Product.categoria_id == category_id)
        
        # Contar total sin paginacion
        total_count = query.count()
        
        # Aplicar paginacion
        products = query.order_by(Product.nombre.asc()).offset(offset).limit(limit).all()
        
        inventory_data = []
        for product in products:
            inventory_data.append({
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
            "products": inventory_data,
            "total_count": total_count,
            "page_info": {
                "limit": limit,
                "offset": offset,
                "has_next": (offset + limit) < total_count,
                "has_prev": offset > 0
            }
        }
    
    @staticmethod
    def get_inventory_rotation_metrics(
        db: Session,
        country_ids: Optional[List[int]] = None,
        category_id: Optional[int] = None,
        days_back: int = 90
    ) -> Dict[str, Any]:
        """Obtener métricas de rotación de inventario y días de permanencia"""
        
        # Fecha límite para análisis
        fecha_limite = datetime.now() - timedelta(days=days_back)
        
        # Query para obtener productos con sus movimientos
        products_query = db.query(Product).options(
            joinedload(Product.categoria),
            joinedload(Product.country),
            joinedload(Product.movements)
        )
        
        if country_ids:
            products_query = products_query.filter(Product.country_id.in_(country_ids))
        
        if category_id:
            products_query = products_query.filter(Product.categoria_id == category_id)
        
        products = products_query.all()
        
        rotation_data = []
        category_stats = defaultdict(lambda: {
            'total_products': 0,
            'total_days': 0,
            'fast_moving': 0,
            'slow_moving': 0,
            'total_entries': 0,
            'total_exits': 0
        })
        
        age_distribution = {
            '0-30': {'products': 0, 'units': 0},
            '31-60': {'products': 0, 'units': 0}, 
            '61-90': {'products': 0, 'units': 0},
            '90+': {'products': 0, 'units': 0}
        }
        
        for product in products:
            # Obtener movimientos del producto ordenados por fecha
            movements = sorted(product.movements, key=lambda m: m.fecha_movimiento)
            
            # Calcular métricas del producto
            first_entry = None
            total_entries = 0
            total_exits = 0
            current_stock = product.cantidad
            
            for movement in movements:
                if movement.tipo in [MovementType.ENTRADA, MovementType.INICIAL]:
                    total_entries += movement.cantidad
                    if first_entry is None:
                        first_entry = movement.fecha_movimiento
                elif movement.tipo == MovementType.SALIDA:
                    total_exits += movement.cantidad
            
            # Calcular días desde primera entrada
            days_since_entry = 0
            if first_entry:
                days_since_entry = (datetime.now() - first_entry).days
            
            # Clasificar edad del stock
            if days_since_entry <= 30:
                age_distribution['0-30']['products'] += 1
                age_distribution['0-30']['units'] += current_stock
            elif days_since_entry <= 60:
                age_distribution['31-60']['products'] += 1
                age_distribution['31-60']['units'] += current_stock
            elif days_since_entry <= 90:
                age_distribution['61-90']['products'] += 1
                age_distribution['61-90']['units'] += current_stock
            else:
                age_distribution['90+']['products'] += 1
                age_distribution['90+']['units'] += current_stock
            
            # Calcular velocidad de salida (unidades por día)
            velocity = 0
            if days_since_entry > 0 and total_exits > 0:
                velocity = total_exits / days_since_entry
            
            # Clasificar como rápido o lento (más de 1 unidad por semana = rápido)
            is_fast_moving = velocity > (1/7)  # Más de 1 unidad por semana
            
            # Calcular tasa de rotación (% del stock inicial que se ha movido)
            rotation_rate = 0
            if total_entries > 0:
                rotation_rate = (total_exits / total_entries) * 100
            
            # Datos del producto
            product_data = {
                'product_id': product.id,
                'product_code': product.codigo,
                'product_name': product.nombre,
                'category_name': product.categoria.name if product.categoria else 'Sin Categoría',
                'current_stock': current_stock,
                'total_entries': total_entries,
                'total_exits': total_exits,
                'days_since_entry': days_since_entry,
                'velocity_per_day': round(velocity, 2),
                'rotation_rate': round(rotation_rate, 2),
                'is_fast_moving': is_fast_moving,
                'stock_age_category': (
                    '0-30 días' if days_since_entry <= 30
                    else '31-60 días' if days_since_entry <= 60
                    else '61-90 días' if days_since_entry <= 90
                    else '+90 días'
                )
            }
            
            rotation_data.append(product_data)
            
            # Actualizar estadísticas por categoría
            cat_name = product.categoria.name if product.categoria else 'Sin Categoría'
            cat_stats = category_stats[cat_name]
            cat_stats['total_products'] += 1
            cat_stats['total_days'] += days_since_entry
            cat_stats['total_entries'] += total_entries
            cat_stats['total_exits'] += total_exits
            
            if is_fast_moving:
                cat_stats['fast_moving'] += 1
            else:
                cat_stats['slow_moving'] += 1
        
        # Calcular promedios por categoría
        category_averages = []
        for cat_name, stats in category_stats.items():
            if stats['total_products'] > 0:
                avg_days = stats['total_days'] / stats['total_products']
                avg_velocity = (stats['total_exits'] / stats['total_days']) if stats['total_days'] > 0 else 0
                
                category_averages.append({
                    'category_name': cat_name,
                    'total_products': stats['total_products'],
                    'avg_days_permanence': round(avg_days, 1),
                    'avg_velocity_per_day': round(avg_velocity, 3),
                    'fast_moving_count': stats['fast_moving'],
                    'slow_moving_count': stats['slow_moving'],
                    'fast_moving_percentage': round((stats['fast_moving'] / stats['total_products']) * 100, 1)
                })
        
        # Estadísticas globales
        total_products = len(rotation_data)
        fast_moving_total = sum(1 for p in rotation_data if p['is_fast_moving'])
        slow_moving_total = total_products - fast_moving_total
        
        avg_days_global = sum(p['days_since_entry'] for p in rotation_data) / total_products if total_products > 0 else 0
        avg_velocity_global = sum(p['velocity_per_day'] for p in rotation_data) / total_products if total_products > 0 else 0
        
        return {
            'products': rotation_data,
            'category_averages': category_averages,
            'age_distribution': age_distribution,
            'global_stats': {
                'total_products': total_products,
                'fast_moving_products': fast_moving_total,
                'slow_moving_products': slow_moving_total,
                'fast_moving_percentage': round((fast_moving_total / total_products) * 100, 1) if total_products > 0 else 0,
                'avg_days_permanence': round(avg_days_global, 1),
                'avg_velocity_per_day': round(avg_velocity_global, 3)
            },
            'analysis_period_days': days_back,
            'generated_at': datetime.now()
        }