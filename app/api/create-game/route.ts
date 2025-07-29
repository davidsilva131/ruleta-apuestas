import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getTokenFromRequest } from '@/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-aqui';

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

// POST - Crear nuevo juego automático (solo admin)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { scheduledFor } = await request.json();

    if (!scheduledFor) {
      return NextResponse.json({ 
        error: 'Fecha y hora del juego requerida' 
      }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledFor);
    const now = new Date();

    if (scheduledDate <= now) {
      return NextResponse.json({ 
        error: 'El juego debe programarse para una fecha futura' 
      }, { status: 400 });
    }

    // Verificar que no haya otro juego en la misma hora
    const existingGame = await prisma.automaticGame.findFirst({
      where: {
        scheduledFor: scheduledDate,
        status: 'pending',
      },
    });

    if (existingGame) {
      return NextResponse.json({ 
        error: 'Ya existe un juego programado para esa fecha y hora' 
      }, { status: 400 });
    }

    const newGame = await prisma.automaticGame.create({
      data: {
        scheduledFor: scheduledDate,
        status: 'pending',
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Error creating automatic game:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar juego automático
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { gameId, scheduledFor, status } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'ID de juego requerido' }, { status: 400 });
    }

    const game = await prisma.automaticGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
    }

    const updateData: any = {};

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();

      if (scheduledDate <= now) {
        return NextResponse.json({ 
          error: 'El juego debe programarse para una fecha futura' 
        }, { status: 400 });
      }

      updateData.scheduledFor = scheduledDate;
    }

    if (status) {
      if (!['pending', 'running', 'completed'].includes(status)) {
        return NextResponse.json({ 
          error: 'Estado no válido' 
        }, { status: 400 });
      }
      updateData.status = status;
    }

    const updatedGame = await prisma.automaticGame.update({
      where: { id: gameId },
      data: updateData,
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating automatic game:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar juego automático (solo si no tiene apuestas)
export async function DELETE(request: NextRequest) {
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

    // Verificar si el juego tiene apuestas
    const betsCount = await prisma.physicalBet.count({
      where: { gameId: gameId },
    });

    if (betsCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar un juego que ya tiene apuestas' 
      }, { status: 400 });
    }

    await prisma.automaticGame.delete({
      where: { id: gameId },
    });

    return NextResponse.json({ message: 'Juego eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting automatic game:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
