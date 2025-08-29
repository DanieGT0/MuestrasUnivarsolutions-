# -*- coding: utf-8 -*-
from app.config.database import SessionLocal
from app.models.role import Role
from sqlalchemy.exc import IntegrityError

def seed_roles():
    """Crear todos los roles del sistema"""
    db = SessionLocal()
    
    roles_to_create = [
        {
            "name": "administrador",
            "description": "Administrador del sistema - Acceso completo a todos los módulos"
        },
        {
            "name": "user",
            "description": "Usuario regular - Acceso a productos, movimientos y reportes de países asignados"
        },
        {
            "name": "comercial",
            "description": "Usuario comercial - Solo acceso a reportes de países y categorías asignadas"
        }
    ]
    
    try:
        for role_data in roles_to_create:
            # Verificar si el rol ya existe
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if existing_role:
                print(f"[SEED] Role '{role_data['name']}' already exists, skipping...")
                continue
                
            # Crear el rol
            new_role = Role(
                name=role_data["name"],
                description=role_data["description"]
            )
            
            db.add(new_role)
            print(f"[SEED] Created role '{role_data['name']}' successfully")
        
        db.commit()
        print("[SEED] All roles created successfully")
        
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating roles: {str(e)}")
    finally:
        db.close()