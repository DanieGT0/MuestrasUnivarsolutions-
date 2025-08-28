# 🏭 Sistema de Gestión de Muestras Univar

Sistema completo de gestión de inventario de muestras con FastAPI (backend) y React (frontend), diseñado para operaciones multi-país con autenticación y control de roles.

## 📋 Características

- 🔐 **Autenticación JWT** con roles de usuario
- 🌍 **Multi-país** con restricciones por usuario
- 📦 **Gestión de productos** con categorías y fechas de vencimiento
- 📊 **Kardex completo** de movimientos de inventario
- 📈 **Dashboard analítico** con estadísticas en tiempo real
- 🎨 **Interfaz moderna** con soporte de múltiples idiomas
- 📱 **Responsive design** para dispositivos móviles

## 🏗️ Arquitectura

### Backend (FastAPI)
- **Framework**: FastAPI + SQLAlchemy ORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT tokens
- **Documentación**: Swagger UI automática

### Frontend (React)
- **Framework**: React 18 + Hooks
- **Estilo**: Tailwind CSS
- **Estado**: Context API + hooks personalizados
- **Routing**: React Router con protección de rutas

## 🚀 Deployment en Render

### Pre-requisitos
1. Cuenta en [Render](https://render.com)
2. Repositorio GitHub con el código
3. Base de datos PostgreSQL creada en Render

### 🗄️ Base de Datos
1. Crear PostgreSQL database en Render:
   - **Name**: `muestrasunivardb`
   - **Database**: `muestras_univar`
   - **User**: `muestras_admin`
   - **Region**: Oregon

### 🔧 Backend Deployment

1. **Crear Web Service en Render**:
   ```
   Name: muestras-univar-api
   Build Command: pip install -r requirements.txt
   Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. **Variables de Entorno**:
   ```bash
   DATABASE_URL_PRODUCTION=postgresql://muestras_admin:password@host:5432/muestras_univar
   SECRET_KEY=tu-clave-super-segura-generada
   ENVIRONMENT=production
   DEBUG=false
   BACKEND_CORS_ORIGINS=https://tu-frontend.onrender.com
   ```

### 🎨 Frontend Deployment

1. **Crear Static Site en Render**:
   ```
   Name: muestras-univar-frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

2. **Variables de Entorno**:
   ```bash
   REACT_APP_API_URL=https://tu-backend.onrender.com/api/v1
   ```

## 🔐 Configuración de Seguridad

### Generar SECRET_KEY
```bash
python generate_secret_key.py
```

### Variables de Entorno
Copiar archivos ejemplo y configurar:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## 📚 Funcionalidades del Sistema

### 👤 Gestión de Usuarios
- Roles: Admin, Manager, Viewer
- Restricciones por país
- Autenticación segura JWT

### 📦 Gestión de Productos
- Códigos automáticos por país
- Control de vencimientos
- Categorización flexible
- Importación masiva Excel

### 📊 Kardex e Inventario
- Entradas y salidas registradas
- Ajustes de inventario
- Trazabilidad completa
- Reportes exportables

### 📈 Análisis y Reportes
- Dashboard en tiempo real
- Estadísticas por país/categoría
- Alertas de stock bajo
- Exportación a Excel

### 🌐 Internacionalización
- Soporte English/Español
- Cambio dinámico de idioma
- Fechas localizadas

## 🛠️ Desarrollo Local

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📝 Usuario por Defecto

El sistema crea automáticamente un usuario administrador:
- **Email**: admin@muestrasunivar.com
- **Password**: admin123
- **Rol**: Administrador

## 🔄 Automatización

### Inicialización Automática
El sistema incluye:
- ✅ Creación automática de tablas
- ✅ Datos semilla (países, roles, categorías)
- ✅ Usuario administrador por defecto
- ✅ Configuración multi-ambiente

## 📞 Soporte

Para problemas con el deployment:
1. Verificar variables de entorno en Render
2. Revisar logs de deployment
3. Confirmar connection string de base de datos
4. Verificar CORS configuration

## 📄 Licencia

Este proyecto es propiedad privada de Univar.

---

**🎯 Ready for Production Deployment on Render!** 🚀