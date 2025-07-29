import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token !== 'init-database-secret-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Pushing database schema...');
    
    // Ejecutar prisma db push para crear tablas
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset');
    
    console.log('Prisma stdout:', stdout);
    if (stderr) console.log('Prisma stderr:', stderr);

    return NextResponse.json({ 
      message: 'Database schema pushed successfully',
      output: stdout,
      error: stderr || null
    });

  } catch (error) {
    console.error('Database push error:', error);
    return NextResponse.json({ 
      error: 'Database push failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
