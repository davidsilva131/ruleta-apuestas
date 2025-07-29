// Servicio de programación automática para juegos de ruleta
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para calcular probabilidades (copiada del API)
function calculateProbabilities(physicalBets: any[]) {
  const betCounts: { [key: number]: number } = {};
  for (let i = 1; i <= 30; i++) {
    betCounts[i] = 0;
  }
  
  physicalBets.forEach(bet => {
    betCounts[bet.chosenNumber]++;
  });
  
  let minBets = Math.min(...Object.values(betCounts));
  const numbersWithMinBets = Object.keys(betCounts)
    .filter(num => betCounts[parseInt(num)] === minBets)
    .map(num => parseInt(num));
  
  const probabilities: { [key: number]: number } = {};
  
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

// Función para seleccionar número ganador
function selectWinningNumber(probabilities: { [key: number]: number }): number {
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 1; i <= 30; i++) {
    cumulative += probabilities[i];
    if (random <= cumulative) {
      return i;
    }
  }
  
  return Math.floor(Math.random() * 30) + 1;
}

// Función para crear un nuevo juego automático
export async function createAutomaticGame() {
  try {
    const now = new Date();
    const nextHour = new Date(now);
    
    // Si ya pasamos del minuto 0, programar para la próxima hora
    if (now.getMinutes() > 0) {
      nextHour.setHours(nextHour.getHours() + 1);
    }
    nextHour.setMinutes(0, 0, 0);

    // Verificar si ya existe un juego para esa hora
    const existingGame = await prisma.automaticGame.findFirst({
      where: {
        scheduledFor: nextHour,
        status: 'pending',
      },
    });

    if (existingGame) {
      console.log(`Juego ya existe para ${nextHour.toLocaleString('es-ES')}`);
      return existingGame;
    }

    const newGame = await prisma.automaticGame.create({
      data: {
        scheduledFor: nextHour,
        status: 'pending',
      },
    });

    console.log(`✅ Juego automático creado para ${nextHour.toLocaleString('es-ES')}`);
    return newGame;
  } catch (error) {
    console.error('❌ Error creando juego automático:', error);
    throw error;
  }
}

// Función para ejecutar juegos pendientes
export async function executeScheduledGames() {
  try {
    const now = new Date();
    
    // Buscar juegos que ya deberían haberse ejecutado (hora programada ya pasó)
    const gamesToExecute = await prisma.automaticGame.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: now, // Ejecutar todos los juegos cuya hora ya pasó
        },
      },
      include: {
        physicalBets: true,
      },
    });

    for (const game of gamesToExecute) {
      try {
        console.log(`🎯 Ejecutando juego ${game.id.slice(-8)} programado para ${game.scheduledFor.toLocaleString('es-ES')}`);
        console.log(`📊 Apuestas totales: ${game.physicalBets.length}`);
        
        // Calcular probabilidades (la casa siempre debe ganar)
        const probabilities = calculateProbabilities(game.physicalBets);
        
        // Seleccionar número ganador
        const winningNumber = selectWinningNumber(probabilities);
        
        console.log(`🎲 Número ganador seleccionado: ${winningNumber}`);
        
        // Actualizar apuestas ganadoras si las hay
        if (game.physicalBets.length > 0) {
          await prisma.physicalBet.updateMany({
            where: {
              gameId: game.id,
              chosenNumber: winningNumber,
            },
            data: {
              won: true,
              payout: { multiply: 30 },
            },
          });
        }

        // Actualizar el juego
        await prisma.automaticGame.update({
          where: { id: game.id },
          data: {
            status: 'completed',
            winningNumber: winningNumber,
            completedAt: now,
          },
        });

        console.log(`✅ Juego ${game.id.slice(-8)} completado. Número ganador: ${winningNumber}`);
        
        // Mostrar estadísticas de ganadores
        const winners = game.physicalBets.filter(bet => bet.chosenNumber === winningNumber);
        console.log(`🏆 Ganadores: ${winners.length} de ${game.physicalBets.length} apostadores`);
        
      } catch (error) {
        console.error(`❌ Error ejecutando juego ${game.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error ejecutando juegos programados:', error);
  }
}

// Función para limpiar juegos antiguos
export async function cleanupOldGames() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await prisma.automaticGame.deleteMany({
      where: {
        completedAt: {
          lt: thirtyDaysAgo,
        },
        status: 'completed',
      },
    });

    if (deletedCount.count > 0) {
      console.log(`🧹 Limpieza: ${deletedCount.count} juegos antiguos eliminados`);
    }
  } catch (error) {
    console.error('❌ Error en limpieza de juegos:', error);
  }
}

// Función para inicializar el programador
export function initializeScheduler() {
  console.log('🚀 Iniciando programador automático de ruleta...');

  // Crear juego cada hora en punto (ej: 10:00, 11:00, 12:00)
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Creando nuevo juego automático...');
    await createAutomaticGame();
  }, {
    timezone: "America/Bogota" // Ajusta según tu zona horaria
  });

  // Ejecutar juegos cada minuto para asegurar ejecución inmediata
  cron.schedule('* * * * *', async () => {
    await executeScheduledGames();
  });

  // Limpieza de juegos antiguos cada día a las 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Iniciando limpieza de juegos antiguos...');
    await cleanupOldGames();
  }, {
    timezone: "America/Bogota"
  });

  // Crear el primer juego si no existe uno próximo
  setTimeout(async () => {
    try {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0, 0, 0);

      const existingGame = await prisma.automaticGame.findFirst({
        where: {
          scheduledFor: {
            gte: now,
          },
          status: 'pending',
        },
      });

      if (!existingGame) {
        console.log('🎮 Creando juego inicial...');
        await createAutomaticGame();
      }
      
      // También ejecutar juegos pendientes al iniciar
      console.log('🔍 Verificando juegos pendientes al iniciar...');
      await executeScheduledGames();
      
    } catch (error) {
      console.error('❌ Error creando juego inicial:', error);
    }
  }, 2000);

  console.log('✅ Programador automático iniciado exitosamente');
  console.log('📅 Próximos juegos se crearán automáticamente cada hora en punto');
  console.log('🎯 Los juegos se ejecutarán automáticamente en su hora programada');
}

// Función para detener el programador
export function stopScheduler() {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log('🛑 Programador automático detenido');
}
