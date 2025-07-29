'use client';

import { useEffect } from 'react';

export default function SchedulerInitializer() {
  useEffect(() => {
    // Inicializar el scheduler automáticamente cuando la app carga
    const initScheduler = async () => {
      try {
        // Verificar si el scheduler ya está corriendo
        const statusResponse = await fetch('/api/scheduler');
        const status = await statusResponse.json();
        
        if (!status.running) {
          // Iniciar el scheduler si no está corriendo
          const startResponse = await fetch('/api/scheduler', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'start' }),
          });
          
          if (startResponse.ok) {
            const result = await startResponse.json();
            console.log('✅ Scheduler automático iniciado:', result.message);
          } else {
            console.error('❌ Error iniciando scheduler');
          }
        } else {
          console.log('✅ Scheduler ya está ejecutándose');
        }
      } catch (error) {
        console.error('❌ Error verificando/iniciando scheduler:', error);
      }
    };

    // Esperar un poco para que la app termine de cargar
    const timer = setTimeout(initScheduler, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // Este componente no renderiza nada
}
