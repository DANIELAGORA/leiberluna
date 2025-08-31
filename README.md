# 🏛️ FELIPE - Asistente Legal IA para Fiscales

> **Sistema completo de gestión fiscal con IA integrada**  
> Desarrollado por **Daniel López - Wramaba**

## 🎯 Características Principales

### 🤖 **Inteligencia Artificial Local**
- **CodeLlama 7B** para consultas legales generales
- **DeepSeek Coder 6.7B** para análisis especializado
- **MCP (Model Context Protocol)** para comunicación segura
- **Análisis automático** de documentos legales
- **Generación de escritos** judiciales

### 📱 **Diseño Responsivo**
- **Mobile-first** optimizado para celulares
- **Tablet-friendly** con navegación adaptada  
- **Desktop** con experiencia completa
- **PWA** instalable desde navegador
- **Offline** funcionalidad básica sin conexión

### 🔒 **Seguridad Empresarial**
- **Cloudflare** protección DDoS y WAF
- **Supabase** autenticación y base de datos
- **JWT** tokens seguros
- **RLS** (Row Level Security) en base de datos
- **Auditoría completa** de todas las acciones

### 🔄 **Automatización**
- **n8n workflows** para procesos automáticos
- **Notificaciones inteligentes** basadas en IA
- **Integración SIEJ/SIJUF** (simulada)
- **Backup automático** de datos críticos

## 🚀 Despliegue Rápido

### 📋 **Requisitos Previos**

```bash
# Ubuntu Server 20.04+ con:
- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM mínimo (16GB recomendado)
- 50GB almacenamiento
- GPU NVIDIA (opcional, para mejor rendimiento IA)
```

### ⚡ **Despliegue en 3 Pasos**

```bash
# 1. Clonar y configurar
git clone https://github.com/tu-repo/felipe-legal-ai.git
cd felipe-legal-ai
cp .env.example .env

# 2. Editar configuración
nano .env  # Configurar Supabase, Cloudflare, etc.

# 3. Desplegar
chmod +x deploy-production.sh
./deploy-production.sh ubuntu
```

### 🌐 **Cloudflare Pages (Solo Frontend)**

```bash
./deploy-production.sh cloudflare
```

### 💻 **Desarrollo Local**

```bash
./deploy-production.sh local
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Frontend      │    │    Backend      │
│   (Protección)  │◄──►│   React + PWA   │◄──►│   FastAPI       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   MCP Server    │    │   PostgreSQL    │
│   (Auth + DB)   │    │   (IA Local)    │    │   (Datos)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      n8n        │    │     Ollama      │    │     Redis       │
│  (Workflows)    │    │  (CodeLlama +   │    │    (Cache)      │
│                 │    │   DeepSeek)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuración Detallada

### 📝 **Variables de Entorno (.env)**

```bash
# === SUPABASE ===
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key

# === CLOUDFLARE ===
CLOUDFLARE_API_TOKEN=tu-token-cloudflare
CLOUDFLARE_ZONE_ID=tu-zone-id
DOMAIN=tu-dominio.com

