-- Script para inicializar la base de datos en producción
-- Ejecuta esto en el Query Editor de Neon si es necesario

-- Las tablas se crearán automáticamente con prisma db push
-- Pero aquí tienes algunos comandos útiles:

-- Verificar que las tablas existen:
-- \dt

-- Ver estructura de tabla User:
-- \d "User"

-- Consultar usuarios existentes:
-- SELECT * FROM "User" LIMIT 5;

-- Crear usuario admin inicial (opcional):
-- INSERT INTO "User" (id, email, username, password, balance, "isAdmin", "createdAt", "updatedAt") 
-- VALUES (
--   'clq1234567890abcdef',
--   'admin@ruleta.com',
--   'admin',
--   '$2b$12$ejemplo_hash_aqui',
--   1000.0,
--   true,
--   NOW(),
--   NOW()
-- );
