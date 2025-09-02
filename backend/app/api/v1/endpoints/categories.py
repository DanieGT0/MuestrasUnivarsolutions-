# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Obtener lista de categorias"""
    from app.models.product import Product
    
    query = db.query(Category)
    
    if active_only:
        query = query.filter(Category.is_active == True)
    
    categories = query.offset(skip).limit(limit).all()
    
    # Agregar el conteo de productos a cada categoría
    result = []
    for category in categories:
        category_dict = {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "is_active": category.is_active,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "product_count": db.query(Product).filter(Product.categoria_id == category.id).count()
        }
        result.append(category_dict)
    
    return result

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Obtener una categoria por ID"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria no encontrada"
        )
    return category

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva categoria"""
    try:
        print(f"[CREATE_CATEGORY] Creating category with data: {category}")
        
        # Verificar que el nombre no exista
        existing_category = db.query(Category).filter(Category.name == category.name.upper()).first()
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una categoria con este nombre"
            )
        
        db_category = Category(
            name=category.name.upper(),
            description=category.description,
            is_active=category.is_active
        )
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        print(f"[CREATE_CATEGORY] Successfully created category {db_category.id}")
        return db_category
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CREATE_CATEGORY] Error creating category: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una categoria"""
    try:
        print(f"[UPDATE_CATEGORY] Updating category {category_id} with data: {category_update}")
        
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria no encontrada"
            )
    
        # Si se actualiza el nombre, verificar que no exista
        if category_update.name and category_update.name.upper() != db_category.name:
            existing_category = db.query(Category).filter(Category.name == category_update.name.upper()).first()
            if existing_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe una categoria con este nombre"
                )
        
        # Actualizar campos
        try:
            # Soporte para Pydantic v1 y v2
            if hasattr(category_update, 'model_dump'):
                update_data = category_update.model_dump(exclude_unset=True)
            else:
                update_data = category_update.dict(exclude_unset=True)
        except Exception as e:
            print(f"[UPDATE_CATEGORY] Error serializing data: {e}")
            update_data = {}
        
        if 'name' in update_data:
            update_data['name'] = update_data['name'].upper()
        
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        db.commit()
        db.refresh(db_category)
        
        print(f"[UPDATE_CATEGORY] Successfully updated category {category_id}")
        return db_category
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPDATE_CATEGORY] Error updating category {category_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una categoria"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria no encontrada"
        )
    
    # Verificar que no tenga productos asociados
    from app.models.product import Product
    product_count = db.query(Product).filter(Product.categoria_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar la categoria porque tiene {product_count} producto(s) asociado(s)"
        )
    
    # Verificar que no tenga usuarios asociados
    from app.models.user import User
    user_count = db.query(User).filter(User.category_id == category_id).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede eliminar la categoria porque tiene {user_count} usuario(s) asociado(s)"
        )
    
    db.delete(db_category)
    db.commit()
    
    return {"message": "Categoria eliminada correctamente"}

@router.patch("/{category_id}/toggle-active", response_model=CategoryResponse)
async def toggle_category_active(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Cambiar estado activo/inactivo de una categoria"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria no encontrada"
        )
    
    db_category.is_active = not db_category.is_active
    db.commit()
    db.refresh(db_category)
    
    return db_category