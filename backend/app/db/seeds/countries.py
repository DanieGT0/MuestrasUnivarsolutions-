# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from app.models.country import Country
from app.config.database import SessionLocal

def seed_countries():
    """Seed countries data with Central American and Caribbean countries"""
    
    countries_data = [
        # Centroamerica
        {"name": "Guatemala", "code": "GT", "is_active": True},
        {"name": "El Salvador", "code": "SV", "is_active": True},
        {"name": "Honduras", "code": "HN", "is_active": True},
        {"name": "Nicaragua", "code": "NI", "is_active": True},
        {"name": "Costa Rica", "code": "CR", "is_active": True},
        {"name": "Panama", "code": "PA", "is_active": True},
        {"name": "Belice", "code": "BZ", "is_active": True},
        
        # Caribe
        {"name": "Republica Dominicana", "code": "DO", "is_active": True},
        {"name": "Cuba", "code": "CU", "is_active": True},
        {"name": "Haiti", "code": "HT", "is_active": True},
        {"name": "Jamaica", "code": "JM", "is_active": True},
        {"name": "Puerto Rico", "code": "PR", "is_active": True},
        {"name": "Trinidad y Tobago", "code": "TT", "is_active": True},
        {"name": "Barbados", "code": "BB", "is_active": True},
        {"name": "Bahamas", "code": "BS", "is_active": True},
        
        # Otros paises importantes
        {"name": "Mexico", "code": "MX", "is_active": True},
        {"name": "Colombia", "code": "CO", "is_active": True},
        {"name": "Venezuela", "code": "VE", "is_active": True},
        {"name": "Ecuador", "code": "EC", "is_active": True},
        {"name": "Peru", "code": "PE", "is_active": True},
        {"name": "Chile", "code": "CL", "is_active": True},
        {"name": "Argentina", "code": "AR", "is_active": True},
        {"name": "Brasil", "code": "BR", "is_active": True},
        {"name": "Estados Unidos", "code": "US", "is_active": True},
        {"name": "Canada", "code": "CA", "is_active": True},
    ]
    
    db = SessionLocal()
    
    try:
        print("Iniciando seed de paises...")
        
        for country_data in countries_data:
            # Verificar si el pais ya existe
            existing_country = db.query(Country).filter(
                Country.code == country_data["code"]
            ).first()
            
            if not existing_country:
                country = Country(**country_data)
                db.add(country)
                print(f"Agregando pais: {country_data['name']} ({country_data['code']})")
            else:
                print(f"Pais ya existe: {country_data['name']} ({country_data['code']})")
        
        db.commit()
        print(f"Seed de paises completado. {len(countries_data)} paises procesados.")
        
    except Exception as e:
        print(f"Error durante el seed de paises: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_countries()