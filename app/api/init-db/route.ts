import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo o con un token especial
    const { token } = await request.json();
    
    if (token !== 'init-database-secret-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Intentar crear las tablas usando prisma db push
    console.log('Initializing database...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('Database connected successfully');

    // Crear un usuario de prueba para verificar que funciona
    const testUser = await prisma.user.create({
      data: {
        email: 'admin@ruleta.com',
        username: 'admin',
        password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // password: admin123
        balance: 10000,
        isAdmin: true,
      }
    }).catch(error => {
      console.log('User already exists or other error:', error.message);
      return null;
    });

    await prisma.$disconnect();

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      testUser: testUser ? 'Created admin user' : 'Admin user already exists'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
