#!/bin/bash
# Script para configurar la base de datos en producción

echo "🔄 Setting up database for production..."

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables if they don't exist)
npx prisma db push

echo "✅ Database setup complete!"
