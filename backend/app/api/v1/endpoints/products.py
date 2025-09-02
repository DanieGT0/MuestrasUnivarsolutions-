from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional

from app.config.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.country import Country
from app.core.role_permissions import RolePermissions, require_module_access
from app.schemas.product import (
    ProductCreate, 
    ProductUpdate, 
    ProductResponse, 
    ProductList,
    ProductFilters,
    ProductStats
)
from pydantic import BaseModel
from fastapi import UploadFile, File
from typing import Dict, Any

class PaginatedProductsResponse(BaseModel):
    items: List[ProductList]
    total: int
    page: int
    per_page: int
    total_pages: int
    
    class Config:
        from_attributes = True
from app.schemas.country import CountryBase, CountryResponse
from app.services.product_service import ProductService

router = APIRouter()

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@require_module_access("products")
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear nuevo producto
    - Requiere acceso al módulo de productos (admin o user)
    - Usuarios solo pueden crear productos en sus países asignados
    - Admins pueden crear productos en cualquier país
    """
    try:
        print(f"[CREATE_PRODUCT] Starting product creation")
        print(f"[CREATE_PRODUCT] User ID: {current_user.id}")
        print(f"[CREATE_PRODUCT] Product data received: {product_data.dict()}")
        
        # Validar país seleccionado usando sistema de permisos
        print(f"[CREATE_PRODUCT] Validating country access")
        print(f"[CREATE_PRODUCT] Requested country_id: {product_data.country_id}")
        
        # Verificar que el país existe
        country = db.query(Country).filter(Country.id == product_data.country_id).first()
        if not country:
            print(f"[CREATE_PRODUCT] Country not found: {product_data.country_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="País no encontrado"
            )
        
        # Verificar permisos de país
        if not current_user.has_country_access(product_data.country_id):
            print(f"[CREATE_PRODUCT] User {current_user.id} doesn't have access to country {product_data.country_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para crear productos en este país"
            )
        
        print(f"[CREATE_PRODUCT] Country validation completed, proceeding to create product")
        
        # Crear producto
        print(f"[CREATE_PRODUCT] Calling ProductService.create_product")
        product = ProductService.create_product(
            db=db,
            product_data=product_data,
            user_id=current_user.id,
            country_id=product_data.country_id
        )
        print(f"[CREATE_PRODUCT] Product created successfully with ID: {product.id}")
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"[CREATE_PRODUCT] Unexpected error during product creation: {str(e)}")
        print(f"[CREATE_PRODUCT] Error type: {type(e)}")
        import traceback
        print(f"[CREATE_PRODUCT] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )
    
    # Recargar producto con relaciones para respuesta completa
    product_with_relations = db.query(Product).options(
        joinedload(Product.categoria),
        joinedload(Product.country),
        joinedload(Product.creator)
    ).filter(Product.id == product.id).first()
    
    # Crear respuesta con información de relaciones
    response = ProductResponse(
        id=product_with_relations.id,
        codigo=product_with_relations.codigo,
        nombre=product_with_relations.nombre,
        lote=product_with_relations.lote,
        cantidad=product_with_relations.cantidad,
        peso_unitario=product_with_relations.peso_unitario,
        peso_total=product_with_relations.peso_total,
        fecha_registro=product_with_relations.fecha_registro,
        fecha_vencimiento=product_with_relations.fecha_vencimiento,
        proveedor=product_with_relations.proveedor,
        responsable=product_with_relations.responsable,
        comentarios=product_with_relations.comentarios,
        categoria_id=product_with_relations.categoria_id,
        country_id=product_with_relations.country_id,
        created_by=product_with_relations.created_by,
        created_at=product_with_relations.created_at,
        updated_at=product_with_relations.updated_at,
        codigo_pais=product_with_relations.codigo_pais,
        numero_secuencial=product_with_relations.numero_secuencial,
        dias_para_vencer=product_with_relations.dias_para_vencer,
        estado_vencimiento=product_with_relations.estado_vencimiento,
        categoria_nombre=product_with_relations.categoria.name if product_with_relations.categoria else None,
        country_nombre=product_with_relations.country.name if product_with_relations.country else None,
        creator_nombre=product_with_relations.creator.email if product_with_relations.creator else None
    )
    
    return response

@router.get("/", response_model=PaginatedProductsResponse)
async def get_products(
    search: Optional[str] = Query(None, description="Buscar en nombre, código o lote"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    estado_vencimiento: Optional[str] = Query(None, description="vigente, por_vencer, vencido"),
    skip: int = Query(0, ge=0, description="Registros a omitir"),
    limit: int = Query(100, ge=1, le=10000, description="Límite de registros (máximo 10,000 para exportación)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de productos con paginación
    - Usuarios ven solo productos de su país
    - Admins pueden ver todos los productos
    """
    # Construir filtros
    filters = ProductFilters(
        search=search,
        categoria_id=categoria_id,
        estado_vencimiento=estado_vencimiento
    )
    
    # Determinar país según rol del usuario
    print(f"[GET_PRODUCTS] User ID: {current_user.id}")
    print(f"[GET_PRODUCTS] User role: {current_user.role}")
    print(f"[GET_PRODUCTS] Is admin: {current_user.is_admin}")
    print(f"[GET_PRODUCTS] Country IDs: {current_user.country_ids}")
    print(f"[GET_PRODUCTS] Country ID: {current_user.country_id}")
    
    if current_user.is_admin:
        # Admin puede ver todos los productos o filtrar por país
        print(f"[GET_PRODUCTS] Admin user - showing all products")
        country_id = None  # Admin puede ver todos
        products, total = ProductService.get_products_for_admin_paginated(
            db=db,
            filters=filters,
            skip=skip,
            limit=limit
        )
    else:
        # Usuarios normales solo ven sus países asignados
        print(f"[GET_PRODUCTS] Non-admin user - checking country assignments")
        if not current_user.country_ids and not current_user.country_id:
            print(f"[GET_PRODUCTS] User has no assigned countries - returning error")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene países asignados"
            )
        
        # Obtener productos de todos los países asignados al usuario
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        products, total = ProductService.get_products_by_countries_paginated(
            db=db,
            country_ids=country_ids,
            filters=filters,
            skip=skip,
            limit=limit
        )
    
    # Calculate pagination info
    page = (skip // limit) + 1
    total_pages = (total + limit - 1) // limit  # Ceiling division
    
    print(f"[GET_PRODUCTS] Returning {len(products)} products out of {total} total")
    
    return PaginatedProductsResponse(
        items=products,
        total=total,
        page=page,
        per_page=limit,
        total_pages=total_pages
    )

@router.get("/available-countries", response_model=List[CountryResponse])
async def get_available_countries_for_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener países disponibles para crear productos según el rol del usuario
    - Usuarios normales: solo sus países asignados
    - Admins: todos los países activos
    """
    try:
        print(f"[COUNTRIES] Starting available-countries endpoint")
        print(f"[COUNTRIES] User ID: {current_user.id}")
        print(f"[COUNTRIES] User email: {current_user.email}")
        print(f"[COUNTRIES] User role object: {current_user.role}")
        print(f"[COUNTRIES] User role name: {current_user.role.name if current_user.role else 'None'}")
        print(f"[COUNTRIES] is_admin property: {current_user.is_admin}")
        
        if current_user.is_admin:
            print("[COUNTRIES] User is admin, returning all countries")
            countries = db.query(Country).filter(Country.is_active == True).all()
            print(f"[COUNTRIES] Found {len(countries)} active countries for admin")
            for c in countries:
                print(f"[COUNTRIES] Country: {c.name} (id: {c.id}, code: {c.code})")
            return countries
        else:
            print("[COUNTRIES] User is not admin, returning assigned countries")
            user_country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
            print(f"[COUNTRIES] User country IDs: {user_country_ids}")
            
            if not user_country_ids:
                print("[COUNTRIES] User has no assigned countries, returning empty list")
                return []
            
            countries = db.query(Country).filter(
                Country.id.in_(user_country_ids),
                Country.is_active == True
            ).all()
            
            print(f"[COUNTRIES] Found {len(countries)} countries for user")
            for c in countries:
                print(f"[COUNTRIES] User Country: {c.name} (id: {c.id}, code: {c.code})")
            return countries
            
    except Exception as e:
        print(f"[COUNTRIES] Error in available-countries: {str(e)}")
        print(f"[COUNTRIES] Error type: {type(e)}")
        import traceback
        print(f"[COUNTRIES] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener producto por ID
    - Usuarios solo pueden ver productos de su país
    """
    if current_user.is_admin:
        # Admin puede ver cualquier producto
        product = db.query(Product).options(
            joinedload(Product.categoria),
            joinedload(Product.country),
            joinedload(Product.creator)
        ).filter(Product.id == product_id).first()
    else:
        # Usuario normal solo ve productos de sus países asignados
        if not current_user.country_ids and not current_user.country_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene países asignados"
            )
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        product = db.query(Product).options(
            joinedload(Product.categoria),
            joinedload(Product.country),
            joinedload(Product.creator)
        ).filter(
            and_(
                Product.id == product_id,
                Product.country_id.in_(country_ids)
            )
        ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    # Crear respuesta con información de relaciones
    response = ProductResponse(
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
        categoria_id=product.categoria_id,
        country_id=product.country_id,
        created_by=product.created_by,
        created_at=product.created_at,
        updated_at=product.updated_at,
        codigo_pais=product.codigo_pais,
        numero_secuencial=product.numero_secuencial,
        dias_para_vencer=product.dias_para_vencer,
        estado_vencimiento=product.estado_vencimiento,
        categoria_nombre=product.categoria.name if product.categoria else None,
        country_nombre=product.country.name if product.country else None,
        creator_nombre=product.creator.email if product.creator else None
    )
    
    return response

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar producto existente
    - Requiere rol: user o admin
    - Usuarios solo pueden editar productos de su país
    """
    # Validar permisos
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar productos"
        )
    
    if current_user.is_admin:
        # Admin puede editar cualquier producto
        product = ProductService.update_product_admin(
            db=db,
            product_id=product_id,
            product_data=product_data
        )
    else:
        # Usuario normal solo puede editar productos de sus países asignados
        if not current_user.country_ids and not current_user.country_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene países asignados"
            )
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        product = ProductService.update_product_for_countries(
            db=db,
            product_id=product_id,
            product_data=product_data,
            country_ids=country_ids
        )
    
    # Recargar producto con relaciones para respuesta completa
    product_with_relations = db.query(Product).options(
        joinedload(Product.categoria),
        joinedload(Product.country),
        joinedload(Product.creator)
    ).filter(Product.id == product.id).first()
    
    # Crear respuesta con información de relaciones
    response = ProductResponse(
        id=product_with_relations.id,
        codigo=product_with_relations.codigo,
        nombre=product_with_relations.nombre,
        lote=product_with_relations.lote,
        cantidad=product_with_relations.cantidad,
        peso_unitario=product_with_relations.peso_unitario,
        peso_total=product_with_relations.peso_total,
        fecha_registro=product_with_relations.fecha_registro,
        fecha_vencimiento=product_with_relations.fecha_vencimiento,
        proveedor=product_with_relations.proveedor,
        responsable=product_with_relations.responsable,
        comentarios=product_with_relations.comentarios,
        categoria_id=product_with_relations.categoria_id,
        country_id=product_with_relations.country_id,
        created_by=product_with_relations.created_by,
        created_at=product_with_relations.created_at,
        updated_at=product_with_relations.updated_at,
        codigo_pais=product_with_relations.codigo_pais,
        numero_secuencial=product_with_relations.numero_secuencial,
        dias_para_vencer=product_with_relations.dias_para_vencer,
        estado_vencimiento=product_with_relations.estado_vencimiento,
        categoria_nombre=product_with_relations.categoria.name if product_with_relations.categoria else None,
        country_nombre=product_with_relations.country.name if product_with_relations.country else None,
        creator_nombre=product_with_relations.creator.email if product_with_relations.creator else None
    )
    
    return response

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar producto
    - Requiere rol: user o admin
    - Usuarios solo pueden eliminar productos de su país
    """
    # Validar permisos
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar productos"
        )
    
    if current_user.is_admin:
        # Admin puede eliminar cualquier producto
        ProductService.delete_product_admin(
            db=db,
            product_id=product_id
        )
    else:
        # Usuario normal solo puede eliminar productos de sus países asignados
        if not current_user.country_ids and not current_user.country_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene países asignados"
            )
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        ProductService.delete_product_for_countries(
            db=db,
            product_id=product_id,
            country_ids=country_ids
        )
    
    return {"message": "Producto eliminado exitosamente"}

