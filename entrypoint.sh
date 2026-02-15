#!/bin/sh
set -e

echo "⏳ Esperando a que MongoDB esté listo..."

# Espera más inteligente con timeout
timeout=30
counter=0
until nc -z db 27017 2>/dev/null; do
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout esperando MongoDB"
        exit 1
    fi
    sleep 1
done

echo "✅ MongoDB está listo"

echo "🌱 Ejecutando seed de RBAC..."
npm run seed:rbac

echo "🚀 Iniciando aplicación en modo desarrollo..."
npm run dev