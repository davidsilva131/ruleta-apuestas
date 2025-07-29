import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verificar el token JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Primero, verificar si el usuario tiene estadísticas existentes
    let userStats = await prisma.gameStats.findUnique({
      where: {
        userId: userId
      }
    });

    // Si no tiene estadísticas, calcular desde las apuestas
    if (!userStats) {
      // Obtener todas las apuestas del usuario
      const userBets = await prisma.bet.findMany({
        where: {
          userId: userId,
          won: { not: null } // Solo apuestas completadas
        },
        select: {
          id: true,
          betAmount: true,
          winningNumber: true,
          chosenNumber: true,
          payout: true,
          won: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Calcular estadísticas desde las apuestas
      let stats = {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalWagered: 0,
        totalWon: 0,
        bestWin: 0,
        currentStreak: 0,
        bestStreak: 0,
      };

      if (userBets.length > 0) {
        let currentStreakCount = 0;
        let maxStreak = 0;
        let lastResult: boolean | null = null;

        for (const bet of userBets) {
          stats.totalGames++;
          stats.totalWagered += bet.betAmount;

          if (bet.won) {
            stats.totalWins++;
            const totalReceived = bet.betAmount + (bet.payout || 0);
            stats.totalWon += totalReceived;
            
            // Actualizar mejor ganancia
            if ((bet.payout || 0) > stats.bestWin) {
              stats.bestWin = bet.payout || 0;
            }

            // Calcular racha
            if (lastResult === true) {
              currentStreakCount++;
            } else {
              currentStreakCount = 1;
            }
            lastResult = true;
          } else {
            stats.totalLosses++;
            
            // Calcular racha
            if (lastResult === false) {
              currentStreakCount--;
            } else {
              currentStreakCount = -1;
            }
            lastResult = false;
          }

          // Actualizar mejor racha
          if (Math.abs(currentStreakCount) > Math.abs(maxStreak)) {
            maxStreak = currentStreakCount;
          }
        }

        stats.currentStreak = currentStreakCount;
        stats.bestStreak = Math.max(maxStreak, 0); // Solo rachas positivas para "mejor racha"
      }

      return NextResponse.json(stats);
    } else {
      // Retornar estadísticas existentes
      return NextResponse.json({
        totalGames: userStats.totalGames,
        totalWins: userStats.totalWins,
        totalLosses: userStats.totalLosses,
        totalWagered: userStats.totalWagered,
        totalWon: userStats.totalWon,
        bestWin: userStats.bestWin,
        currentStreak: userStats.currentStreak,
        bestStreak: userStats.bestStreak,
      });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
