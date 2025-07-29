import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token !== 'push-schema-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Step 1: Pushing Prisma schema to database...');
    
    try {
      // Ejecutar prisma db push para crear las tablas
      const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
        env: { ...process.env, DATABASE_URL: 'file:/tmp/database.db' }
      });
      
      console.log('Prisma push stdout:', stdout);
      if (stderr) {
        console.log('Prisma push stderr:', stderr);
      }
    } catch (pushError) {
      console.log('Prisma push error (might be normal):', pushError);
    }

    console.log('Step 2: Creating initial users...');

    // Ahora crear usuarios
    const prisma = new PrismaClient();

    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-id-12345',
        email: 'admin@ruleta.com',
        username: 'admin',
        password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // admin123
        balance: 10000,
        isAdmin: true,
      }
    }).catch(error => {
      console.log('Admin user might already exist:', error.message);
      return null;
    });

    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id-67890',
        email: 'test@test.com',
        username: 'testuser',
        password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // admin123
        balance: 1000,
        isAdmin: false,
      }
    }).catch(error => {
      console.log('Test user might already exist:', error.message);
      return null;
    });

    // Verificar que todo funciona
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();

    return NextResponse.json({ 
      message: 'Database initialized successfully with Prisma push',
      userCount,
      adminCreated: adminUser ? 'Yes' : 'Already existed',
      testUserCreated: testUser ? 'Yes' : 'Already existed'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
