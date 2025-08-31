#!/bin/bash

# Script de despliegue para Ubuntu Server
# Desarrollado por Daniel López - Wramaba

set -e

echo "🚀 Iniciando despliegue de FELIPE en Ubuntu Server..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar requisitos
check_requirements() {
    log_info "Verificando requisitos del sistema..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        log_error "Git no está instalado"
        exit 1
    fi
    
    log_success "Todos los requisitos están instalados"
}

# Configurar variables de entorno
setup_environment() {
    log_info "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        log_warning "Archivo .env no encontrado, creando desde template..."
        cp .env.example .env
        
        # Generar secretos aleatorios
        JWT_SECRET=$(openssl rand -hex 32)
        POSTGRES_PASSWORD=$(openssl rand -hex 16)
        
        sed -i "s/your-jwt-secret-here/$JWT_SECRET/g" .env
        sed -i "s/your-postgres-password/$POSTGRES_PASSWORD/g" .env
        
        log_warning "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones de Supabase y Cloudflare"
        log_warning "⚠️  Presiona Enter cuando hayas configurado .env..."
        read
    fi
    
    source .env
    log_success "Variables de entorno configuradas"
}

# Descargar modelos de IA
setup_ai_models() {
    log_info "Configurando modelos de IA..."
    
    # Iniciar Ollama temporalmente para descargar modelos
    docker run -d --name ollama-temp -p 11434:11434 ollama/ollama:latest
    
    sleep 10
    
    log_info "Descargando CodeLlama 7B..."
    docker exec ollama-temp ollama pull codellama:7b
    
    log_info "Descargando DeepSeek Coder 6.7B..."
    docker exec ollama-temp ollama pull deepseek-coder:6.7b
    
    # Detener contenedor temporal
    docker stop ollama-temp
    docker rm ollama-temp
    
    log_success "Modelos de IA descargados"
}

# Construir y desplegar
deploy_services() {
    log_info "Construyendo y desplegando servicios..."
    
    # Detener servicios existentes
    docker-compose -f docker-compose.production.yml down
    
    # Construir imágenes
    log_info "Construyendo imágenes Docker..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Iniciar servicios
    log_info "Iniciando servicios..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Esperar a que los servicios estén listos
    log_info "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar estado de los servicios
    if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        log_success "Servicios desplegados correctamente"
    else
        log_error "Error en el despliegue de servicios"
        docker-compose -f docker-compose.production.yml logs
        exit 1
    fi
}

# Configurar Cloudflare
setup_cloudflare() {
    log_info "Configurando Cloudflare..."
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        log_warning "Token de Cloudflare no configurado. Configuración manual requerida."
        return
    fi
    
    # Aquí iría la configuración automática de Cloudflare
    # usando su API para DNS, SSL, etc.
    
    log_success "Cloudflare configurado (manual requerido)"
}

# Configurar SSL con Let's Encrypt
setup_ssl() {
    log_info "Configurando SSL con Let's Encrypt..."
    
    if [ -z "$DOMAIN" ]; then
        log_warning "Dominio no configurado, saltando SSL"
        return
    fi
    
    # Instalar certbot si no existe
    if ! command -v certbot &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtener certificado
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    log_success "SSL configurado para $DOMAIN"
}

# Configurar firewall
setup_firewall() {
    log_info "Configurando firewall..."
    
    # UFW básico
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Puertos necesarios
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Activar firewall
    sudo ufw --force enable
    
    log_success "Firewall configurado"
}

# Función principal
main() {
    log_info "🎯 Iniciando despliegue de FELIPE - Sistema Fiscal IA"
    log_info "👨‍💻 Desarrollado por Daniel López - Wramaba"
    
    check_requirements
    setup_environment
    setup_ai_models
    deploy_services
    setup_cloudflare
    setup_ssl
    setup_firewall
    
    log_success "🎉 ¡Despliegue completado exitosamente!"
    log_info "📱 Frontend: http://localhost (o tu dominio)"
    log_info "🔧 API: http://localhost/api"
    log_info "🤖 MCP: ws://localhost/mcp"
    log_info "🔄 n8n: http://localhost/n8n (admin/n8n-admin-2024)"
    log_info ""
    log_info "📋 Próximos pasos:"
    log_info "1. Configurar DNS en Cloudflare"
    log_info "2. Configurar Supabase en .env"
    log_info "3. Importar workflows de n8n"
    log_info "4. Configurar usuarios iniciales"
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi