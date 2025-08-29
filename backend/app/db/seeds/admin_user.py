# -*- coding: utf-8 -*-
from app.config.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.utils.password_utils import get_password_hash
from sqlalchemy.exc import IntegrityError

def seed_admin_user():
    """Crear usuario administrador basico"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe el usuario admin
        existing_user = db.query(User).filter(User.email == "admin@muestrasunivar.com").first()
        if existing_user:
            print("[SEED] Admin user already exists, skipping...")
            return
            
        # Obtener rol de administrador
        admin_role = db.query(Role).filter(Role.name == "administrador").first()
        if not admin_role:
            print("[SEED] Admin role not found! Make sure roles are seeded first.")
            return
        
        # Crear usuario administrador
        admin_user = User(
            email="admin@muestrasunivar.com",
            password_hash=get_password_hash("gmZvTiZtA5g31eJl"),
            first_name="Admin",
            last_name="Sistema",
            role_id=admin_role.id,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        print("[SEED] Created admin user successfully")
        print("[SEED] Login: admin@muestrasunivar.com / gmZvTiZtA5g31eJl")
        print("[SEED] WARNING: Change this password in production!")
        
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating admin user: {str(e)}")
    finally:
        db.close()