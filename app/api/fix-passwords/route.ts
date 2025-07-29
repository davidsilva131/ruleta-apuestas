import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'fix-passwords-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Fixing user passwords with proper hashing...');
    
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      
      // Obtener usuarios existentes
      const users = await prisma.user.findMany();
      console.log('Found users:', users.length);
      
      if (users.length === 0) {
        // Si no hay usuarios, crear usuarios con contraseñas hasheadas
        console.log('Creating users with hashed passwords...');
        
        const hashedAdminPassword = await hashPassword('admin123');
        const hashedTestPassword = await hashPassword('test123');
        
        const adminUser = await prisma.user.create({
          data: {
            email: 'admin@ruleta.com',
            username: 'admin',
            password: hashedAdminPassword,
            isAdmin: true,
            balance: 10000
          }
        });
        
        const testUser = await prisma.user.create({
          data: {
            email: 'test@test.com',
            username: 'testuser',
            password: hashedTestPassword,
            isAdmin: false,
            balance: 1000
          }
        });
        
        // Crear estadísticas para ambos usuarios
        await prisma.gameStats.create({
          data: { userId: adminUser.id }
        });
        
        await prisma.gameStats.create({
          data: { userId: testUser.id }
        });
        
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          success: true,
          message: 'Users created with properly hashed passwords',
          users: [
            { email: 'admin@ruleta.com', password: 'admin123 (hashed)' },
            { email: 'test@test.com', password: 'test123 (hashed)' }
          ],
          userCount: 2
        });
      } else {
        // Si hay usuarios, actualizar sus contraseñas
        console.log('Updating existing user passwords...');
        
        const updates = [];
        
        // Actualizar admin si existe
        const adminUser = users.find(u => u.email === 'admin@ruleta.com');
        if (adminUser) {
          const hashedPassword = await hashPassword('admin123');
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { password: hashedPassword }
          });
          updates.push('admin@ruleta.com');
        }
        
        // Actualizar test user si existe
        const testUser = users.find(u => u.email === 'test@test.com');
        if (testUser) {
          const hashedPassword = await hashPassword('test123');
          await prisma.user.update({
            where: { id: testUser.id },
            data: { password: hashedPassword }
          });
          updates.push('test@test.com');
        }
        
        // Si no existen los usuarios por defecto, crearlos
        if (!adminUser) {
          const hashedPassword = await hashPassword('admin123');
          const newAdmin = await prisma.user.create({
            data: {
              email: 'admin@ruleta.com',
              username: 'admin',
              password: hashedPassword,
              isAdmin: true,
              balance: 10000
            }
          });
          await prisma.gameStats.create({
            data: { userId: newAdmin.id }
          });
          updates.push('admin@ruleta.com (created)');
        }
        
        if (!testUser) {
          const hashedPassword = await hashPassword('test123');
          const newTest = await prisma.user.create({
            data: {
              email: 'test@test.com',
              username: 'testuser',
              password: hashedPassword,
              isAdmin: false,
              balance: 1000
            }
          });
          await prisma.gameStats.create({
            data: { userId: newTest.id }
          });
          updates.push('test@test.com (created)');
        }
        
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          success: true,
          message: 'Passwords updated with proper hashing',
          updated_users: updates,
          credentials: {
            admin: 'admin@ruleta.com / admin123',
            test: 'test@test.com / test123'
          }
        });
      }
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Fix passwords error:', error);
    
    return NextResponse.json({ 
      error: 'Password fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Password fix endpoint',
    instructions: 'Use POST method with token to fix user passwords',
    token: 'fix-passwords-2025'
  });
}
