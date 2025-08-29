from app.config.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.country import Country
from app.models.user_country import UserCountry
from app.utils.password_utils import get_password_hash
from sqlalchemy.exc import IntegrityError

def seed_admin_user():
    """Crear usuario administrador por defecto"""
    db = next(get_db())
    
    try:
        # Verificar si ya existe el usuario admin
        existing_user = db.query(User).filter(User.email == "admin@muestrasunivar.com").first()
        if existing_user:
            print("[SEED] Admin user already exists, skipping...")
            return
            
        # Obtener rol de administrador
        admin_role = db.query(Role).filter(Role.name == "administrador").first()
        if not admin_role:
            print("[SEED] Admin role not found, creating it first...")
            admin_role = Role(name="administrador", description="Administrador del sistema")
            db.add(admin_role)
            db.commit()
        
        # Crear usuario administrador
        admin_user_data = {
            "email": "admin@muestrasunivar.com",
            "password_hash": get_password_hash("admin123"),
            "first_name": "Admin",
            "last_name": "Sistema",
            "role_id": admin_role.id,
            "is_active": True
        }
        
        admin_user = User(**admin_user_data)
        db.add(admin_user)
        db.commit()
        
        # Asignar todos los países al administrador
        countries = db.query(Country).all()
        for country in countries:
            user_country = UserCountry(user_id=admin_user.id, country_id=country.id)
            db.add(user_country)
        
        db.commit()
        print(f"[SEED] Created admin user successfully with {len(countries)} countries assigned")
        
    except IntegrityError as e:
        db.rollback()
        print(f"[SEED] Admin user already exists or integrity error: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating admin user: {str(e)}")
    finally:
        db.close()