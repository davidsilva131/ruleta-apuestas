#!/bin/bash

# Script de inicialización para el sistema automático de ruleta
# Uso: ./scripts/init-scheduler.sh

echo "🚀 Inicializando sistema automático de ruleta..."

# Verificar que la aplicación esté ejecutándose
if ! curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "❌ Error: La aplicación no está ejecutándose en localhost:3000"
    echo "💡 Inicia la aplicación primero con: npm run dev o npm start"
    exit 1
fi

echo "✅ Aplicación detectada"

# Iniciar el scheduler automático
echo "🤖 Iniciando scheduler automático..."
curl -X POST \
  http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}' \
  2>/dev/null | grep -o '"message":"[^"]*"' | cut -d'"' -f4

echo "✅ Sistema automático inicializado"
echo ""
echo "📋 El sistema ahora:"
echo "   • Creará juegos automáticamente cada hora"
echo "   • Ejecutará juegos automáticamente según programación"
echo "   • Realizará limpieza automática de datos antiguos"
echo ""
echo "🎮 ¡El sistema de ruleta automática está listo!"
