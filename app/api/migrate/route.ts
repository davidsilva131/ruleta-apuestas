import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'migrate-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Starting database migration...');
    
    // Verificar que Prisma esté disponible
    try {
      const { stdout: versionOutput } = await execAsync('npx prisma --version');
      console.log('Prisma version:', versionOutput);
    } catch (error) {
      console.error('Prisma not found:', error);
      return NextResponse.json({ 
        error: 'Prisma not available',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Generar la migración
    console.log('Generating migration...');
    try {
      const { stdout: migrateOutput, stderr: migrateError } = await execAsync(
        'npx prisma migrate dev --name init --skip-seed',
        { 
          env: { 
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL 
          },
          timeout: 60000 
        }
      );
      console.log('Migration output:', migrateOutput);
      if (migrateError) {
        console.log('Migration stderr:', migrateError);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      
      // Si falla la migración, intentar con db push
      console.log('Trying db push as fallback...');
      try {
        const { stdout: pushOutput, stderr: pushError } = await execAsync(
          'npx prisma db push --accept-data-loss',
          { 
            env: { 
              ...process.env,
              DATABASE_URL: process.env.DATABASE_URL 
            },
            timeout: 60000 
          }
        );
        console.log('Push output:', pushOutput);
        if (pushError) {
          console.log('Push stderr:', pushError);
        }
      } catch (pushErr) {
        console.error('Both migration and push failed:', pushErr);
        return NextResponse.json({ 
          error: 'Database schema creation failed',
          details: pushErr instanceof Error ? pushErr.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Verificar que las tablas se crearon
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      console.log('Connected to database');
      
      // Intentar contar usuarios para verificar que la tabla existe
      const userCount = await prisma.user.count();
      console.log('User count:', userCount);
      
      // Si llegamos aquí, la tabla existe. Crear usuarios por defecto si es necesario
      if (userCount === 0) {
        console.log('Creating default users...');
        
        // Crear usuario admin
        const adminUser = await prisma.user.upsert({
          where: { email: 'admin@ruleta.com' },
          update: {},
          create: {
            email: 'admin@ruleta.com',
            username: 'admin',
            password: 'admin123', // En producción deberías hashear esto
            isAdmin: true,
            balance: 10000
          }
        });
        
        // Crear usuario de prueba
        const testUser = await prisma.user.upsert({
          where: { email: 'test@test.com' },
          update: {},
          create: {
            email: 'test@test.com',
            username: 'testuser',
            password: 'test123',
            isAdmin: false,
            balance: 1000
          }
        });
        
        console.log('Created users:', { adminUser: adminUser.id, testUser: testUser.id });
      }
      
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        success: true,
        message: 'Database migrated successfully',
        userCount: userCount,
        tablesCreated: true
      });
      
    } catch (verifyError) {
      console.error('Verification failed:', verifyError);
      return NextResponse.json({ 
        error: 'Database verification failed',
        details: verifyError instanceof Error ? verifyError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method with token to run migration',
    token: 'migrate-2025'
  });
}
