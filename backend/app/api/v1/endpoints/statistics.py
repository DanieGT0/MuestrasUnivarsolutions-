# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.api.deps import get_db
import re

router = APIRouter()

def validate_country_code(country_code: str) -> None:
    """Validar formato del código de país"""
    if not country_code or not re.match(r'^[A-Za-z]{2,3}$', country_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de país debe ser de 2-3 letras solamente"
        )

@router.get("/country/{country_code}")
async def get_country_statistics(
    country_code: str,
    db: Session = Depends(get_db)
):
    """Obtener estadisticas de un pais especifico"""
    from app.models.product import Product
    from app.models.movement import Movement
    from app.models.category import Category
    from app.models.country import Country
    from sqlalchemy import func
    
    # Validar formato del código de país
    validate_country_code(country_code)
    
    # Verificar que el pais existe
    country = db.query(Country).filter(Country.code == country_code.upper()).first()
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Contar productos por pais
    products_count = db.query(Product).filter(Product.country_id == country.id).count()
    
    # Contar movimientos por pais (productos de ese pais)
    movements_count = db.query(Movement).join(Product).filter(
        Product.country_id == country.id
    ).count()
    
    # Contar categorias activas
    categories_count = db.query(Category).filter(Category.is_active == True).count()
    
    # Obtener ultima actividad (ultimo movimiento de productos de ese pais)
    last_movement = db.query(Movement.created_at).join(Product).filter(
        Product.country_id == country.id
    ).order_by(Movement.created_at.desc()).first()
    
    last_activity = last_movement[0] if last_movement else None
    
    return {
        "country_code": country_code.upper(),
        "country_name": country.name,
        "products": products_count,
        "movements": movements_count,
        "categories": categories_count,
        "last_activity": last_activity
    }

@router.get("/all-countries")
async def get_all_countries_statistics(
    db: Session = Depends(get_db)
):
    """Obtener estadisticas de todos los paises"""
    from app.models.product import Product
    from app.models.movement import Movement
    from app.models.country import Country
    from sqlalchemy import func
    
    # Obtener todos los paises
    countries = db.query(Country).all()
    
    statistics = []
    for country in countries:
        # Contar productos por pais
        products_count = db.query(Product).filter(Product.country_id == country.id).count()
        
        # Contar movimientos por pais
        movements_count = db.query(Movement).join(Product).filter(
            Product.country_id == country.id
        ).count()
        
        # Obtener ultima actividad
        last_movement = db.query(Movement.created_at).join(Product).filter(
            Product.country_id == country.id
        ).order_by(Movement.created_at.desc()).first()
        
        last_activity = last_movement[0] if last_movement else None
        
        statistics.append({
            "country_code": country.code,
            "country_name": country.name,
            "products": products_count,
            "movements": movements_count,
            "last_activity": last_activity
        })
    
    return {"statistics": statistics}

@router.delete("/country/{country_code}/products")
async def delete_country_products(
    country_code: str,
    include_movements: bool = False,
    db: Session = Depends(get_db)
):
    """Eliminar todos los productos de un pais (y opcionalmente sus movimientos)"""
    from app.models.product import Product
    from app.models.movement import Movement
    from app.models.country import Country
    
    # Validar formato del código de país
    validate_country_code(country_code)
    
    # Verificar que el pais existe
    country = db.query(Country).filter(Country.code == country_code.upper()).first()
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Obtener productos del pais
    products = db.query(Product).filter(Product.country_id == country.id).all()
    products_count = len(products)
    movements_count = 0
    
    if include_movements:
        # Eliminar movimientos asociados a productos de este pais
        for product in products:
            movements = db.query(Movement).filter(Movement.product_id == product.id).all()
            movements_count += len(movements)
            for movement in movements:
                db.delete(movement)
    
    # Eliminar productos
    for product in products:
        db.delete(product)
    
    db.commit()
    
    return {
        "message": f"Eliminacion completada para {country.name}",
        "deleted_products": products_count,
        "deleted_movements": movements_count
    }

@router.delete("/country/{country_code}/movements")
async def delete_country_movements(
    country_code: str,
    db: Session = Depends(get_db)
):
    """Eliminar todos los movimientos de productos de un pais"""
    from app.models.product import Product
    from app.models.movement import Movement
    from app.models.country import Country
    
    # Validar formato del código de país
    validate_country_code(country_code)
    
    # Verificar que el pais existe
    country = db.query(Country).filter(Country.code == country_code.upper()).first()
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Eliminar movimientos de productos de este pais
    movements_count = db.query(Movement).join(Product).filter(
        Product.country_id == country.id
    ).count()
    
    db.query(Movement).join(Product).filter(
        Product.country_id == country.id
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "message": f"Movimientos eliminados para {country.name}",
        "deleted_movements": movements_count
    }

@router.delete("/country/{country_code}/all")
async def delete_all_country_data(
    country_code: str,
    db: Session = Depends(get_db)
):
    """Eliminar todos los datos (productos y movimientos) de un pais"""
    from app.models.product import Product
    from app.models.movement import Movement
    from app.models.country import Country
    
    # Validar formato del código de país
    validate_country_code(country_code)
    
    # Verificar que el pais existe
    country = db.query(Country).filter(Country.code == country_code.upper()).first()
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Contar antes de eliminar
    products = db.query(Product).filter(Product.country_id == country.id).all()
    products_count = len(products)
    
    movements_count = 0
    for product in products:
        movements = db.query(Movement).filter(Movement.product_id == product.id).all()
        movements_count += len(movements)
        # Eliminar movimientos
        for movement in movements:
            db.delete(movement)
    
    # Eliminar productos
    for product in products:
        db.delete(product)
    
    db.commit()
    
    return {
        "message": f"Eliminacion completa realizada para {country.name}",
        "deleted_products": products_count,
        "deleted_movements": movements_count
    }