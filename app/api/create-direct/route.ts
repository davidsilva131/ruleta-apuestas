import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== 'create-tables-2025') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('Starting direct table creation...');
    
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('Connected to database');
      
      // Crear las tablas usando SQL directo
      console.log('Creating User table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "balance" REAL NOT NULL DEFAULT 1000,
          "isAdmin" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      console.log('Creating Session table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Session" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "token" TEXT NOT NULL UNIQUE,
          "expiresAt" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      console.log('Creating GameStats table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "GameStats" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "totalBets" INTEGER NOT NULL DEFAULT 0,
          "totalWins" INTEGER NOT NULL DEFAULT 0,
          "totalLosses" INTEGER NOT NULL DEFAULT 0,
          "totalAmountBet" REAL NOT NULL DEFAULT 0,
          "totalAmountWon" REAL NOT NULL DEFAULT 0,
          "biggestWin" REAL NOT NULL DEFAULT 0,
          "currentStreak" INTEGER NOT NULL DEFAULT 0,
          "longestWinStreak" INTEGER NOT NULL DEFAULT 0,
          "longestLoseStreak" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      console.log('Creating Bet table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Bet" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "amount" REAL NOT NULL,
          "type" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "result" TEXT,
          "winAmount" REAL,
          "isWin" BOOLEAN,
          "gameId" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      console.log('Creating PhysicalBet table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "PhysicalBet" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "betId" TEXT NOT NULL,
          "amount" REAL NOT NULL,
          "type" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "position" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("betId") REFERENCES "Bet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      console.log('Tables created successfully');
      
      // Verificar que las tablas se crearon
      const userCount = await prisma.user.count();
      console.log('Current user count:', userCount);
      
      // Crear usuarios por defecto si no existen
      if (userCount === 0) {
        console.log('Creating default users...');
        
        const adminUser = await prisma.user.create({
          data: {
            id: 'admin-user-id',
            email: 'admin@ruleta.com',
            username: 'admin',
            password: 'admin123',
            isAdmin: true,
            balance: 10000
          }
        });
        
        const testUser = await prisma.user.create({
          data: {
            id: 'test-user-id',
            email: 'test@test.com',
            username: 'testuser',
            password: 'test123',
            isAdmin: false,
            balance: 1000
          }
        });
        
        // Crear estadísticas iniciales para ambos usuarios
        await prisma.gameStats.create({
          data: {
            id: 'admin-stats-id',
            userId: adminUser.id
          }
        });
        
        await prisma.gameStats.create({
          data: {
            id: 'test-stats-id',
            userId: testUser.id
          }
        });
        
        console.log('Created default users and stats');
      }
      
      // Verificación final
      const finalUserCount = await prisma.user.count();
      const statsCount = await prisma.gameStats.count();
      
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        success: true,
        message: 'Database tables created successfully',
        userCount: finalUserCount,
        statsCount: statsCount,
        tables: ['User', 'Session', 'GameStats', 'Bet', 'PhysicalBet']
      });
      
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      await prisma.$disconnect();
      
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Table creation error:', error);
    
    return NextResponse.json({ 
      error: 'Table creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST method with token to create tables',
    token: 'create-tables-2025'
  });
}
