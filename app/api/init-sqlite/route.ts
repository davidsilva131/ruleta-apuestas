import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token !== 'init-sqlite-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Initializing SQLite database...');

    const prisma = new PrismaClient();

    // Crear usuario admin de prueba
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ruleta.com' },
      update: {},
      create: {
        id: 'admin-user-id-12345',
        email: 'admin@ruleta.com',
        username: 'admin',
        password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // admin123
        balance: 10000,
        isAdmin: true,
      }
    });

    // Crear usuario de prueba normal
    const testUser = await prisma.user.upsert({
      where: { email: 'test@test.com' },
      update: {},
      create: {
        id: 'test-user-id-12345',
        email: 'test@test.com',
        username: 'testuser',
        password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // admin123
        balance: 1000,
        isAdmin: false,
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({ 
      message: 'SQLite database initialized successfully',
      users: [
        { email: adminUser.email, isAdmin: adminUser.isAdmin },
        { email: testUser.email, isAdmin: testUser.isAdmin }
      ]
    });

  } catch (error) {
    console.error('SQLite initialization error:', error);
    return NextResponse.json({ 
      error: 'SQLite initialization failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