@router.get("/stats/summary", response_model=ProductStats)
async def get_product_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener estadísticas de productos
    - Usuarios ven estadísticas de su país
    - Admins ven estadísticas globales o de país específico
    """
    if current_user.is_commercial:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rol comercial no tiene acceso a estadísticas de productos"
        )
    
    if current_user.is_admin:
        # Admin puede ver estadísticas de todos los países o específico
        stats = ProductService.get_product_stats_admin(
            db=db,
            country_id=current_user.country_id  # Opcional para admin
        )
    else:
        # Usuario normal solo ve estadísticas de sus países asignados
        if not current_user.country_ids and not current_user.country_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no tiene países asignados"
            )
        country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
        stats = ProductService.get_product_stats_for_countries(
            db=db,
            country_ids=country_ids
        )
    
    return stats

@router.post("/generate-code")
async def generate_product_code(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generar código de producto para preview
    - Útil para mostrar el código que se generará antes de crear
    """
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para generar códigos"
        )
    
    country_id = current_user.country_id or (current_user.country_ids[0] if current_user.country_ids else None)
    if not country_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no tiene países asignados"
        )
    
    code = ProductService.generate_product_code(
        db=db,
        country_id=country_id
    )
    
    return {"codigo": code}

class BulkImportRequest(BaseModel):
    products: List[Dict[str, Any]]
    import_mode: str = "add"  # add, update, replace
    selected_country: Optional[int] = None

