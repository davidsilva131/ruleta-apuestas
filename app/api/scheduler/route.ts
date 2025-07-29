import { NextRequest, NextResponse } from 'next/server';
import { initializeScheduler, stopScheduler } from '@/lib/scheduler';

let schedulerRunning = false;

// POST - Iniciar scheduler automático (solo en desarrollo o por admin)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'start') {
      if (schedulerRunning) {
        return NextResponse.json({ 
          message: 'El programador ya está ejecutándose',
          status: 'running' 
        });
      }
      
      initializeScheduler();
      schedulerRunning = true;
      
      return NextResponse.json({ 
        message: 'Programador automático iniciado exitosamente',
        status: 'started' 
      });
    }
    
    if (action === 'stop') {
      if (!schedulerRunning) {
        return NextResponse.json({ 
          message: 'El programador no está ejecutándose',
          status: 'stopped' 
        });
      }
      
      stopScheduler();
      schedulerRunning = false;
      
      return NextResponse.json({ 
        message: 'Programador automático detenido',
        status: 'stopped' 
      });
    }
    
    return NextResponse.json({ 
      error: 'Acción no válida. Use "start" o "stop"' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error en scheduler API:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// GET - Obtener estado del scheduler
export async function GET() {
  return NextResponse.json({
    running: schedulerRunning,
    message: schedulerRunning ? 'Programador ejecutándose' : 'Programador detenido'
  });
}
