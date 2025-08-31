#!/bin/bash

# Script para inicializar modelos de IA
# Desarrollado por Daniel López - Wramaba

echo "🤖 Inicializando modelos de IA para FELIPE..."

# Verificar que Ollama esté ejecutándose
check_ollama() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✅ Ollama está ejecutándose"
            return 0
        fi
        
        echo "⏳ Esperando Ollama... (intento $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    echo "❌ Error: Ollama no responde después de $max_attempts intentos"
    exit 1
}

# Descargar modelo si no existe
download_model() {
    local model=$1
    echo "📥 Verificando modelo: $model"
    
    if ollama list | grep -q "$model"; then
        echo "✅ Modelo $model ya está disponible"
    else
        echo "📥 Descargando modelo $model..."
        ollama pull "$model"
        echo "✅ Modelo $model descargado correctamente"
    fi
}

# Verificar funcionamiento del modelo
test_model() {
    local model=$1
    echo "🧪 Probando modelo: $model"
    
    local response=$(ollama run "$model" "Hola, ¿puedes ayudarme con una consulta legal?" --timeout 30)
    
    if [ $? -eq 0 ]; then
        echo "✅ Modelo $model funciona correctamente"
        echo "📝 Respuesta de prueba: ${response:0:100}..."
    else
        echo "❌ Error probando modelo $model"
        exit 1
    fi
}

# Función principal
main() {
    check_ollama
    
    echo "📋 Descargando modelos necesarios..."
    download_model "codellama:7b"
    download_model "deepseek-coder:6.7b"
    
    echo "🧪 Probando modelos..."
    test_model "codellama:7b"
    test_model "deepseek-coder:6.7b"
    
    echo "🎉 ¡Todos los modelos están listos!"
    echo ""
    echo "📊 Modelos disponibles:"
    ollama list
}

main "$@"