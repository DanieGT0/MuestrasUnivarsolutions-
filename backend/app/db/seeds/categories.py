# -*- coding: utf-8 -*-
from app.config.database import SessionLocal
from app.models.category import Category

def seed_categories():
    """No crear categorias - se haran manual desde la interfaz"""
    print("[SEED] Categories will be created manually from the interface")