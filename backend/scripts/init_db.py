#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para inicializar la base de datos con datos semilla
"""

import sys
import os

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.database import engine, SessionLocal
from app.models import base
from app.db.seeds.countries import seed_countries

def init_database():
    """Inicializar la base de datos con datos semilla"""
    
    print("Iniciando inicializacion de la base de datos...")
    
    try:
        # Crear todas las tablas
        print("Creando tablas de la base de datos...")
        base.BaseModel.metadata.create_all(bind=engine)
        print("Tablas creadas exitosamente")
        
        # Ejecutar seeds
        print("\nEjecutando seeds de datos...")
        
        # 1. Paises
        print("1. Seeding paises...")
        seed_countries()
        
        print("\nBase de datos inicializada exitosamente!")
        print("\nResumen:")
        print("   Tablas creadas")
        print("   Paises cargados (incluyendo Republica Dominicana y Panama)")
        
        # Mostrar informacion de conexion
        print("\nInformacion de conexion:")
        print("   Database: muestras_univar")
        print("   API URL: http://localhost:8000")
        print("   Docs: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"Error durante la inicializacion: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    init_database()