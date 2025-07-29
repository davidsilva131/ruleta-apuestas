// Script para probar el sistema automático de ruleta
// Ejecutar con: node scripts/test-scheduler.js

const baseUrl = 'http://localhost:3000'; // Cambiar si tu app corre en otro puerto

async function testScheduler() {
  console.log('🧪 Probando sistema automático de ruleta...\n');

  try {
    // 1. Verificar estado del scheduler
    console.log('1. Verificando estado del scheduler...');
    const statusResponse = await fetch(`${baseUrl}/api/scheduler`);
    const status = await statusResponse.json();
    console.log(`   Estado: ${status.running ? '✅ Ejecutándose' : '❌ Detenido'}`);
    console.log(`   Mensaje: ${status.message}\n`);

    // 2. Si no está ejecutándose, iniciarlo
    if (!status.running) {
      console.log('2. Iniciando scheduler...');
      const startResponse = await fetch(`${baseUrl}/api/scheduler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (startResponse.ok) {
        const result = await startResponse.json();
        console.log(`   ✅ ${result.message}\n`);
      } else {
        console.log('   ❌ Error iniciando scheduler\n');
      }
    }

    // 3. Verificar juegos automáticos
    console.log('3. Verificando juegos automáticos...');
    const gamesResponse = await fetch(`${baseUrl}/api/automatic-games`);
    
    if (gamesResponse.status === 401) {
      console.log('   ⚠️  Se requiere autenticación para ver los juegos');
      console.log('   💡 Inicia sesión en la aplicación primero\n');
      return;
    }
    
    if (gamesResponse.ok) {
      const games = await gamesResponse.json();
      console.log(`   📊 Se encontraron ${games.length} juegos`);
      
      const pendingGames = games.filter(g => g.status === 'pending');
      const completedGames = games.filter(g => g.status === 'completed');
      
      console.log(`   ⏳ Juegos pendientes: ${pendingGames.length}`);
      console.log(`   ✅ Juegos completados: ${completedGames.length}`);
      
      if (pendingGames.length > 0) {
        const nextGame = pendingGames[0];
        const gameTime = new Date(nextGame.scheduledFor);
        console.log(`   🎯 Próximo juego: ${gameTime.toLocaleString('es-ES')}`);
        console.log(`   💰 Apuestas actuales: ${nextGame.totalBets} (Total: $${nextGame.totalAmount})`);
      }
    } else {
      console.log('   ❌ Error obteniendo juegos automáticos');
    }

    console.log('\n✅ Prueba completada!');
    console.log('\n📋 Resumen del sistema automático:');
    console.log('   • Los juegos se crean automáticamente cada hora a los :05');
    console.log('   • Los juegos se ejecutan automáticamente cada 5 minutos');
    console.log('   • Los juegos se ejecutan inmediatamente si tienen apuestas');
    console.log('   • Los juegos sin apuestas se ejecutan 10 minutos después de su hora');
    console.log('   • Limpieza automática de juegos antiguos cada día a las 3 AM');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.log('\n💡 Asegúrate de que la aplicación esté ejecutándose en', baseUrl);
  }
}

// Ejecutar la prueba
testScheduler();
