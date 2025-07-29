import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Headers de seguridad
  const response = NextResponse.next();
  
  // Prevenir ataques XSS
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP (Content Security Policy) - mejorada para mayor seguridad
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self';"
  );
  
  // Solo HTTPS en producción
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Headers adicionales de seguridad para cookies
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Prevenir ataques de clickjacking adicionales
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Log de requests a APIs sensibles (excluyendo información de cookies por seguridad)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // NO loguear cookies ni headers de autorización por seguridad
    console.log('🌐 API Request:', {
      path: request.nextUrl.pathname,
      method: request.method,
      ip: ip.substring(0, 8) + '***', // Partial IP for privacy
      userAgent: userAgent.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
      // Removido: headers de autorización y cookies por seguridad
    });
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
