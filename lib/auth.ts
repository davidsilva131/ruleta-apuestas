import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

// Nueva función para obtener token desde cookies httpOnly
export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Primero intentar obtener desde cookies httpOnly (método seguro)
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback: Authorization header (para compatibilidad temporal)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

// Función para crear la configuración de cookie segura
export const getSecureCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,              // No accesible desde JavaScript
    secure: isProduction,        // Solo HTTPS en producción
    sameSite: 'strict' as const, // Protección CSRF
    maxAge: 7 * 24 * 60 * 60,   // 7 días en segundos
    path: '/',                   // Disponible en toda la app
  };
};
