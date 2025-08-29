#!/bin/bash

# Script para configurar Cloudflare automáticamente
# Desarrollado por Daniel López - Wramaba

set -e

echo "🌐 Configurando Cloudflare para FELIPE..."

# Verificar variables requeridas
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$DOMAIN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN y DOMAIN son requeridos"
    echo "Configura estas variables en tu archivo .env"
    exit 1
fi

# Función para llamar API de Cloudflare
cf_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    curl -s -X $method \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        ${data:+-d "$data"} \
        "https://api.cloudflare.com/v4$endpoint"
}

# Obtener Zone ID
get_zone_id() {
    local domain=$1
    cf_api GET "/zones?name=$domain" | jq -r '.result[0].id'
}

# Configurar DNS records
setup_dns() {
    local zone_id=$1
    local domain=$2
    local server_ip=$3
    
    echo "📍 Configurando registros DNS..."
    
    # A record para dominio principal
    cf_api POST "/zones/$zone_id/dns_records" '{
        "type": "A",
        "name": "'$domain'",
        "content": "'$server_ip'",
        "ttl": 1,
        "proxied": true
    }'
    
    # CNAME para API
    cf_api POST "/zones/$zone_id/dns_records" '{
        "type": "CNAME",
        "name": "api.'$domain'",
        "content": "'$domain'",
        "ttl": 1,
        "proxied": true
    }'
    
    # CNAME para MCP
    cf_api POST "/zones/$zone_id/dns_records" '{
        "type": "CNAME",
        "name": "mcp.'$domain'",
        "content": "'$domain'",
        "ttl": 1,
        "proxied": true
    }'
}

# Configurar Page Rules
setup_page_rules() {
    local zone_id=$1
    local domain=$2
    
    echo "📋 Configurando Page Rules..."
    
    # Cache para assets estáticos
    cf_api POST "/zones/$zone_id/pagerules" '{
        "targets": [{"target": "url", "constraint": {"operator": "matches", "value": "'$domain'/static/*"}}],
        "actions": [
            {"id": "cache_level", "value": "cache_everything"},
            {"id": "edge_cache_ttl", "value": 31536000}
        ],
        "priority": 1,
        "status": "active"
    }'
    
    # Security para API
    cf_api POST "/zones/$zone_id/pagerules" '{
        "targets": [{"target": "url", "constraint": {"operator": "matches", "value": "'$domain'/api/*"}}],
        "actions": [
            {"id": "security_level", "value": "high"},
            {"id": "cache_level", "value": "bypass"}
        ],
        "priority": 2,
        "status": "active"
    }'
}

# Configurar WAF
setup_waf() {
    local zone_id=$1
    
    echo "🛡️ Configurando WAF..."
    
    # Regla para proteger endpoints de autenticación
    cf_api POST "/zones/$zone_id/firewall/rules" '{
        "filter": {
            "expression": "(http.request.uri.path contains \"/api/auth/\" and http.request.method eq \"POST\")",
            "paused": false
        },
        "action": "challenge",
        "priority": 1000,
        "description": "Protección endpoints de autenticación"
    }'
    
    # Regla para limitar acceso a n8n
    cf_api POST "/zones/$zone_id/firewall/rules" '{
        "filter": {
            "expression": "(http.request.uri.path contains \"/n8n/\" and not ip.src in {tu.ip.servidor})",
            "paused": false
        },
        "action": "block",
        "priority": 999,
        "description": "Bloquear acceso externo a n8n"
    }'
}

# Función principal
main() {
    source .env
    
    echo "🔍 Obteniendo información de zona..."
    ZONE_ID=$(get_zone_id $DOMAIN)
    
    if [ "$ZONE_ID" = "null" ] || [ -z "$ZONE_ID" ]; then
        echo "❌ Error: No se pudo obtener Zone ID para $DOMAIN"
        exit 1
    fi
    
    echo "✅ Zone ID obtenido: $ZONE_ID"
    
    # Obtener IP del servidor
    SERVER_IP=$(curl -s ifconfig.me)
    echo "📍 IP del servidor: $SERVER_IP"
    
    setup_dns $ZONE_ID $DOMAIN $SERVER_IP
    setup_page_rules $ZONE_ID $DOMAIN
    setup_waf $ZONE_ID
    
    echo "🎉 ¡Cloudflare configurado correctamente!"
    echo ""
    echo "📋 Configuración aplicada:"
    echo "🌐 Dominio: $DOMAIN"
    echo "📍 IP: $SERVER_IP"
    echo "🛡️ WAF: Activado"
    echo "⚡ CDN: Activado"
    echo "🔒 SSL: Automático"
}

main "$@"