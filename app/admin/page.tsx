'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAnimalEmoji, formatCurrency } from '@/lib/utils';

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
  createdAt: string;
}

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<AutomaticGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<AutomaticGame | null>(null);
  const [physicalBets, setPhysicalBets] = useState<PhysicalBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulerStatus, setSchedulerStatus] = useState<{running: boolean, message: string} | null>(null);
  
  // Form states
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showAddBet, setShowAddBet] = useState(false);
  const [newGameDate, setNewGameDate] = useState('');
  const [newBetForm, setNewBetForm] = useState({
    customerName: '',
    customerPhone: '',
    chosenNumber: 1,
    betAmount: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      if (!user.isAdmin) {
        toast.error('Acceso denegado: Solo administradores');
        router.push('/');
        return;
      }
      fetchGames();
      fetchSchedulerStatus();
    }
  }, [user, authLoading, router]);

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

  const fetchPhysicalBets = async (gameId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/physical-bets?gameId=${gameId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const betsData = await response.json();
        setPhysicalBets(betsData);
      }
    } catch (error) {
      console.error('Error fetching physical bets:', error);
      toast.error('Error al cargar las apuestas');
    }
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/scheduler');
      if (response.ok) {
        const status = await response.json();
        setSchedulerStatus(status);
      }
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    }
  };

  const toggleScheduler = async () => {
    try {
      const action = schedulerStatus?.running ? 'stop' : 'start';
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchSchedulerStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error controlando el scheduler');
      }
    } catch (error) {
      console.error('Error toggling scheduler:', error);
      toast.error('Error controlando el scheduler');
    }
  };

  const createGame = async () => {
    if (!newGameDate) {
      toast.error('Selecciona fecha y hora para el juego');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledFor: newGameDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Juego creado exitosamente');
        setShowCreateGame(false);
        setNewGameDate('');
        fetchGames();
      } else {
        toast.error(data.error || 'Error al crear el juego');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Error al crear el juego');
    }
  };

  const addPhysicalBet = async () => {
    if (!selectedGame || !newBetForm.customerName || !newBetForm.betAmount) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/physical-bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: selectedGame.id,
          ...newBetForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Apuesta agregada exitosamente');
        setShowAddBet(false);
        setNewBetForm({
          customerName: '',
          customerPhone: '',
          chosenNumber: 1,
          betAmount: 0,
        });
        fetchPhysicalBets(selectedGame.id);
        fetchGames(); // Refrescar para actualizar totales
      } else {
        toast.error(data.error || 'Error al agregar la apuesta');
      }
    } catch (error) {
      console.error('Error adding physical bet:', error);
      toast.error('Error al agregar la apuesta');
    }
  };

  const executeGame = async (gameId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/automatic-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`¡Juego ejecutado! Número ganador: ${data.winningNumber}`);
        fetchGames();
        if (selectedGame?.id === gameId) {
          fetchPhysicalBets(gameId);
        }
      } else {
        toast.error(data.error || 'Error al ejecutar el juego');
      }
    } catch (error) {
      console.error('Error executing game:', error);
      toast.error('Error al ejecutar el juego');
    }
  };

  const getBetCountForNumber = (number: number) => {
    return physicalBets.filter(bet => bet.chosenNumber === number).length;
  };

  const getBetAmountForNumber = (number: number) => {
    return physicalBets
      .filter(bet => bet.chosenNumber === number)
      .reduce((sum, bet) => sum + bet.betAmount, 0);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white text-xl mt-4">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-2">
            ⚙️ PANEL DE ADMINISTRACIÓN
          </h1>
          <p className="text-lg text-gray-300">Gestión de juegos automáticos y apuestas físicas</p>
        </header>

        {/* Panel de control del scheduler */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🤖 Sistema Automático</h3>
                <p className="text-gray-300">
                  {schedulerStatus?.running 
                    ? '✅ Los juegos se crean y ejecutan automáticamente cada hora' 
                    : '❌ Sistema automático desactivado - Requiere gestión manual'
                  }
                </p>
              </div>
              <button
                onClick={toggleScheduler}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                  schedulerStatus?.running
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {schedulerStatus?.running ? '🛑 Detener' : '▶️ Iniciar'} Automático
              </button>
            </div>
            {schedulerStatus && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong>Estado:</strong> {schedulerStatus.message}
                </p>
                {schedulerStatus.running && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>• Próximos juegos se crean automáticamente cada hora</p>
                    <p>• Los juegos se ejecutan automáticamente cuando llega su hora</p>
                    <p>• Limpieza automática de juegos antiguos</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo - Lista de juegos */}
          <div className="space-y-6">
            {/* Botón crear juego */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <button
                onClick={() => setShowCreateGame(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                ➕ Crear Nuevo Juego
              </button>
            </div>

            {/* Lista de juegos */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-400">
                📋 Juegos Automáticos
              </h2>

              {games.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-400">No hay juegos registrados</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className={`bg-gray-700/50 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                        selectedGame?.id === game.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => {
                        setSelectedGame(game);
                        fetchPhysicalBets(game.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
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
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Apuestas: {game.totalBets}
                        </span>
                        <span className="text-green-400 font-semibold">
                          Total: {formatCurrency(game.totalAmount)}
                        </span>
                      </div>

                      {game.winningNumber && (
                        <div className="mt-2 flex items-center justify-center space-x-2 bg-yellow-900/20 rounded-lg py-2">
                          <span className="text-2xl">{getAnimalEmoji(game.winningNumber)}</span>
                          <span className="text-yellow-400 font-bold">Ganador: #{game.winningNumber}</span>
                        </div>
                      )}

                      {game.status === 'pending' && game.totalBets > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            executeGame(game.id);
                          }}
                          className="w-full mt-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                        >
                          🎯 Ejecutar Juego
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Detalles del juego seleccionado */}
          <div className="space-y-6">
            {selectedGame ? (
              <>
                {/* Información del juego */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-center mb-4 text-purple-400">
                    🎮 Juego #{selectedGame.id.slice(-8)}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-900/20 rounded-lg p-3">
                      <p className="text-blue-400 font-semibold">Fecha</p>
                      <p className="text-white text-sm">
                        {new Date(selectedGame.scheduledFor).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="bg-green-900/20 rounded-lg p-3">
                      <p className="text-green-400 font-semibold">Total Apuestas</p>
                      <p className="text-white font-bold">{formatCurrency(selectedGame.totalAmount)}</p>
                    </div>
                  </div>

                  {selectedGame.status === 'pending' && (
                    <button
                      onClick={() => setShowAddBet(true)}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      ➕ Agregar Apuesta Física
                    </button>
                  )}
                </div>

                {/* Distribución de números */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-center mb-4 text-green-400">
                    📊 Distribución de Apuestas
                  </h3>
                  
                  <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((number) => {
                      const betCount = getBetCountForNumber(number);
                      const betAmount = getBetAmountForNumber(number);
                      const isWinner = selectedGame.winningNumber === number;
                      
                      return (
                        <div
                          key={number}
                          className={`
                            relative rounded-lg p-2 text-center border-2 text-xs
                            ${isWinner 
                              ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-500/20' 
                              : betCount === 0 
                              ? 'bg-green-900/30 border-green-500' 
                              : betCount <= 2
                              ? 'bg-yellow-900/30 border-yellow-500'
                              : 'bg-red-900/30 border-red-500'
                            }
                          `}
                        >
                          <div className="font-bold text-white">{number}</div>
                          <div className="text-xs">{getAnimalEmoji(number)}</div>
                          <div className="text-white">{betCount}</div>
                          <div className="text-green-400">${betAmount}</div>
                          
                          {isWinner && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lista de apuestas */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-center mb-4 text-pink-400">
                    🎫 Apuestas Físicas ({physicalBets.length})
                  </h3>
                  
                  {physicalBets.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No hay apuestas registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {physicalBets.map((bet) => (
                        <div
                          key={bet.id}
                          className={`bg-gray-700/50 rounded-lg p-3 border ${
                            bet.won ? 'border-green-500 bg-green-900/20' : 'border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{bet.customerName}</p>
                              <p className="text-xs text-gray-400">Ticket: {bet.ticketNumber}</p>
                              {bet.customerPhone && (
                                <p className="text-xs text-gray-400">{bet.customerPhone}</p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getAnimalEmoji(bet.chosenNumber)}</span>
                                <span className="text-white font-bold">#{bet.chosenNumber}</span>
                              </div>
                              <p className="text-green-400 font-semibold">
                                ${bet.betAmount}
                              </p>
                              {bet.won && (
                                <p className="text-yellow-400 font-bold">
                                  Paga: ${bet.payout}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-400">Selecciona un juego para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal crear juego */}
      {showCreateGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4 text-green-400">
              ➕ Crear Nuevo Juego
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Fecha y Hora del Juego
                </label>
                <input
                  type="datetime-local"
                  value={newGameDate}
                  onChange={(e) => setNewGameDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCreateGame(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createGame}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar apuesta */}
      {showAddBet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4 text-purple-400">
              🎫 Agregar Apuesta Física
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={newBetForm.customerName}
                  onChange={(e) => setNewBetForm({...newBetForm, customerName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  value={newBetForm.customerPhone}
                  onChange={(e) => setNewBetForm({...newBetForm, customerPhone: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="+56 9 1234 5678"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Número Elegido (1-30) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newBetForm.chosenNumber}
                  onChange={(e) => setNewBetForm({...newBetForm, chosenNumber: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Monto de la Apuesta *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newBetForm.betAmount}
                  onChange={(e) => setNewBetForm({...newBetForm, betAmount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1000"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAddBet(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addPhysicalBet}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
