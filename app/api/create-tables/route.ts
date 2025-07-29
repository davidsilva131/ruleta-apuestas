import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token !== 'create-tables-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating database tables...');

    // Crear cliente Prisma
    const prisma = new PrismaClient();

    // Ejecutar queries directamente para crear las tablas
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 0,
        "isAdmin" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "GameStats" (
        id TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL,
        "totalGames" INTEGER DEFAULT 0,
        "totalWins" INTEGER DEFAULT 0,
        "totalLosses" INTEGER DEFAULT 0,
        "totalWagered" REAL DEFAULT 0,
        "totalWon" REAL DEFAULT 0,
        "bestWin" REAL DEFAULT 0,
        "currentStreak" INTEGER DEFAULT 0,
        "bestStreak" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Bet" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "chosenNumber" INTEGER NOT NULL,
        "betAmount" REAL NOT NULL,
        "winningNumber" INTEGER,
        payout REAL,
        won BOOLEAN,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PhysicalBet" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "gameId" TEXT NOT NULL,
        "chosenNumber" INTEGER NOT NULL,
        "betAmount" REAL NOT NULL,
        "winningNumber" INTEGER,
        payout REAL,
        won BOOLEAN,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      )
    `;

    // Crear usuario admin si no existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ruleta.com' }
    }).catch(() => null);

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          id: 'cm0admin123456789',
          email: 'admin@ruleta.com',
          username: 'admin',
          password: '$2b$12$LQv3c1yqBwEHcpYxHKUzKuxlXz3VXFyX7dF3J7QKmxJa8Mq7xVZfG', // admin123
          balance: 10000,
          isAdmin: true,
        }
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({ 
      message: 'Database tables created successfully',
      admin: existingAdmin ? 'Admin already exists' : 'Admin user created'
    });

  } catch (error) {
    console.error('Database creation error:', error);
    return NextResponse.json({ 
      error: 'Database creation failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
