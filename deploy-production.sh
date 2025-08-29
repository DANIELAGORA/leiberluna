#!/bin/bash

# Script maestro de despliegue para FELIPE
# Desarrollado por Daniel López - Wramaba
# Soporta Cloudflare Pages y Ubuntu Server

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🏛️  FELIPE DEPLOY 🏛️                      ║"
echo "║              Asistente Legal IA para Fiscales               ║"
echo "║                                                              ║"
echo "║              👨‍💻 Desarrollado por Daniel López                ║"
echo "║                        Wramaba                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Uso: $0 [cloudflare|ubuntu|local]${NC}"
    echo ""
    echo "Opciones:"
    echo "  cloudflare  - Desplegar frontend en Cloudflare Pages"
    echo "  ubuntu      - Desplegar stack completo en Ubuntu Server"
    echo "  local       - Desplegar localmente para desarrollo"
    exit 1
fi

DEPLOY_TARGET=$1

# Funciones de despliegue
deploy_cloudflare() {
    echo -e "${BLUE}🌐 Desplegando en Cloudflare Pages...${NC}"
    
    # Verificar Wrangler CLI
    if ! command -v wrangler &> /dev/null; then
        echo "📦 Instalando Wrangler CLI..."
        npm install -g wrangler
    fi
    
    # Build para producción
    echo "🔨 Construyendo aplicación..."
    npm run build
    
    # Desplegar
    echo "🚀 Desplegando a Cloudflare Pages..."
    wrangler pages deploy dist --project-name felipe-legal-ai
    
    echo -e "${GREEN}✅ Desplegado en Cloudflare Pages${NC}"
}

deploy_ubuntu() {
    echo -e "${BLUE}🐧 Desplegando en Ubuntu Server...${NC}"
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        echo "📦 Instalando Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "📦 Instalando Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Configurar variables de entorno
    if [ ! -f .env ]; then
        echo "⚙️ Configurando variables de entorno..."
        cp .env.example .env
        
        # Generar secretos
        JWT_SECRET=$(openssl rand -hex 32)
        POSTGRES_PASSWORD=$(openssl rand -hex 16)
        N8N_PASSWORD=$(openssl rand -hex 12)
        
        sed -i "s/tu-jwt-secret-muy-seguro-aqui/$JWT_SECRET/g" .env
        sed -i "s/tu-password-postgres-seguro/$POSTGRES_PASSWORD/g" .env
        sed -i "s/n8n-admin-2024-seguro/$N8N_PASSWORD/g" .env
        
        echo -e "${YELLOW}⚠️  Edita .env con tus configuraciones de Supabase y Cloudflare${NC}"
        echo -e "${YELLOW}⚠️  Presiona Enter cuando esté listo...${NC}"
        read
    fi
    
    # Crear directorios necesarios
    mkdir -p logs ssl backups
    
    # Configurar SSL si hay dominio
    source .env
    if [ ! -z "$DOMAIN" ]; then
        echo "🔒 Configurando SSL para $DOMAIN..."
        # Aquí iría la configuración de Let's Encrypt
    fi
    
    # Desplegar con Docker Compose
    echo "🚀 Desplegando stack completo..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Inicializar modelos de IA
    echo "🤖 Inicializando modelos de IA..."
    sleep 60  # Esperar que Ollama esté listo
    ./scripts/init-models.sh
    
    # Verificar servicios
    echo "🔍 Verificando servicios..."
    sleep 30
    
    services=("frontend" "backend" "mcp-server" "ollama" "postgres" "redis" "n8n" "nginx")
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.production.yml ps | grep -q "$service.*Up"; then
            echo -e "${GREEN}✅ $service: Funcionando${NC}"
        else
            echo -e "${RED}❌ $service: Error${NC}"
        fi
    done
    
    echo -e "${GREEN}🎉 ¡Despliegue en Ubuntu completado!${NC}"
    echo ""
    echo "📋 Información del despliegue:"
    echo "🌐 Frontend: http://localhost (o tu dominio)"
    echo "🔧 API: http://localhost/api"
    echo "🤖 MCP: ws://localhost/mcp"
    echo "🔄 n8n: http://localhost/n8n"
    echo "📊 Logs: docker-compose -f docker-compose.production.yml logs -f"
}

deploy_local() {
    echo -e "${BLUE}💻 Desplegando localmente...${NC}"
    
    # Configurar .env local
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        sed -i 's/production/development/g' .env.local
    fi
    
    # Iniciar servicios de desarrollo
    docker-compose up -d postgres redis ollama
    
    # Esperar servicios
    sleep 20
    
    # Inicializar modelos
    ./scripts/init-models.sh
    
    # Iniciar backend
    cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    
    # Iniciar MCP server
    cd mcp-server && npm run dev &
    
    # Iniciar frontend
    npm run dev
    
    echo -e "${GREEN}✅ Entorno local iniciado${NC}"
}

# Ejecutar según el target
case $DEPLOY_TARGET in
    cloudflare)
        deploy_cloudflare
        ;;
    ubuntu)
        deploy_ubuntu
        ;;
    local)
        deploy_local
        ;;
    *)
        echo -e "${RED}❌ Target no válido: $DEPLOY_TARGET${NC}"
        echo "Usa: cloudflare, ubuntu, o local"
        exit 1
        ;;
esac

echo -e "${GREEN}🎯 Despliegue completado para: $DEPLOY_TARGET${NC}"