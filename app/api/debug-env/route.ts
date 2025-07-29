import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener todas las variables de entorno relacionadas con la base de datos
    const allEnvVars = Object.keys(process.env)
      .filter(key => key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('NEON'))
      .reduce((obj, key) => {
        obj[key] = process.env[key]?.substring(0, 50) + '...';
        return obj;
      }, {} as Record<string, string>);
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      databaseUrl: process.env.DATABASE_URL ? {
        length: process.env.DATABASE_URL.length,
        prefix: process.env.DATABASE_URL.substring(0, 30),
        protocol: process.env.DATABASE_URL.split(':')[0]
      } : 'NOT_SET',
      allDatabaseVars: allEnvVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get environment info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
