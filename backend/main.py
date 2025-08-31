"""
Backend FastAPI para FELIPE - Asistente Legal IA
Desarrollado por Daniel López - Wramaba
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import bcrypt
import os
import redis
import json
from typing import List, Optional
import asyncio
import aiofiles

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/felipe_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Base de datos
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis
redis_client = redis.from_url(REDIS_URL)

# FastAPI app
app = FastAPI(
    title="FELIPE API",
    description="API para Asistente Legal IA - Sistema Fiscal Colombia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de base de datos
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    position = Column(String)
    fiscalia = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True)
    case_number = Column(String, unique=True, index=True)
    title = Column(String)
    defendant = Column(String)
    crime_type = Column(String)
    status = Column(String)
    priority = Column(String)
    progress = Column(Integer, default=0)
    description = Column(Text)
    investigator = Column(String)
    evidence_count = Column(Integer, default=0)
    witness_count = Column(Integer, default=0)
    next_hearing = Column(DateTime)
    user_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Modelos Pydantic
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    position: str
    fiscalia: str

class UserLogin(BaseModel):
    email: str
    password: str

class CaseCreate(BaseModel):
    title: str
    defendant: str
    crime_type: str
    priority: str
    description: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    description: Optional[str] = None

class AIQuery(BaseModel):
    query: str
    context: Optional[dict] = None
    model: Optional[str] = "codellama"

# Dependencias
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Utilidades
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

# Endpoints de autenticación
@app.post("/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar si el usuario ya existe
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # Crear nuevo usuario
    hashed_password = hash_password(user.password)
    db_user = User(
        id=f"user_{datetime.utcnow().timestamp()}",
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        position=user.position,
        fiscalia=user.fiscalia
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Crear token
    access_token = create_access_token(data={"sub": db_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "position": db_user.position,
            "fiscalia": db_user.fiscalia
        }
    }

@app.post("/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not db_user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inactivo")
    
    access_token = create_access_token(data={"sub": db_user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "position": db_user.position,
            "fiscalia": db_user.fiscalia
        }
    }

# Endpoints de casos
@app.get("/cases")
async def get_cases(user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.user_id == user_id).all()
    return cases

@app.post("/cases")
async def create_case(
    case: CaseCreate, 
    user_id: str = Depends(verify_token), 
    db: Session = Depends(get_db)
):
    # Generar número de caso único
    case_count = db.query(Case).count() + 1
    case_number = f"FIS-2024-{case_count:03d}"
    
    db_case = Case(
        id=f"case_{datetime.utcnow().timestamp()}",
        case_number=case_number,
        title=case.title,
        defendant=case.defendant,
        crime_type=case.crime_type,
        status="active",
        priority=case.priority,
        description=case.description,
        investigator="Sistema",
        user_id=user_id
    )
    
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    return db_case

@app.put("/cases/{case_id}")
async def update_case(
    case_id: str,
    case_update: CaseUpdate,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_case = db.query(Case).filter(
        Case.id == case_id, 
        Case.user_id == user_id
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    # Actualizar campos
    for field, value in case_update.dict(exclude_unset=True).items():
        setattr(db_case, field, value)
    
    db_case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_case)
    
    return db_case

@app.delete("/cases/{case_id}")
async def delete_case(
    case_id: str,
    user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    db_case = db.query(Case).filter(
        Case.id == case_id, 
        Case.user_id == user_id
    ).first()
    
    if not db_case:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    db.delete(db_case)
    db.commit()
    
    return {"message": "Caso eliminado correctamente"}

# Endpoints de IA
@app.post("/ai/chat")
async def ai_chat(
    query: AIQuery,
    user_id: str = Depends(verify_token)
):
    try:
        # Llamar al servidor MCP
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://mcp-server:3001/api/generate",
                json={
                    "prompt": query.query,
                    "model": query.model,
                    "context": query.context,
                    "system": """Eres FELIPE, un asistente de IA especializado en derecho penal colombiano. 
                    Respondes de manera precisa, citando artículos específicos del Código Penal y Código de Procedimiento Penal colombiano.
                    Siempre incluyes referencias jurisprudenciales relevantes de la Corte Suprema de Justicia y Corte Constitucional."""
                }
            ) as resp:
                result = await resp.json()
                return {"response": result["response"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en IA: {str(e)}")

@app.post("/ai/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = None,
    user_id: str = Depends(verify_token)
):
    try:
        # Leer contenido del archivo
        content = await file.read()
        text_content = content.decode('utf-8', errors='ignore')
        
        # Analizar con IA
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://mcp-server:3001/api/generate",
                json={
                    "prompt": f"Analiza este documento legal: {text_content[:2000]}...",
                    "model": "deepseek"
                }
            ) as resp:
                result = await resp.json()
                
                return {
                    "summary": result["response"][:200] + "...",
                    "keyPoints": ["Documento analizado correctamente"],
                    "issues": [],
                    "confidence": 85,
                    "filename": file.filename
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando documento: {str(e)}")

# Endpoints de estadísticas
@app.get("/stats/dashboard")
async def get_dashboard_stats(user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    total_cases = db.query(Case).filter(Case.user_id == user_id).count()
    active_cases = db.query(Case).filter(Case.user_id == user_id, Case.status == "active").count()
    pending_cases = db.query(Case).filter(Case.user_id == user_id, Case.status == "pending").count()
    completed_cases = db.query(Case).filter(Case.user_id == user_id, Case.status == "completed").count()
    
    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "pending_cases": pending_cases,
        "completed_cases": completed_cases,
        "critical_cases": db.query(Case).filter(
            Case.user_id == user_id, 
            Case.priority == "critical"
        ).count()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)