import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, getSecureCookieConfig } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        balance: true,
        isAdmin: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Generar token
    const token = generateToken(user.id);

    // Crear sesión
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      }
    });

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    // Crear respuesta con cookie httpOnly
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      // NO enviamos el token en el response para mayor seguridad
    });

    // Configurar cookie httpOnly segura
    const cookieConfig = getSecureCookieConfig();
    response.cookies.set('auth-token', token, cookieConfig);

    return response;

  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
