# 🔒 Guía de Seguridad y Deployment

Este documento describe las correcciones de seguridad implementadas y los pasos necesarios para un deployment seguro en Render.

## ✅ Problemas de Seguridad CORREGIDOS

### 1. 🔑 SECRET_KEY Securizado
- **Antes**: Clave hardcodeada en código fuente
- **Ahora**: Se lee desde variables de entorno
- **Archivo**: `backend/app/config/settings.py`

### 2. 🗄️ Credenciales de Base de Datos
- **Antes**: Usuario y contraseña expuestos en código
- **Ahora**: Se leen desde variables de entorno
- **Configuración**: Soporte para BD de desarrollo y producción

### 3. 🌐 API URLs Configurables
- **Antes**: URL hardcodeada a localhost
- **Ahora**: Configurable via `REACT_APP_API_URL`
- **Archivo**: `frontend/src/config/api.js`

### 4. 🚫 Logs de Debug Eliminados
- **Antes**: Información sensible en logs
- **Ahora**: Logs de debug removidos de producción
- **Archivo**: `backend/app/api/v1/endpoints/auth.py`

### 5. 🛡️ CORS Configurado para Producción
- **Antes**: Solo localhost permitido
- **Ahora**: Soporte para dominios de Render
- **Configuración**: Wildcards para `*.onrender.com`

## 📋 PASOS OBLIGATORIOS ANTES DEL DEPLOYMENT

### 🔧 Backend Setup

1. **Generar SECRET_KEY segura**:
   ```bash
   python generate_secret_key.py
   ```

2. **Crear archivo .env** (copiar desde .env.example):
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Configurar variables de entorno en .env**:
   ```bash
   SECRET_KEY=tu-clave-super-segura-generada
   DATABASE_URL_PRODUCTION=postgresql://user:pass@host:port/db
   ENVIRONMENT=production
   DEBUG=false
   BACKEND_CORS_ORIGINS=https://tu-frontend.onrender.com
   ```

### 🎨 Frontend Setup

1. **Crear archivo .env** (copiar desde .env.example):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. **Configurar API URL**:
   ```bash
   REACT_APP_API_URL=https://tu-backend.onrender.com/api/v1
   ```

## 🚀 Deployment en Render

### Opción 1: Usando render.yaml (Recomendado)
El archivo `render.yaml` está configurado para deployment automático.

### Opción 2: Manual

1. **Backend**:
   - Tipo: Web Service
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Frontend**:
   - Tipo: Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

3. **Base de Datos**:
   - Crear PostgreSQL database en Render
   - Configurar `DATABASE_URL_PRODUCTION` con la connection string

## 🔒 Variables de Entorno Críticas en Render

### Backend:
- `SECRET_KEY`: Generar nueva clave única
- `DATABASE_URL_PRODUCTION`: Connection string de PostgreSQL
- `ENVIRONMENT=production`
- `DEBUG=false`
- `BACKEND_CORS_ORIGINS`: URL del frontend

### Frontend:
- `REACT_APP_API_URL`: URL del backend

## ⚠️ Checklist de Seguridad Final

- [ ] SECRET_KEY única y segura configurada
- [ ] Credenciales de BD no están en código fuente
- [ ] DEBUG=false en producción
- [ ] CORS configurado correctamente
- [ ] Variables de entorno configuradas en Render
- [ ] Logs de debug removidos
- [ ] Archivos .env agregados a .gitignore

## 🚨 IMPORTANTE

**NUNCA** commitear archivos `.env` con valores reales al repositorio. Solo usar `.env.example` como plantilla.

## 📞 Soporte

Si tienes problemas con el deployment, revisa:
1. Logs de Render para errores específicos
2. Variables de entorno configuradas correctamente
3. URLs de API coinciden entre frontend y backend
4. Base de datos accesible desde Render