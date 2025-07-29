import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      // Eliminar la sesión de la base de datos
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    // Crear respuesta
    const response = NextResponse.json({
      message: 'Logout exitoso'
    });

    // Limpiar la cookie httpOnly
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error during logout:', error);
    
    // Aunque haya error, limpiar la cookie
    const response = NextResponse.json({
      message: 'Logout completado'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
