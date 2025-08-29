from app.config.database import get_db
from app.models.role import Role
from sqlalchemy.exc import IntegrityError

def seed_roles():
    """Crear roles básicos del sistema"""
    db = next(get_db())
    
    try:
        # Verificar si ya existen roles
        existing_roles = db.query(Role).count()
        if existing_roles > 0:
            print("[SEED] Roles already exist, skipping...")
            return
            
        roles_data = [
            {"name": "administrador", "description": "Administrador del sistema con acceso completo"},
            {"name": "manager", "description": "Manager con permisos de gestión limitados"},
            {"name": "viewer", "description": "Visualizador con permisos de solo lectura"}
        ]
        
        for role_data in roles_data:
            role = Role(**role_data)
            db.add(role)
        
        db.commit()
        print(f"[SEED] Created {len(roles_data)} roles successfully")
        
    except IntegrityError as e:
        db.rollback()
        print(f"[SEED] Roles already exist or integrity error: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating roles: {str(e)}")
    finally:
        db.close()