'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Roulette from '@/components/Roulette';
import BettingPanel from '@/components/BettingPanel';
import ResultsPanel from '@/components/ResultsPanel';
import StatsModal from '@/components/StatsModal';
import AudioManager from '@/components/AudioManager';
import LoginModal from '@/components/LoginModal';
import toast from 'react-hot-toast';

interface GameStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalWon: number;
  bestWin: number;
  currentStreak: number;
  bestStreak: number;
}

export default function Home() {
  const { user, loading: authLoading, updateBalance } = useAuth();
  const [chosenNumber, setChosenNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [animal, setAnimal] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Estadísticas del juego
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    totalWagered: 0,
    totalWon: 0,
    bestWin: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  // Removed automatic stats loading - now only loads when modal opens

  const fetchUserStats = async () => {
    if (!user || user.isAdmin) return;
    
    setLoadingStats(true);
    try {
      const response = await fetch('/api/user/stats', {
        credentials: 'include', // Usar cookies httpOnly
      });

      if (response.ok) {
        const userStats = await response.json();
        console.log('Stats fetched:', userStats);
        setStats(userStats);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
        // En caso de error, usar estadísticas vacías
        setStats({
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalWagered: 0,
          totalWon: 0,
          bestWin: 0,
          currentStreak: 0,
          bestStreak: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // En caso de error, usar estadísticas vacías
      setStats({
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalWagered: 0,
        totalWon: 0,
        bestWin: 0,
        currentStreak: 0,
        bestStreak: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const spin = async () => {
    if (!user) {
      setShowLoginModal(true);
      toast.error('Debes iniciar sesión para jugar');
      return;
    }

    if (user.isAdmin) {
      toast.error('Los administradores no pueden participar en los juegos');
      return;
    }

    if (!chosenNumber || betAmount <= 0) {
      toast.error('Debes elegir un número y una cantidad válida para apostar');
      return;
    }

    if (betAmount > user.balance) {
      toast.error('No tienes suficiente saldo');
      return;
    }

    setSpinning(true);
    setResult(null);
    setWinningNumber(null);
    setAnimal(null);

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Usar cookies httpOnly
        body: JSON.stringify({ 
          chosen: chosenNumber, 
          bet: betAmount 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Error en el juego');
        setSpinning(false);
        return;
      }

      const data = await res.json();
      
      // Simular tiempo de animación antes de mostrar resultado
      setTimeout(() => {
        setWinningNumber(data.winningNumber);
        setAnimal(data.animal);
        const isWin = data.win;
        setResult(isWin ? 'win' : 'lose');
        
        // Actualizar saldo del usuario
        updateBalance(data.newBalance);
        
        // Las estadísticas se actualizan automáticamente en el servidor
        // Solo las cargaremos cuando el usuario abra el modal
        
        // Mostrar mensaje de resultado
        if (isWin) {
          toast.success(`¡Ganaste $${data.payout}! 🎉`);
        } else {
          toast.error(`Perdiste $${betAmount} 😔`);
        }
        
        setSpinning(false);
      }, 4000); // 4 segundos de animación
      
    } catch (error) {
      console.error('Error spinning:', error);
      toast.error('Error de conexión');
      setSpinning(false);
    }
  };

  const resetGame = () => {
    setWinningNumber(null);
    setAnimal(null);
    setResult(null);
    setChosenNumber(null);
    setBetAmount(0);
  };

  const handleOpenStatsModal = () => {
    setShowStats(true);
    // Solo cargar estadísticas cuando se abre el modal
    fetchUserStats();
  };

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-900 dark:text-white text-xl mt-4">Cargando...</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Limpiar cache y recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors relative flex flex-col min-h-full">
      <div className="container mx-auto px-4 py-2 relative z-10 flex-1 flex flex-col max-w-7xl">
        {/* Header para usuarios autenticados normales */}
        {user && !user.isAdmin && (
          <div className="text-center mb-4 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-300 dark:border-gray-700">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎯 Ruleta Manual
            </h1>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">¡Elige tu número de la suerte del 1 al 30!</p>
            
            {/* Barra con saldo y estadísticas */}
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600">
                <span className="text-green-600 dark:text-green-400 text-lg font-bold">
                  Saldo: ${user.balance.toLocaleString()}
                </span>
              </div>
              <button
                onClick={handleOpenStatsModal}
                disabled={loadingStats}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 text-sm"
              >
                {loadingStats ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cargando...
                  </span>
                ) : (
                  '📊 Estadísticas'
                )}
              </button>
            </div>
          </div>
        )}

        {!user ? (
          // Vista para usuarios no autenticados
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
            <div className="text-8xl mb-6">🎰</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">¡Bienvenido al Casino!</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">Inicia sesión para comenzar a jugar</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Iniciar Sesión
            </button>
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-500/30 rounded-lg max-w-md mx-auto">
              <p className="text-green-700 dark:text-green-400">
                🎁 Al registrarte recibes <strong>$1,000 gratis</strong> para empezar a jugar
              </p>
            </div>
          </div>
        ) : user.isAdmin ? (
          // Vista para administradores (no pueden jugar)
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
            <div className="text-8xl mb-6">👑</div>
            <h2 className="text-3xl font-bold mb-4 text-red-600 dark:text-red-400">Panel de Administrador</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">Los administradores no pueden participar en los juegos</p>
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-400">Accede a las siguientes secciones:</p>
              <div className="flex justify-center space-x-4 flex-wrap gap-4">
                <a href="/admin" className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400">
                  ⚙️ Panel de Admin
                </a>
                <a href="/security" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-red-300">
                  🛡️ Seguridad
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Vista para usuarios autenticados normales
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start flex-1">
              {/* Panel de Apuestas */}
              <div className="lg:col-span-1 min-w-0">
                <BettingPanel
                  chosenNumber={chosenNumber}
                  setChosenNumber={setChosenNumber}
                  betAmount={betAmount}
                  setBetAmount={setBetAmount}
                  onSpin={spin}
                  spinning={spinning}
                  balance={user?.balance || 0}
                />
              </div>

              {/* Ruleta */}
              <div className="lg:col-span-1 flex justify-center items-start pt-20 min-w-0">
                <Roulette
                  spinning={spinning}
                  winningNumber={winningNumber}
                animal={animal}
              />
            </div>

            {/* Panel de Resultados */}
            <div className="lg:col-span-1 min-w-0">
              <ResultsPanel
                winningNumber={winningNumber}
                chosenNumber={chosenNumber}
                betAmount={betAmount}
                result={result}
                animal={animal}
                onReset={resetGame}
              />
            </div>
          </div>

            {/* Información adicional */}
            <footer className="text-center mt-4 text-gray-600 dark:text-gray-400 text-xs flex-shrink-0 py-2">
              <p>🍀 ¡Que la suerte esté de tu lado! • Juega responsablemente</p>
              <p className="mt-1">Probabilidad de ganar: 2% • Pago: 30:1</p>
            </footer>
          </div>
        )}
      </div>

      {/* Componentes modales y de audio */}
      {user && (
        <>
          <StatsModal
            isOpen={showStats}
            onClose={() => setShowStats(false)}
            stats={stats}
          />
          
          {/* AudioManager temporalmente deshabilitado */}
          {/* <AudioManager
            spinning={spinning}
            result={result}
          /> */}
        </>
      )}

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}