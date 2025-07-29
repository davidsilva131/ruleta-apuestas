import { NextResponse } from 'next/server';

interface TableRow {
  table_name: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'direct-connect-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Testing direct PostgreSQL connection...');
    
    const databaseUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL exists:', !!databaseUrl);
    console.log('DATABASE_URL prefix:', databaseUrl?.substring(0, 30));
    
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'DATABASE_URL not found',
        available_vars: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEON'))
      }, { status: 500 });
    }

    // Intentar conexión directa usando pg
    try {
      const { Client } = require('pg');
      
      const client = new Client({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      console.log('Attempting to connect...');
      await client.connect();
      console.log('Connected successfully');
      
      // Probar consulta simple
      const result = await client.query('SELECT version()');
      console.log('Query result:', result.rows[0]);
      
      // Verificar si las tablas existen
      const tablesQuery = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tables = tablesQuery.rows.map((row: TableRow) => row.table_name);
      console.log('Existing tables:', tables);
      
      await client.end();
      
      return NextResponse.json({ 
        success: true,
        message: 'Direct PostgreSQL connection successful',
        database_version: result.rows[0].version,
        existing_tables: tables,
        tables_count: tables.length
      });
      
    } catch (pgError) {
      console.error('Direct connection failed:', pgError);
      
      // Si pg no está disponible, intentar con Prisma usando configuración manual
      try {
        console.log('Trying with manual Prisma configuration...');
        
        // Configurar Prisma manualmente
        process.env.DATABASE_URL = databaseUrl;
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: databaseUrl
            }
          }
        });
        
        await prisma.$connect();
        console.log('Prisma connected with manual config');
        
        // Intentar consulta simple
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('Prisma query result:', result);
        
        await prisma.$disconnect();
        
        return NextResponse.json({ 
          success: true,
          message: 'Prisma connection successful with manual config',
          query_result: result
        });
        
      } catch (prismaError) {
        console.error('Prisma also failed:', prismaError);
        
        return NextResponse.json({ 
          error: 'Both direct and Prisma connections failed',
          pg_error: pgError instanceof Error ? pgError.message : 'Unknown pg error',
          prisma_error: prismaError instanceof Error ? prismaError.message : 'Unknown prisma error',
          database_url_prefix: databaseUrl.substring(0, 30)
        }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error('Connection test error:', error);
    
    return NextResponse.json({ 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Direct PostgreSQL connection test endpoint',
    instructions: 'Use POST method with token to test connection',
    token: 'direct-connect-2025'
  });
}
