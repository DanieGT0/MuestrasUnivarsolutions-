from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, extract, func
from datetime import datetime, date, timedelta
from typing import List, Optional, Tuple

from app.models.product import Product
from app.models.country import Country
from app.models.category import Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductFilters, ProductStats, ProductList
from fastapi import HTTPException, status

class ProductService:
    
    @staticmethod
    def _convert_product_to_product_list(product: Product) -> ProductList:
        """Convert Product model to ProductList schema"""
        # Cargar relaciones si no están cargadas
        categoria_nombre = "Sin categoría"
        country_nombre = "Sin país"
        
        try:
            if hasattr(product, 'categoria') and product.categoria:
                categoria_nombre = product.categoria.name
        except:
            categoria_nombre = "Sin categoría"
            
        try:
            if hasattr(product, 'country') and product.country:
                country_nombre = product.country.name
        except:
            country_nombre = "Sin país"
        
        return ProductList(
            id=product.id,
            codigo=product.codigo,
            nombre=product.nombre,
            lote=product.lote,
            cantidad=product.cantidad,
            peso_unitario=product.peso_unitario,
            peso_total=product.peso_total,
            fecha_registro=product.fecha_registro,
            fecha_vencimiento=product.fecha_vencimiento,
            proveedor=product.proveedor,
            responsable=product.responsable,
            comentarios=product.comentarios,
            categoria_nombre=categoria_nombre,
            country_nombre=country_nombre,
            estado_vencimiento=product.estado_vencimiento,
            dias_para_vencer=product.dias_para_vencer
        )
    
    @staticmethod
    def generate_product_code(db: Session, country_id: int) -> str:
        """
        Genera código automático para producto basado en país
        Formato: [PREFIJO_PAIS][DD][MM][YY][NNN]
        Ejemplo: SV100825001
        """
        # Obtener prefijo del país
        country = db.query(Country).filter(Country.id == country_id).first()
        if not country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="País no encontrado"
            )
        
        # Fecha actual
        today = datetime.now()
        day = today.strftime("%d")
        month = today.strftime("%m") 
        year = today.strftime("%y")
        
        # Prefijo base del código
        code_prefix = f"{country.code}{day}{month}{year}"
        
        # Buscar el último número secuencial del mes actual
        last_product = db.query(Product).filter(
            and_(
                Product.codigo.like(f"{country.code}%{month}{year}%"),
                extract('month', Product.fecha_registro) == today.month,
                extract('year', Product.fecha_registro) == today.year
            )
        ).order_by(Product.codigo.desc()).first()
        
        # Calcular siguiente número secuencial
        if last_product and last_product.codigo.startswith(code_prefix):
            # Extraer número secuencial del último código
            last_sequence = int(last_product.codigo[-3:])
            next_sequence = last_sequence + 1
        else:
            # Primer producto del día o mes nuevo
            next_sequence = 1
        
        # Formatear código completo
        sequence_str = str(next_sequence).zfill(3)  # 001, 002, etc.
        full_code = f"{code_prefix}{sequence_str}"
        
        return full_code
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate, user_id: int, country_id: int) -> Product:
        """Crear nuevo producto"""
        
        try:
            print(f"[PRODUCT_SERVICE] Starting create_product")
            print(f"[PRODUCT_SERVICE] Product data: {product_data.dict()}")
            print(f"[PRODUCT_SERVICE] User ID: {user_id}")
            print(f"[PRODUCT_SERVICE] Country ID: {country_id}")
            
            # Validar que la categoría existe
            print(f"[PRODUCT_SERVICE] Validating category {product_data.categoria_id}")
            category = db.query(Category).filter(Category.id == product_data.categoria_id).first()
            if not category:
                print(f"[PRODUCT_SERVICE] Category not found: {product_data.categoria_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Categoría no encontrada"
                )
            print(f"[PRODUCT_SERVICE] Category validation passed: {category.name}")
            
            # Generar código automáticamente
            print(f"[PRODUCT_SERVICE] Generating product code")
            codigo = ProductService.generate_product_code(db, country_id)
            print(f"[PRODUCT_SERVICE] Generated code: {codigo}")
            
            # Crear producto
            print(f"[PRODUCT_SERVICE] Creating Product instance")
            db_product = Product(
                codigo=codigo,
                nombre=product_data.nombre,
                lote=product_data.lote,
                cantidad=product_data.cantidad,
                peso_unitario=product_data.peso_unitario,
                peso_total=product_data.peso_total,
                fecha_registro=product_data.fecha_registro,
                fecha_vencimiento=product_data.fecha_vencimiento,
                proveedor=product_data.proveedor,
                responsable=product_data.responsable,
                comentarios=product_data.comentarios,
                categoria_id=product_data.categoria_id,
                country_id=country_id,
                created_by=user_id
            )
            print(f"[PRODUCT_SERVICE] Product instance created")
            
            print(f"[PRODUCT_SERVICE] Adding to database session")
            db.add(db_product)
            print(f"[PRODUCT_SERVICE] Committing transaction")
            db.commit()
            print(f"[PRODUCT_SERVICE] Refreshing instance")
            db.refresh(db_product)
            print(f"[PRODUCT_SERVICE] Product saved successfully with ID: {db_product.id}")
            
            # Registrar movimiento inicial de stock
            print(f"[PRODUCT_SERVICE] Creating initial stock movement")
            from app.services.movement_service import MovementService
            MovementService.create_initial_stock(
                db=db,
                product_id=db_product.id,
                cantidad_inicial=product_data.cantidad,
                user_id=user_id
            )
            print(f"[PRODUCT_SERVICE] Initial stock movement created")
            
            print(f"[PRODUCT_SERVICE] Product creation completed successfully")
            return db_product
            
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            print(f"[PRODUCT_SERVICE] Unexpected error in create_product: {str(e)}")
            print(f"[PRODUCT_SERVICE] Error type: {type(e)}")
            import traceback
            print(f"[PRODUCT_SERVICE] Traceback: {traceback.format_exc()}")
            # Roll back the transaction in case of error
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating product: {str(e)}"
            )
    
    @staticmethod
    def get_products_by_country(
        db: Session, 
        country_id: int, 
        filters: Optional[ProductFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProductList]:
        """Obtener productos filtrados por país del usuario"""
        
        query = db.query(Product).options(joinedload(Product.categoria), joinedload(Product.country)).filter(Product.country_id == country_id)
        query = ProductService._apply_filters(query, filters)
        
        products = query.offset(skip).limit(limit).all()
        return [ProductService._convert_product_to_product_list(p) for p in products]
    
    @staticmethod
    def get_products_for_admin(
        db: Session, 
        filters: Optional[ProductFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProductList]:
        """Obtener todos los productos para administradores"""
        
        query = db.query(Product).options(joinedload(Product.categoria), joinedload(Product.country))
        query = ProductService._apply_filters(query, filters)
        
        products = query.offset(skip).limit(limit).all()
        return [ProductService._convert_product_to_product_list(p) for p in products]
    
    @staticmethod
    def _apply_filters(query, filters: Optional[ProductFilters]):
        """Aplicar filtros comunes a las consultas de productos"""
        
        if filters:
            if filters.search:
                search_term = f"%{filters.search.lower()}%"
                query = query.filter(
                    or_(
                        Product.nombre.ilike(search_term),
                        Product.codigo.ilike(search_term),
                        Product.lote.ilike(search_term)
                    )
                )
            
            if filters.categoria_id:
                query = query.filter(Product.categoria_id == filters.categoria_id)
            
            if filters.fecha_vencimiento_desde:
                query = query.filter(Product.fecha_vencimiento >= filters.fecha_vencimiento_desde)
            
            if filters.fecha_vencimiento_hasta:
                query = query.filter(Product.fecha_vencimiento <= filters.fecha_vencimiento_hasta)
            
            if filters.estado_vencimiento:
                today = date.today()
                if filters.estado_vencimiento == "vigente":
                    query = query.filter(Product.fecha_vencimiento > today + timedelta(days=30))
                elif filters.estado_vencimiento == "por_vencer":
                    query = query.filter(
                        and_(
                            Product.fecha_vencimiento > today,
                            Product.fecha_vencimiento <= today + timedelta(days=30)
                        )
                    )
                elif filters.estado_vencimiento == "vencido":
                    query = query.filter(Product.fecha_vencimiento < today)
        
        return query
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int, country_id: int) -> Optional[Product]:
        """Obtener producto por ID, validando que pertenece al país del usuario"""
        return db.query(Product).filter(
            and_(
                Product.id == product_id,
                Product.country_id == country_id
            )
        ).first()
    
    @staticmethod
    def update_product(
        db: Session, 
        product_id: int, 
        product_data: ProductUpdate, 
        country_id: int
    ) -> Optional[Product]:
        """Actualizar producto existente (usuario normal)"""
        
        # Buscar producto
        db_product = ProductService.get_product_by_id(db, product_id, country_id)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Actualizar campos modificados
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        return db_product
    
    @staticmethod
    def update_product_admin(
        db: Session, 
        product_id: int, 
        product_data: ProductUpdate
    ) -> Optional[Product]:
        """Actualizar producto existente (admin)"""
        
        # Buscar producto sin restricción de país
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Actualizar campos modificados
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        return db_product
    
    @staticmethod
    def delete_product(db: Session, product_id: int, country_id: int) -> bool:
        """Eliminar producto (usuario normal)"""
        
        db_product = ProductService.get_product_by_id(db, product_id, country_id)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        db.delete(db_product)
        db.commit()
        
        return True
    
    @staticmethod
    def delete_product_admin(db: Session, product_id: int) -> bool:
        """Eliminar producto (admin)"""
        
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        db.delete(db_product)
        db.commit()
        
        return True
    
    @staticmethod
    def get_product_stats(db: Session, country_id: int) -> ProductStats:
        """Obtener estadísticas de productos del país (usuario normal)"""
        
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # Consultas para estadísticas
        base_query = db.query(Product).filter(Product.country_id == country_id)
        
        total_productos = base_query.count()
        
        productos_vigentes = base_query.filter(
            Product.fecha_vencimiento > today + timedelta(days=30)
        ).count()
        
        productos_por_vencer = base_query.filter(
            and_(
                Product.fecha_vencimiento > today,
                Product.fecha_vencimiento <= today + timedelta(days=30)
            )
        ).count()
        
        productos_vencidos = base_query.filter(
            Product.fecha_vencimiento < today
        ).count()
        
        productos_este_mes = base_query.filter(
            and_(
                extract('month', Product.fecha_registro) == current_month,
                extract('year', Product.fecha_registro) == current_year
            )
        ).count()
        
        return ProductStats(
            total_productos=total_productos,
            productos_vigentes=productos_vigentes,
            productos_por_vencer=productos_por_vencer,
            productos_vencidos=productos_vencidos,
            productos_este_mes=productos_este_mes
        )
    
    @staticmethod
    def get_products_by_countries(
        db: Session, 
        country_ids: List[int], 
        filters: Optional[ProductFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProductList]:
        """Obtener productos filtrados por múltiples países del usuario"""
        
        query = db.query(Product).options(joinedload(Product.categoria), joinedload(Product.country)).filter(Product.country_id.in_(country_ids))
        query = ProductService._apply_filters(query, filters)
        
        products = query.offset(skip).limit(limit).all()
        return [ProductService._convert_product_to_product_list(p) for p in products]
    
    @staticmethod
    def get_products_by_countries_paginated(
        db: Session, 
        country_ids: List[int], 
        filters: Optional[ProductFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[ProductList], int]:
        """Obtener productos filtrados por múltiples países del usuario con información de paginación"""
        
        base_query = db.query(Product).filter(Product.country_id.in_(country_ids))
        base_query = ProductService._apply_filters(base_query, filters)
        
        # Get total count
        total = base_query.count()
        
        # Get paginated results with relations loaded
        query = base_query.options(joinedload(Product.categoria), joinedload(Product.country))
        products = query.offset(skip).limit(limit).all()
        
        return [ProductService._convert_product_to_product_list(p) for p in products], total
    
    @staticmethod
    def get_products_for_admin_paginated(
        db: Session, 
        filters: Optional[ProductFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[ProductList], int]:
        """Obtener todos los productos para administradores con información de paginación"""
        
        base_query = db.query(Product)
        base_query = ProductService._apply_filters(base_query, filters)
        
        # Get total count
        total = base_query.count()
        
        # Get paginated results with relations loaded
        query = base_query.options(joinedload(Product.categoria), joinedload(Product.country))
        products = query.offset(skip).limit(limit).all()
        
        return [ProductService._convert_product_to_product_list(p) for p in products], total
    
    @staticmethod
    def get_product_by_id_for_countries(db: Session, product_id: int, country_ids: List[int]) -> Optional[Product]:
        """Obtener producto por ID, validando que pertenece a uno de los países del usuario"""
        return db.query(Product).filter(
            and_(
                Product.id == product_id,
                Product.country_id.in_(country_ids)
            )
        ).first()
    
    @staticmethod
    def update_product_for_countries(
        db: Session, 
        product_id: int, 
        product_data: ProductUpdate, 
        country_ids: List[int]
    ) -> Optional[Product]:
        """Actualizar producto existente (usuario con múltiples países)"""
        
        # Buscar producto
        db_product = ProductService.get_product_by_id_for_countries(db, product_id, country_ids)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Actualizar campos modificados
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        return db_product
    
    @staticmethod
    def delete_product_for_countries(db: Session, product_id: int, country_ids: List[int]) -> bool:
        """Eliminar producto (usuario con múltiples países)"""
        
        db_product = ProductService.get_product_by_id_for_countries(db, product_id, country_ids)
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        db.delete(db_product)
        db.commit()
        
        return True
    
    @staticmethod
    def get_product_stats_for_countries(db: Session, country_ids: List[int]) -> ProductStats:
        """Obtener estadísticas de productos de múltiples países (usuario normal)"""
        
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # Consultas para estadísticas
        base_query = db.query(Product).filter(Product.country_id.in_(country_ids))
        
        total_productos = base_query.count()
        
        productos_vigentes = base_query.filter(
            Product.fecha_vencimiento > today + timedelta(days=30)
        ).count()
        
        productos_por_vencer = base_query.filter(
            and_(
                Product.fecha_vencimiento > today,
                Product.fecha_vencimiento <= today + timedelta(days=30)
            )
        ).count()
        
        productos_vencidos = base_query.filter(
            Product.fecha_vencimiento < today
        ).count()
        
        productos_este_mes = base_query.filter(
            and_(
                extract('month', Product.fecha_registro) == current_month,
                extract('year', Product.fecha_registro) == current_year
            )
        ).count()
        
        return ProductStats(
            total_productos=total_productos,
            productos_vigentes=productos_vigentes,
            productos_por_vencer=productos_por_vencer,
            productos_vencidos=productos_vencidos,
            productos_este_mes=productos_este_mes
        )
    
    @staticmethod
    def get_product_stats_admin(db: Session, country_id: Optional[int] = None) -> ProductStats:
        """Obtener estadísticas de productos para admin (todos los países o uno específico)"""
        
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # Base query - todos los productos o filtrados por país
        base_query = db.query(Product)
        if country_id:
            base_query = base_query.filter(Product.country_id == country_id)
        
        total_productos = base_query.count()
        
        productos_vigentes = base_query.filter(
            Product.fecha_vencimiento > today + timedelta(days=30)
        ).count()
        
        productos_por_vencer = base_query.filter(
            and_(
                Product.fecha_vencimiento > today,
                Product.fecha_vencimiento <= today + timedelta(days=30)
            )
        ).count()
        
        productos_vencidos = base_query.filter(
            Product.fecha_vencimiento < today
        ).count()
        
        productos_este_mes = base_query.filter(
            and_(
                extract('month', Product.fecha_registro) == current_month,
                extract('year', Product.fecha_registro) == current_year
            )
        ).count()
        
        return ProductStats(
            total_productos=total_productos,
            productos_vigentes=productos_vigentes,
            productos_por_vencer=productos_por_vencer,
            productos_vencidos=productos_vencidos,
            productos_este_mes=productos_este_mes
        )
