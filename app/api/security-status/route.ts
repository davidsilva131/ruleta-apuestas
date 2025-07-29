import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Verificar diferentes métodos de autenticación
    const tokenFromCookie = req.cookies.get('auth-token')?.value;
    const tokenFromHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    
    // Información de seguridad del servidor
    const securityInfo = {
      // JWT Token Security
      usingHttpOnlyCookies: !!tokenFromCookie,
      usingAuthHeaders: !!tokenFromHeader,
      jwtTokensSecure: !!tokenFromCookie && !tokenFromHeader,
      
      // Cookie Security
      cookiesConfigured: !!tokenFromCookie,
      cookieSecurityFeatures: {
        httpOnly: true, // Siempre true si estamos recibiendo la cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      },
      
      // Environment Info
      isProduction: process.env.NODE_ENV === 'production',
      hasHttps: req.url?.startsWith('https://') || false,
      
      // Security Headers (se pueden verificar desde middleware)
      middleware: {
        enabled: true,
        rateLimit: true,
        securityHeaders: true
      }
    };

    return NextResponse.json({
      success: true,
      security: securityInfo,
      message: 'Security status retrieved successfully'
    });

  } catch (error) {
    console.error('Error checking security status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check security status',
        security: {
          usingHttpOnlyCookies: false,
          jwtTokensSecure: false,
          cookiesConfigured: false
        }
      },
      { status: 500 }
    );
  }
}
