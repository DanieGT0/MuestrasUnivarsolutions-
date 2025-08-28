# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack inventory management system for "Muestras Univar" (Univar Samples) with a FastAPI backend and React frontend. The system manages product samples, inventory movements, categories, and user authentication with role-based permissions.

## Architecture

### Backend (FastAPI + PostgreSQL)
- **Location**: `backend/`
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL via `psycopg2-binary`
- **Authentication**: JWT tokens with `python-jose`
- **Password Hashing**: bcrypt via `passlib`

**Key Backend Patterns:**
- Repository pattern in `app/repositories/` for data access
- Service layer in `app/services/` for business logic
- Pydantic schemas in `app/schemas/` for data validation
- SQLAlchemy models in `app/models/` extending `BaseModel` from `app/models/base.py`
- API endpoints organized under `app/api/v1/endpoints/`

### Frontend (React)
- **Location**: `frontend/`
- **Framework**: React 18 with Create React App
- **Styling**: Tailwind CSS + PostCSS
- **Icons**: Lucide React
- **State Management**: Redux (store in `src/redux/`)
- **Authentication**: Context-based with localStorage persistence

**Key Frontend Patterns:**
- Page components in `src/pages/` organized by feature
- Reusable UI components in `src/components/ui/`
- Service layer in `src/services/` for API calls
- Adapters in `src/adapters/` for data transformation
- Route protection in `src/routes/`

## Development Commands

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations
alembic upgrade head

# Run tests
python -m pytest

# Initialize database with seeds
python scripts/init_db.py
```

### Frontend Development  
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Database Configuration

- **Development**: PostgreSQL at `postgresql://postgre:123321@localhost:5432/muestras_univar`
- **Migrations**: Alembic migrations in `backend/alembic/versions/`
- **Seeds**: Database seeding scripts in `backend/app/db/seeds/`

## Key Configuration Files

- **Backend Settings**: `backend/app/config/settings.py` - Contains JWT secrets, CORS origins, database URLs
- **Frontend Package**: `frontend/package.json` - React scripts and Tailwind setup
- **Database Config**: `backend/app/config/database.py` - SQLAlchemy configuration

## Authentication Flow

The application uses JWT-based authentication:
1. Login via `POST /api/v1/auth/login` returns access token
2. Frontend stores token in localStorage
3. Protected routes require valid JWT token
4. Role-based permissions enforced on backend

## Core Domain Models

- **Users**: Authentication and role management
- **Products**: Sample products with categories
  - **Note**: Products can be created with past expiration dates (expired products allowed)
- **Inventory**: Stock tracking and movements
- **Movements**: Entry/exit transactions (Kardex)
- **Categories**: Product categorization
- **Countries**: Geographic data for reporting

## Docker Support

The backend includes Docker configuration:
- `backend/Dockerfile` for containerization
- `backend/docker-compose.yml` for local development with PostgreSQL

## Testing Structure

- **Backend Tests**: `backend/tests/` with pytest fixtures
- **Frontend Tests**: Jest/React Testing Library (via Create React App)

## Important Notes

- Many files in both frontend and backend appear to be placeholder files (1 line each)
- The main application logic is implemented in key files like `backend/app/main.py` and `frontend/src/App.js`
- Database models follow a base model pattern with common fields (id, created_at, updated_at)
- Frontend uses mock authentication service in `App.js` for development