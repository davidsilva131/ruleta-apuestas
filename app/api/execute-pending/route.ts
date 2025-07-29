import { NextRequest, NextResponse } from 'next/server';
import { executeScheduledGames } from '@/lib/scheduler';

// POST - Ejecutar inmediatamente todos los juegos pendientes
export async function POST() {
  try {
    console.log('🚀 Ejecutando juegos pendientes manualmente...');
    await executeScheduledGames();
    
    return NextResponse.json({ 
      message: 'Juegos pendientes ejecutados exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error ejecutando juegos pendientes:', error);
    return NextResponse.json({ 
      error: 'Error ejecutando juegos pendientes' 
    }, { status: 500 });
  }
}

// GET - Verificar estado de juegos pendientes
export async function GET() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const now = new Date();
    const pendingGames = await prisma.automaticGame.findMany({
      where: {
        status: 'pending',
      },
      include: {
        physicalBets: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
    
    interface PhysicalBet {
      // Add more fields as needed
      id: string;
      // ...other fields
    }

    interface AutomaticGame {
      id: string;
      scheduledFor: string | Date;
      status: string;
      physicalBets: PhysicalBet[];
    }

    const overdue: AutomaticGame[] = pendingGames.filter((game: AutomaticGame) => 
      new Date(game.scheduledFor) <= now
    );
    
    const upcoming: AutomaticGame[] = pendingGames.filter((game: AutomaticGame) => 
      new Date(game.scheduledFor) > now
    );
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      total: pendingGames.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      overdueGames: overdue.map(game => ({
        id: game.id.slice(-8),
        scheduledFor: game.scheduledFor,
        bets: game.physicalBets.length,
        minutesOverdue: Math.floor((now.getTime() - new Date(game.scheduledFor).getTime()) / (1000 * 60))
      })),
      upcomingGames: upcoming.map(game => ({
        id: game.id.slice(-8),
        scheduledFor: game.scheduledFor,
        bets: game.physicalBets.length,
        minutesUntil: Math.floor((new Date(game.scheduledFor).getTime() - now.getTime()) / (1000 * 60))
      }))
    });
    
  } catch (error) {
    console.error('Error obteniendo estado de juegos:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
