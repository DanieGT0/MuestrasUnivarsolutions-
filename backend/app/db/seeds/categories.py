from app.config.database import get_db
from app.models.category import Category
from sqlalchemy.exc import IntegrityError

def seed_categories():
    """Crear categorías básicas de productos"""
    db = next(get_db())
    
    try:
        # Verificar si ya existen categorías
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print("[SEED] Categories already exist, skipping...")
            return
            
        categories_data = [
            {"name": "Químicos", "description": "Productos químicos industriales"},
            {"name": "Polímeros", "description": "Polímeros y resinas"},
            {"name": "Solventes", "description": "Solventes y diluyentes"},
            {"name": "Aditivos", "description": "Aditivos y auxiliares"},
            {"name": "Pigmentos", "description": "Pigmentos y colorantes"},
            {"name": "Especialidades", "description": "Productos especializados"},
            {"name": "Agrícola", "description": "Productos para agricultura"},
            {"name": "Farmacéutico", "description": "Productos farmacéuticos"}
        ]
        
        for category_data in categories_data:
            category = Category(**category_data)
            db.add(category)
        
        db.commit()
        print(f"[SEED] Created {len(categories_data)} categories successfully")
        
    except IntegrityError as e:
        db.rollback()
        print(f"[SEED] Categories already exist or integrity error: {str(e)}")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error creating categories: {str(e)}")
    finally:
        db.close()