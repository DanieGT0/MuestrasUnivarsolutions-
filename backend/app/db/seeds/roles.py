# -*- coding: utf-8 -*-
from app.config.database import SessionLocal
from app.models.role import Role
from sqlalchemy.exc import IntegrityError

def seed_roles():
    """Crear rol administrador basico"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe el rol admin
        existing_role = db.query(Role).filter(Role.name == "administrador").first()
        if existing_role:
            print("[SEED] Admin role already exists, skipping...")
            return
            
        # Crear solo rol administrador
        admin_role = Role(
            name="administrador",
            description="Administrador del sistema"
        )
        
        db.add(admin_role)
        db.commit()
        print("[SEED] Created admin role successfully")
        
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating admin role: {str(e)}")
    finally:
        db.close()