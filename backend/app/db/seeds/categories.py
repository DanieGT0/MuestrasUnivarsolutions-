from app.config.database import get_db
from app.models.category import Category
from sqlalchemy.exc import IntegrityError

def seed_categories():
    """Crear categor�as b�sicas de productos"""
    db = next(get_db())
    
    try:
        # Verificar si ya existen categor�as
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print("[SEED] Categories already exist, skipping...")
            return
            
        categories_data = [
            {"name": "Qu�micos", "description": "Productos qu�micos industriales"},
            {"name": "Pol�meros", "description": "Pol�meros y resinas"},
            {"name": "Solventes", "description": "Solventes y diluyentes"},
            {"name": "Aditivos", "description": "Aditivos y auxiliares"},
            {"name": "Pigmentos", "description": "Pigmentos y colorantes"},
            {"name": "Especialidades", "description": "Productos especializados"},
            {"name": "Agr�cola", "description": "Productos para agricultura"},
            {"name": "Farmac�utico", "description": "Productos farmac�uticos"}
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