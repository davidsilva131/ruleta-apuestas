import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener usuario completo de la base de datos
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Los administradores no pueden jugar
    if (currentUser.isAdmin) {
      return NextResponse.json({ 
        error: 'Los administradores no pueden participar en los juegos' 
      }, { status: 403 });
    }

    const { chosen, bet } = await req.json();
    
    // Validaciones
    if (!chosen || chosen < 1 || chosen > 30) {
      return NextResponse.json(
        { error: 'Número inválido. Debe ser entre 1 y 30.' },
        { status: 400 }
      );
    }

    if (!bet || bet <= 0) {
      return NextResponse.json(
        { error: 'Apuesta inválida. Debe ser mayor a 0.' },
        { status: 400 }
      );
    }

    // Verificar saldo suficiente
    if (currentUser.balance < bet) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Lógica de probabilidad: 98% casa gana, 2% jugador gana
    let winningNumber: number;
    const roll = Math.random();
    
    if (roll < 0.02) { // 2% probabilidad de que el jugador acierte
      winningNumber = chosen;
    } else { // 98% probabilidad de que sea cualquier otro número
      do {
        winningNumber = Math.floor(Math.random() * 30) + 1;
      } while (winningNumber === chosen);
    }

    const win = winningNumber === chosen;
    const payout = win ? bet * 30 : 0; // Pago completo 30:1
    const newBalance = currentUser.balance - bet + payout;

    // Actualizar balance del usuario
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { balance: newBalance }
    });

    // Registrar la apuesta
    await prisma.bet.create({
      data: {
        userId: currentUser.id,
        gameType: 'manual',
        chosenNumber: chosen,
        betAmount: bet,
        winningNumber,
        won: win,
        payout: win ? payout - bet : 0, // Ganancia neta
      }
    });

    // Actualizar estadísticas
    const stats = await prisma.gameStats.findUnique({
      where: { userId: currentUser.id }
    });

    if (stats) {
      const newWins = win ? stats.totalWins + 1 : stats.totalWins;
      const newLosses = win ? stats.totalLosses : stats.totalLosses + 1;
      const newCurrentStreak = win ? 
        (stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1) :
        (stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1);
      
      await prisma.gameStats.update({
        where: { userId: currentUser.id },
        data: {
          totalGames: stats.totalGames + 1,
          totalWins: newWins,
          totalLosses: newLosses,
          totalWagered: stats.totalWagered + bet,
          totalWon: win ? stats.totalWon + payout : stats.totalWon,
          bestWin: win && (payout - bet) > stats.bestWin ? (payout - bet) : stats.bestWin,
          currentStreak: newCurrentStreak,
          bestStreak: Math.max(stats.bestStreak, newCurrentStreak),
        }
      });
    } else {
      // Crear estadísticas iniciales si no existen
      await prisma.gameStats.create({
        data: {
          userId: currentUser.id,
          totalGames: 1,
          totalWins: win ? 1 : 0,
          totalLosses: win ? 0 : 1,
          totalWagered: bet,
          totalWon: win ? payout : 0,
          bestWin: win ? (payout - bet) : 0,
          currentStreak: win ? 1 : -1,
          bestStreak: win ? 1 : 0,
        }
      });
    }

    // Generar placeholder del animal
    const animal = `https://placehold.co/150x150?text=Animal+${winningNumber}`;

    return NextResponse.json({ 
      winningNumber, 
      animal, 
      win,
      payout: win ? payout - bet : 0, // Ganancia neta
      newBalance,
      chosen,
      bet 
    });

  } catch (error) {
    console.error('Error in spin API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}