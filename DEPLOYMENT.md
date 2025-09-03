# 🚀 Deployment Guide - Muestras Univar Enterprise

## 📋 Current Deployment Information

### 🌐 Production URLs
- **Frontend**: https://muestras-univar-frontend.onrender.com
- **Backend API**: https://muestras-univar-api.onrender.com  
- **Database**: PostgreSQL on Render (Oregon region)

### 🔐 Current Admin Access
- **Email**: `admin@muestrasunivar.com`
- **Password**: `admin123`
- **Role**: Administrator with full access

---

## 🏗️ Render Configuration

### Backend Service (`muestras-univar-api`)
```yaml
Name: muestras-univar-api
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
Auto-Deploy: Yes (connected to GitHub)
```

### Frontend Service (`muestras-univar-frontend`)  
```yaml
Name: muestras-univar-frontend
Runtime: Node
Build Command: npm install && npm run build
Publish Directory: build
Auto-Deploy: Yes (connected to GitHub)
```

### Database Configuration
```yaml
Database Name: muestrasunivardb
Database: muestras_univar
User: muestras_admin
Region: Oregon (us-west-2)
Version: PostgreSQL 14
```

---

## 🔧 Environment Variables

### Backend Environment Variables
```env
# Database
DATABASE_URL_PRODUCTION=postgresql://muestras_admin:[PASSWORD]@[HOST]/muestras_univar
DATABASE_URL=postgresql://muestras_admin:[PASSWORD]@[HOST]/muestras_univar

# Security
SECRET_KEY=[STRONG_JWT_SECRET_KEY]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Application
ENVIRONMENT=production
DEBUG=false
PROJECT_NAME=Muestras Univar API
VERSION=2.0.0

# CORS
BACKEND_CORS_ORIGINS=["https://muestras-univar-frontend.onrender.com"]
CORS_ALLOW_ALL=false

# Timezone
TIMEZONE=America/El_Salvador
```

### Frontend Environment Variables
```env
# API Configuration
REACT_APP_API_URL=https://muestras-univar-api.onrender.com

# Build Configuration  
GENERATE_SOURCEMAP=false
NODE_ENV=production
```

---

## 🔄 Branch Strategy

### Current Branches
- **`main`**: Production-ready version (current deployment)
- **`feature/enterprise-auth-fastapi-users`**: Enterprise authentication with FastAPI-Users

### Deployment Strategy
1. **Development**: Local development with SQLite
2. **Staging**: Feature branches deployed to test environments  
3. **Production**: Main branch auto-deploys to Render

---

## 🆙 Migration to Enterprise Authentication

### Phase 1: Preparation (Current)
- ✅ FastAPI-Users implementation complete
- ✅ Dual database support (sync/async)
- ✅ Enterprise security features ready
- ✅ Backward compatibility maintained

### Phase 2: Database Migration (Next)
```sql
-- Add UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create new enterprise tables
CREATE TABLE user_sessions (...);
CREATE TABLE audit_logs (...);

-- Migrate existing users to UUID format
-- [Migration scripts to be provided]
```

### Phase 3: Activation
1. Uncomment FastAPI-Users routes in `main.py`
2. Update environment variables
3. Run database migration
4. Test authentication endpoints
5. Deploy to production

---

## 📊 Performance Monitoring

### Key Metrics to Monitor
- **API Response Time**: < 200ms average
- **Database Connections**: Monitor pool usage
- **Error Rate**: < 1% target
- **Uptime**: 99.9% SLA target

### Health Check Endpoints
- Backend: `GET /health`
- Database: `GET /api/v1/health/db`
- Full System: `GET /api/v1/health/system`

---

## 🔒 Security Checklist

### Current Security Features
- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ Country-based data isolation
- ✅ CORS properly configured
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ Input validation (Pydantic)

### Enterprise Security Features (Ready to Activate)
- ✅ Account lockout after failed attempts
- ✅ Strong password policies  
- ✅ Session management and timeout
- ✅ Comprehensive audit trail
- ✅ Enhanced user management
- ✅ Two-factor authentication ready

---

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `BACKEND_CORS_ORIGINS` includes frontend URL
- Verify OPTIONS endpoints are working
- Check middleware order in `main.py`

**2. Database Connection Issues**
- Verify `DATABASE_URL` format
- Check database service status on Render
- Monitor connection pool usage

**3. Authentication Issues**
- Verify `SECRET_KEY` is set correctly
- Check token expiration settings
- Validate user permissions and country assignments

**4. Build Failures**
- Backend: Check `requirements.txt` compatibility
- Frontend: Check Node version compatibility
- Database: Verify migration scripts

### Emergency Contacts
- **Developer**: [Your Contact Info]
- **Render Support**: Via Render dashboard
- **Database Admin**: [DB Admin Contact]

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI-Users Documentation](https://fastapi-users.github.io/fastapi-users/)
- [Render Deployment Guide](https://render.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

*Last Updated: $(date +'%Y-%m-%d')*
*Version: 2.0.0 Enterprise*