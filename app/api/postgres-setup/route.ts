import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'postgres-setup-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Starting PostgreSQL setup...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL database');
      
      // Verificar si las tablas existen, y si no, las crea automáticamente
      try {
        const userCount = await prisma.user.count();
        console.log('Tables exist, current user count:', userCount);
        
        // Si no hay usuarios, crear usuarios por defecto
        if (userCount === 0) {
          console.log('Creating default users...');
          
          const adminUser = await prisma.user.create({
            data: {
              email: 'admin@ruleta.com',
              username: 'admin',
              password: 'admin123',
              isAdmin: true,
              balance: 10000
            }
          });
          
          const testUser = await prisma.user.create({
            data: {
              email: 'test@test.com',
              username: 'testuser',
              password: 'test123',
              isAdmin: false,
              balance: 1000
            }
          });
          
          // Crear estadísticas iniciales para ambos usuarios
          await prisma.gameStats.create({
            data: {
              userId: adminUser.id
            }
          });
          
          await prisma.gameStats.create({
            data: {
              userId: testUser.id
            }
          });
          
          console.log('Created default users:', { 
            admin: adminUser.id, 
            test: testUser.id 
          });
        }
        
        // Verificación final
        const finalUserCount = await prisma.user.count();
        const statsCount = await prisma.gameStats.count();
        const sessionCount = await prisma.session.count();
        
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          success: true,
          message: 'PostgreSQL database setup completed',
          userCount: finalUserCount,
          statsCount: statsCount,
          sessionCount: sessionCount,
          database: 'PostgreSQL'
        });
        
      } catch (tableError) {
        console.error('Table access error:', tableError);
        
        // Si las tablas no existen, significa que necesitamos hacer la migración
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          error: 'Database tables do not exist',
          message: 'You need to run database migration first',
          details: tableError instanceof Error ? tableError.message : 'Unknown error',
          suggestion: 'Use Prisma migration or create tables manually'
        }, { status: 500 });
      }
      
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('PostgreSQL setup error:', error);
    
    return NextResponse.json({ 
      error: 'PostgreSQL setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'PostgreSQL database setup endpoint',
    instructions: 'Use POST method with token to setup database',
    token: 'postgres-setup-2025'
  });
}
