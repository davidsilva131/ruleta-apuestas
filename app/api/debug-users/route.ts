import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'debug-users-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Debugging user authentication...');
    
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      
      // Obtener todos los usuarios
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          password: true, // Temporalmente para debug
          balance: true,
          isAdmin: true,
          createdAt: true
        }
      });
      
      console.log('Found users:', users.length);
      
      // Si no hay usuarios, crear los usuarios por defecto
      if (users.length === 0) {
        console.log('No users found, creating default users...');
        
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
        
        // Crear estadísticas para ambos
        await prisma.gameStats.create({
          data: { userId: adminUser.id }
        });
        
        await prisma.gameStats.create({
          data: { userId: testUser.id }
        });
        
        console.log('Created users:', { admin: adminUser.id, test: testUser.id });
        
        // Obtener usuarios actualizados
        const updatedUsers = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            balance: true,
            isAdmin: true,
            createdAt: true
          }
        });
        
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          success: true,
          message: 'Users created successfully',
          users: updatedUsers.map(user => ({
            ...user,
            password: user.password.substring(0, 10) + '...' // Parcial para seguridad
          })),
          userCount: updatedUsers.length
        });
      }
      
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        success: true,
        message: 'Users found in database',
        users: users.map(user => ({
          ...user,
          password: user.password.substring(0, 10) + '...' // Parcial para seguridad
        })),
        userCount: users.length,
        credentials: {
          admin: 'admin@ruleta.com / admin123',
          test: 'test@test.com / test123'
        }
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Debug users error:', error);
    
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'User authentication debug endpoint',
    instructions: 'Use POST method with token to debug users',
    token: 'debug-users-2025'
  });
}
