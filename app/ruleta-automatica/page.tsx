'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginModal from '@/components/LoginModal';
import toast from 'react-hot-toast';
import { getAnimalEmoji, getAnimalName, formatCurrency } from '@/lib/utils';

interface AutomaticGame {
  id: string;
  scheduledFor: string;
  status: 'pending' | 'running' | 'completed';
  winningNumber?: number;
  totalBets: number;
  totalAmount: number;
  physicalBets: PhysicalBet[];
}

interface PhysicalBet {
  id: string;
  customerName: string;
  customerPhone?: string;
  chosenNumber: number;
  betAmount: number;
  ticketNumber: string;
  won: boolean;
  payout: number;
}

export default function AutomaticRoulette() {
  const { user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [games, setGames] = useState<AutomaticGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<AutomaticGame | null>(null);

  useEffect(() => {
    if (user) {
      fetchGames();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/automatic-games', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const gamesData = await response.json();
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Error al cargar los juegos');
    } finally {
      setLoading(false);
    }
  };

  const getNextGameTime = () => {
    const now = new Date();
    const nextGame = new Date(now);
    
    // Próximo juego cada hora en punto
    nextGame.setMinutes(0, 0, 0);
    nextGame.setHours(nextGame.getHours() + 1);
    
    return nextGame;
  };

  const formatTimeUntilGame = (gameTime: string) => {
    const now = new Date();
    const gameDate = new Date(gameTime);
    const diffMs = gameDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'En progreso';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  };

  // Mostrar loading mientras se autentica
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white text-xl mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            ⏰ RULETA AUTOMÁTICA
          </h1>
          <p className="text-lg text-gray-300">Juegos programados con apuestas físicas</p>
        </header>

        {!user ? (
          // Vista para usuarios no autenticados
          <div className="text-center py-16">
            <div className="text-8xl mb-6">⏰</div>
            <h2 className="text-3xl font-bold mb-4">¡Acceso Restringido!</h2>
            <p className="text-xl text-gray-300 mb-8">Inicia sesión para ver los juegos automáticos</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              🚀 Iniciar Sesión
            </button>
          </div>
        ) : user.isAdmin ? (
          // Vista para administradores
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👑</div>
            <h2 className="text-3xl font-bold mb-4 text-red-400">Panel de Administrador</h2>
            <p className="text-xl text-gray-300 mb-8">Para gestionar los juegos automáticos, usa el panel de administración</p>
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <a href="/admin" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                  ⚙️ Panel de Admin
                </a>
                <a href="/security" className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                  🛡️ Seguridad
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Vista para usuarios autenticados normales
          <div className="space-y-8">
            {/* Próximo juego */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-400">
                🎯 Próximo Juego Automático
              </h2>
              
              <div className="text-center">
                <div className="text-4xl font-mono text-yellow-400 mb-4">
                  {formatTimeUntilGame(getNextGameTime().toISOString())}
                </div>
                <p className="text-gray-300">
                  Programado para: <span className="text-white font-semibold">
                    {getNextGameTime().toLocaleString('es-ES')}
                  </span>
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">ℹ️ Información:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Los juegos se crean y ejecutan automáticamente cada hora</li>
                  <li>• Las apuestas son realizadas en el punto físico</li>
                  <li>• El sistema favorece a los números con menos apuestas</li>
                  <li>• Pago: 30:1 para aciertos</li>
                  <li>• Sistema completamente automatizado - Sin intervención manual</li>
                </ul>
              </div>
            </div>

            {/* Historial de juegos */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
                📋 Historial de Juegos
              </h2>

              {games.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-400">No hay juegos registrados aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => setSelectedGame(game)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">
                            Juego #{game.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(game.scheduledFor).toLocaleString('es-ES')}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            game.status === 'completed' ? 'bg-green-900 text-green-400' :
                            game.status === 'running' ? 'bg-yellow-900 text-yellow-400' :
                            'bg-blue-900 text-blue-400'
                          }`}>
                            {game.status === 'completed' ? 'Completado' :
                             game.status === 'running' ? 'En progreso' : 'Pendiente'}
                          </span>
                          
                          {game.winningNumber && (
                            <div className="mt-2 flex items-center justify-end space-x-2">
                              <span className="text-2xl">{getAnimalEmoji(game.winningNumber)}</span>
                              <span className="text-yellow-400 font-bold">#{game.winningNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-400">
                          Apuestas: {game.totalBets}
                        </span>
                        <span className="text-green-400 font-semibold">
                          Total: {formatCurrency(game.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}