@router.post("/bulk-import")
async def bulk_import_products(
    import_data: BulkImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Import multiple products from parsed Excel data
    - Requires role: user or admin
    - Users can only import to their assigned countries
    """
    # Validar permisos
    if not (current_user.is_admin or current_user.is_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para importar productos"
        )
    
    try:
        results = {
            "success": [],
            "errors": [],
            "total": len(import_data.products),
            "created": 0,
            "updated": 0,
            "skipped": 0
        }
        
        for i, product_data in enumerate(import_data.products):
            try:
                # Convert Excel data to ProductCreate format
                processed_data = {
                    "nombre": product_data.get("nombre", "").strip(),
                    "lote": product_data.get("lote", "").strip(),
                    "cantidad": int(product_data.get("cantidad", 0)),
                    "peso_unitario": float(product_data.get("peso_unitario", 0)),
                    "peso_total": float(product_data.get("peso_total", 0)),
                    "fecha_registro": product_data.get("fecha_registro"),
                    "fecha_vencimiento": product_data.get("fecha_vencimiento"),
                    "proveedor": product_data.get("proveedor", "").strip(),
                    "responsable": product_data.get("responsable", "").strip(),
                    "comentarios": product_data.get("comentarios", "").strip() if product_data.get("comentarios") else None,
                    "categoria_id": product_data.get("categoria_id", 3),  # Default to HIC
                    "country_id": import_data.selected_country or product_data.get("country_id")
                }
                
                # Validate required fields
                required_fields = ["nombre", "lote", "proveedor", "responsable", "fecha_vencimiento"]
                for field in required_fields:
                    if not processed_data.get(field):
                        raise ValueError(f"Campo requerido faltante: {field}")
                
                # Validate country access for non-admin users
                if not current_user.is_admin:
                    user_country_ids = current_user.country_ids or ([current_user.country_id] if current_user.country_id else [])
                    if processed_data["country_id"] not in user_country_ids:
                        raise ValueError("No tienes permisos para importar productos a este país")
                
                # Convert to ProductCreate schema
                product_create = ProductCreate(**processed_data)
                
                if import_data.import_mode == "add":
                    # Create new product
                    new_product = ProductService.create_product(
                        db=db,
                        product_data=product_create,
                        user_id=current_user.id,
                        country_id=processed_data["country_id"]
                    )
                    results["created"] += 1
                    results["success"].append(f"Fila {i+1}: Producto creado - {processed_data['nombre']}")
                
                elif import_data.import_mode == "update":
                    # TODO: Implement update logic based on product code
                    results["skipped"] += 1
                    results["errors"].append(f"Fila {i+1}: Modo actualizar no implementado aún")
                
                elif import_data.import_mode == "replace":
                    # TODO: Implement replace logic based on product code
                    results["skipped"] += 1
                    results["errors"].append(f"Fila {i+1}: Modo reemplazar no implementado aún")
                    
            except ValueError as e:
                results["errors"].append(f"Fila {i+1}: {str(e)}")
                results["skipped"] += 1
            except Exception as e:
                results["errors"].append(f"Fila {i+1}: Error inesperado - {str(e)}")
                results["skipped"] += 1
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en importación masiva: {str(e)}"
        )