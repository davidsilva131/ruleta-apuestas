import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Verificar cookies
    const authCookie = req.cookies.get('auth-token');
    const allCookies = req.cookies.getAll();
    
    // Verificar headers
    const authHeader = req.headers.get('authorization');
    const userAgent = req.headers.get('user-agent');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      cookies: {
        authCookie: authCookie ? { 
          name: authCookie.name, 
          hasValue: !!authCookie.value,
          valueLength: authCookie.value?.length || 0
        } : null,
        totalCookies: allCookies.length,
        allCookieNames: allCookies.map(c => c.name)
      },
      headers: {
        authHeader: authHeader ? {
          hasValue: !!authHeader,
          startsWithBearer: authHeader.startsWith('Bearer ')
        } : null,
        userAgent: userAgent?.substring(0, 50) + '...'
      },
      security: {
        usingCookies: !!authCookie,
        usingHeaders: !!authHeader,
        preferredMethod: authCookie ? 'cookies' : authHeader ? 'headers' : 'none'
      }
    };
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Debug info retrieved'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    );
  }
}
