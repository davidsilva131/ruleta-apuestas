import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getTokenFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-aqui';

// Función para calcular probabilidades
function calculateProbabilities(physicalBets: any[]) {
  // Contar apuestas por número
  const betCounts: { [key: number]: number } = {};
  for (let i = 1; i <= 30; i++) {
    betCounts[i] = 0;
  }
  
  physicalBets.forEach(bet => {
    betCounts[bet.chosenNumber]++;
  });
  
  // Encontrar el número con menos apuestas
  let minBets = Math.min(...Object.values(betCounts));
  const numbersWithMinBets = Object.keys(betCounts)
    .filter(num => betCounts[parseInt(num)] === minBets)
    .map(num => parseInt(num));
  
  // Crear array de probabilidades
  const probabilities: { [key: number]: number } = {};
  
  // Si hay números sin apuestas, darles 80% de probabilidad total
  if (minBets === 0) {
    const probabilityPerMinNumber = 0.8 / numbersWithMinBets.length;
    const probabilityPerOtherNumber = 0.2 / (30 - numbersWithMinBets.length);
    
    for (let i = 1; i <= 30; i++) {
      if (numbersWithMinBets.includes(i)) {
        probabilities[i] = probabilityPerMinNumber;
      } else {
        probabilities[i] = probabilityPerOtherNumber;
      }
    }
  } else {
    // Si todos los números tienen apuestas, dar mayor probabilidad a los que menos tienen
    const probabilityPerMinNumber = 0.8 / numbersWithMinBets.length;
    const probabilityPerOtherNumber = 0.2 / (30 - numbersWithMinBets.length);
    
    for (let i = 1; i <= 30; i++) {
      if (numbersWithMinBets.includes(i)) {
        probabilities[i] = probabilityPerMinNumber;
      } else {
        probabilities[i] = probabilityPerOtherNumber;
      }
    }
  }
  
  return probabilities;
}

// Función para seleccionar número ganador basado en probabilidades
function selectWinningNumber(probabilities: { [key: number]: number }): number {
  const random = Math.random();
  let accumulator = 0;
  
  for (let number = 1; number <= 30; number++) {
    accumulator += probabilities[number];
    if (random <= accumulator) {
      return number;
    }
  }
  
  // Por si acaso, devolver un número aleatorio
  return Math.floor(Math.random() * 30) + 1;
}

async function verifyToken(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Obtener juegos automáticos
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const games = await prisma.automaticGame.findMany({
      include: {
        physicalBets: true,
      },
      orderBy: {
        scheduledFor: 'desc',
      },
      take: 10, // Limitar a los últimos 10 juegos
    });

    // Agregar estadísticas calculadas
    const gamesWithStats = games.map(game => ({
      ...game,
      totalBets: game.physicalBets.length,
      totalAmount: game.physicalBets.reduce((sum, bet) => sum + bet.betAmount, 0),
    }));

    return NextResponse.json(gamesWithStats);
  } catch (error) {
    console.error('Error fetching automatic games:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Ejecutar juego automático (solo admin)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { gameId } = await request.json();

    // Obtener el juego y sus apuestas
    const game = await prisma.automaticGame.findUnique({
      where: { id: gameId },
      include: {
        physicalBets: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
    }

    if (game.status !== 'pending') {
      return NextResponse.json({ error: 'El juego ya fue ejecutado' }, { status: 400 });
    }

    // Calcular probabilidades
    const probabilities = calculateProbabilities(game.physicalBets);
    
    // Seleccionar número ganador
    const winningNumber = selectWinningNumber(probabilities);

    // Actualizar apuestas ganadoras
    await prisma.physicalBet.updateMany({
      where: {
        gameId: gameId,
        chosenNumber: winningNumber,
      },
      data: {
        won: true,
        payout: { multiply: 30 }, // Pago 30:1
      },
    });

    // Actualizar el juego
    const updatedGame = await prisma.automaticGame.update({
      where: { id: gameId },
      data: {
        status: 'completed',
        winningNumber: winningNumber,
        completedAt: new Date(),
      },
      include: {
        physicalBets: true,
      },
    });

    return NextResponse.json({
      game: updatedGame,
      winningNumber,
      probabilities,
      totalWinners: game.physicalBets.filter(bet => bet.chosenNumber === winningNumber).length,
    });
  } catch (error) {
    console.error('Error executing automatic game:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
