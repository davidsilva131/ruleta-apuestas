import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    
    // Contar usuarios
    const userCount = await prisma.user.count();
    
    // Verificar si hay algún admin
    const adminCount = await prisma.user.count({
      where: { isAdmin: true }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      users: userCount,
      admins: adminCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