# === SEGURIDAD ===
JWT_SECRET=tu-jwt-secret-muy-seguro
POSTGRES_PASSWORD=tu-password-postgres
```

### 🤖 **Modelos de IA Soportados**

| Modelo | Tamaño | Uso | RAM Requerida |
|--------|--------|-----|---------------|
| CodeLlama 7B | 3.8GB | Consultas legales generales | 8GB |
| DeepSeek Coder 6.7B | 3.7GB | Análisis de documentos | 8GB |
| Llama 2 13B | 7.3GB | Análisis avanzado (opcional) | 16GB |

### 🔄 **Workflows n8n Incluidos**

1. **Automatización de Casos**
   - Detección automática de casos críticos
   - Notificaciones inteligentes
   - Asignación automática de prioridades

2. **Análisis de Documentos**
   - Procesamiento automático al subir
   - Extracción de información clave
   - Alertas de inconsistencias

3. **Recordatorios de Audiencias**
   - Notificaciones 24h y 1h antes
   - Preparación automática de documentos
   - Sincronización con calendario

## 📱 Funcionalidades Móviles

### 🔥 **Características PWA**
- ✅ **Instalable** desde cualquier navegador
- ✅ **Offline** consulta de casos guardados
- ✅ **Push notifications** para audiencias
- ✅ **Sincronización** automática al reconectar
- ✅ **Touch gestures** navegación intuitiva

### 📲 **Optimizaciones Móvil**
- **Navegación por gestos** (swipe, tap, hold)
- **Teclado virtual** optimizado para formularios legales
- **Cámara integrada** para captura de documentos
- **Modo oscuro** para uso nocturno
- **Compresión inteligente** de imágenes

## 🛡️ Seguridad y Cumplimiento

### 🔐 **Medidas de Seguridad**
- **Encriptación end-to-end** para datos sensibles
- **Autenticación multifactor** opcional
- **Logs de auditoría** completos
- **Backup automático** cifrado
- **Compliance GDPR** y ley de protección de datos

### 🌐 **Protección Cloudflare**
- **DDoS protection** automática
- **WAF** (Web Application Firewall)
- **Bot management** inteligente
- **SSL/TLS** automático
- **CDN global** para velocidad

## 🔧 Administración

### 📊 **Monitoreo**
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f

# Estado de servicios
docker-compose -f docker-compose.production.yml ps

# Métricas de uso
curl http://localhost/api/health
```

### 🔄 **Actualizaciones**
```bash
# Actualizar sistema
git pull origin main
./deploy-production.sh ubuntu

# Actualizar solo modelos IA
./scripts/init-models.sh
```

### 💾 **Backup y Restauración**
```bash
# Backup automático (configurado en cron)
./scripts/backup.sh

# Restaurar desde backup
./scripts/restore.sh backup-2024-01-15.tar.gz
```

## 🎓 Guía de Uso

### 👨‍💼 **Para Fiscales**
1. **Acceso**: Usar credenciales institucionales
2. **Casos**: Crear, gestionar y hacer seguimiento
3. **IA**: Consultar sobre legislación y procedimientos
4. **Documentos**: Subir y analizar automáticamente
5. **Calendario**: Gestionar audiencias y diligencias

### 🔧 **Para Administradores**
1. **Usuarios**: Gestionar accesos y permisos
2. **Workflows**: Configurar automatizaciones en n8n
3. **Modelos**: Actualizar y optimizar IA
4. **Monitoreo**: Supervisar rendimiento y errores
5. **Backup**: Configurar respaldos automáticos

## 🆘 Soporte y Troubleshooting

### 🐛 **Problemas Comunes**

**IA no responde:**
```bash
# Verificar Ollama
docker exec felipe-ollama ollama list

# Reiniciar MCP server
docker-compose restart mcp-server
```

**Error de conexión a base de datos:**
```bash
# Verificar PostgreSQL
docker-compose logs postgres

# Verificar conexión
docker exec felipe-postgres psql -U postgres -d felipe_db -c "SELECT 1;"
```

**Frontend no carga:**
```bash
# Verificar Nginx
docker-compose logs nginx

# Reconstruir frontend
docker-compose build frontend
```

### 📞 **Contacto de Soporte**
- **Desarrollador**: Daniel López - Wramaba
- **Email**: daniel@wramaba.com
- **Documentación**: https://docs.felipe-ai.com
- **Issues**: https://github.com/tu-repo/felipe-legal-ai/issues

## 📄 Licencia

Este proyecto está licenciado bajo MIT License - ver [LICENSE](LICENSE) para detalles.

---

**🏛️ FELIPE - Transformando la justicia con IA**  
*Desarrollado con ❤️ por Daniel López - Wramaba*