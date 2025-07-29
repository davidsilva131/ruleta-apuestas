import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const jwtSecret = process.env.JWT_SECRET;
    
    return NextResponse.json({
      databaseUrl: databaseUrl ? 'Set' : 'Not set',
      databaseUrlPrefix: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'None',
      jwtSecret: jwtSecret ? 'Set' : 'Not set',
      environment: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'local'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
