import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-aqui';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
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

// GET - Obtener apuestas físicas para un juego
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'ID de juego requerido' }, { status: 400 });
    }

    const physicalBets = await prisma.physicalBet.findMany({
      where: {
        gameId: gameId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(physicalBets);
  } catch (error) {
    console.error('Error fetching physical bets:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nueva apuesta física
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { 
      gameId, 
      customerName, 
      customerPhone, 
      chosenNumber, 
      betAmount 
    } = await request.json();

    // Validaciones
    if (!gameId || !customerName || !chosenNumber || !betAmount) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    if (chosenNumber < 1 || chosenNumber > 30) {
      return NextResponse.json({ 
        error: 'Número debe estar entre 1 y 30' 
      }, { status: 400 });
    }

    if (betAmount <= 0) {
      return NextResponse.json({ 
        error: 'El monto debe ser mayor a 0' 
      }, { status: 400 });
    }

    // Verificar que el juego existe y está pendiente
    const game = await prisma.automaticGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
    }

    if (game.status !== 'pending') {
      return NextResponse.json({ 
        error: 'No se pueden agregar apuestas a un juego completado' 
      }, { status: 400 });
    }

    // Generar número de ticket único
    const ticketNumber = `T${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Crear la apuesta física
    const physicalBet = await prisma.physicalBet.create({
      data: {
        gameId,
        customerName,
        customerPhone: customerPhone || null,
        chosenNumber,
        betAmount,
        ticketNumber,
        won: false,
        payout: 0,
      },
    });

    return NextResponse.json(physicalBet, { status: 201 });
  } catch (error) {
    console.error('Error creating physical bet:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar apuesta física (solo si el juego no ha iniciado)
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const betId = searchParams.get('betId');

    if (!betId) {
      return NextResponse.json({ error: 'ID de apuesta requerido' }, { status: 400 });
    }

    // Obtener la apuesta y verificar el estado del juego
    const bet = await prisma.physicalBet.findUnique({
      where: { id: betId },
      include: {
        game: true,
      },
    });

    if (!bet) {
      return NextResponse.json({ error: 'Apuesta no encontrada' }, { status: 404 });
    }

    if (bet.game.status !== 'pending') {
      return NextResponse.json({ 
        error: 'No se puede eliminar apuesta de un juego completado' 
      }, { status: 400 });
    }

    await prisma.physicalBet.delete({
      where: { id: betId },
    });

    return NextResponse.json({ message: 'Apuesta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting physical bet:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
