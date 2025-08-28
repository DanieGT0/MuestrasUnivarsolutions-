# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.models.country import Country
from app.schemas.country import CountryCreate, CountryUpdate, CountryResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CountryResponse])
async def get_countries(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Obtener lista de paises"""
    query = db.query(Country)
    
    if active_only:
        query = query.filter(Country.is_active == True)
    
    countries = query.offset(skip).limit(limit).all()
    return countries

@router.get("/{country_id}", response_model=CountryResponse)
async def get_country(
    country_id: int,
    db: Session = Depends(get_db)
):
    """Obtener un pais por ID"""
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    return country

@router.post("/", response_model=CountryResponse)
async def create_country(
    country: CountryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear un nuevo pais"""
    # Verificar que el codigo no exista
    existing_country = db.query(Country).filter(Country.code == country.code.upper()).first()
    if existing_country:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un pais con este codigo"
        )
    
    db_country = Country(
        name=country.name,
        code=country.code.upper(),
        is_active=country.is_active
    )
    
    db.add(db_country)
    db.commit()
    db.refresh(db_country)
    
    return db_country

@router.put("/{country_id}", response_model=CountryResponse)
async def update_country(
    country_id: int,
    country_update: CountryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar un pais"""
    db_country = db.query(Country).filter(Country.id == country_id).first()
    if not db_country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Si se actualiza el codigo, verificar que no exista
    if country_update.code and country_update.code.upper() != db_country.code:
        existing_country = db.query(Country).filter(Country.code == country_update.code.upper()).first()
        if existing_country:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un pais con este codigo"
            )
    
    # Actualizar campos
    update_data = country_update.dict(exclude_unset=True)
    if 'code' in update_data:
        update_data['code'] = update_data['code'].upper()
    
    for field, value in update_data.items():
        setattr(db_country, field, value)
    
    db.commit()
    db.refresh(db_country)
    
    return db_country

@router.delete("/{country_id}")
async def delete_country(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar un pais"""
    db_country = db.query(Country).filter(Country.id == country_id).first()
    if not db_country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    # Verificar que no tenga productos asociados
    if db_country.products:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el pais porque tiene productos asociados"
        )
    
    db.delete(db_country)
    db.commit()
    
    return {"message": "Pais eliminado correctamente"}

@router.patch("/{country_id}/toggle-active", response_model=CountryResponse)
async def toggle_country_active(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cambiar estado activo/inactivo de un pais"""
    db_country = db.query(Country).filter(Country.id == country_id).first()
    if not db_country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pais no encontrado"
        )
    
    db_country.is_active = not db_country.is_active
    db.commit()
    db.refresh(db_country)
    
    return db_country