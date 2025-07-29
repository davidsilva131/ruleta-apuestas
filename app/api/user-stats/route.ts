import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { rateLimitMiddleware } from '@/lib/rateLimit';
import { sanitizeForLog, hashSensitiveData } from '@/lib/security';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('⚠️  WARNING: Using default JWT secret. Change JWT_SECRET in production!');
  return 'tu-clave-secreta-aqui';
})();

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

// GET - Obtener estadísticas del usuario
async function getUserStatsHandler(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      console.log('🔒 Unauthorized access attempt to user stats');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Log seguro (sin datos sensibles)
    console.log('📊 User stats requested:', sanitizeForLog({ userId: user.id, username: user.username }));

    // Obtener estadísticas de juego del usuario
    const gameStats = await prisma.gameStats.findUnique({
      where: { userId: user.id },
    });

    // Obtener apuestas del usuario
    const bets = await prisma.bet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20, // Últimas 20 apuestas
    });

    // Calcular estadísticas generales
    const totalBets = bets.length;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.betAmount, 0);
    const totalWon = bets.filter(bet => bet.won).length;
    const totalPayout = bets.reduce((sum, bet) => sum + bet.payout, 0);
    const winRate = totalBets > 0 ? (totalWon / totalBets * 100) : 0;
    const netProfit = totalPayout - totalWagered;

    // Obtener números más apostados
    const numberCounts: { [key: number]: number } = {};
    bets.forEach(bet => {
      numberCounts[bet.chosenNumber] = (numberCounts[bet.chosenNumber] || 0) + 1;
    });

    const favoriteNumbers = Object.entries(numberCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([number, count]) => ({
        number: parseInt(number),
        count,
      }));

    // Obtener racha actual
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | 'none' = 'none';
    
    for (let i = 0; i < Math.min(bets.length, 10); i++) {
      const bet = bets[i];
      if (bet.won !== null) {
        if (i === 0) {
          streakType = bet.won ? 'win' : 'loss';
          currentStreak = 1;
        } else {
          if ((bet.won && streakType === 'win') || (!bet.won && streakType === 'loss')) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }

    const stats = {
      user: {
        username: user.username,
        balance: user.balance,
        isAdmin: user.isAdmin,
        joinedDate: user.createdAt,
      },
      gameStats: {
        totalBets,
        totalWagered,
        totalWon,
        totalPayout,
        winRate: Math.round(winRate * 100) / 100,
        netProfit,
        currentStreak: {
          count: currentStreak,
          type: streakType,
        },
        favoriteNumbers,
      },
      recentBets: bets.map(bet => ({
        id: bet.id,
        chosenNumber: bet.chosenNumber,
        betAmount: bet.betAmount,
        winningNumber: bet.winningNumber,
        won: bet.won,
        payout: bet.payout,
        createdAt: bet.createdAt,
      })),
      recentGameStats: gameStats,
    };

    // Log hash de datos sensibles para auditoría
    console.log('📊 Stats delivered:', hashSensitiveData({ userId: user.id, statsHash: true }));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Error fetching user stats:', sanitizeForLog(error));
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Aplicar rate limiting
export const GET = rateLimitMiddleware(getUserStatsHandler);
