'use client'
import { useState, useEffect } from 'react';
import { formatCurrency, calculateWinRate } from '@/lib/utils';

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

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const winRate = calculateWinRate(stats.totalWins, stats.totalGames);
  const netProfit = stats.totalWon - stats.totalWagered;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-600 p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400">📊 Estadísticas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Juegos */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-400 mb-3">🎮 Juegos</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total:</p>
                <p className="text-white font-bold text-lg">{stats.totalGames}</p>
              </div>
              <div>
                <p className="text-gray-400">Tasa de victoria:</p>
                <p className="text-green-400 font-bold text-lg">{winRate}%</p>
              </div>
              <div>
                <p className="text-gray-400">Victorias:</p>
                <p className="text-green-400 font-bold">{stats.totalWins}</p>
              </div>
              <div>
                <p className="text-gray-400">Derrotas:</p>
                <p className="text-red-400 font-bold">{stats.totalLosses}</p>
              </div>
            </div>
          </div>

          {/* Dinero */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">💰 Dinero</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total apostado:</p>
                <p className="text-blue-400 font-bold">{formatCurrency(stats.totalWagered)}</p>
              </div>
              <div>
                <p className="text-gray-400">Total ganado:</p>
                <p className="text-green-400 font-bold">{formatCurrency(stats.totalWon)}</p>
              </div>
              <div>
                <p className="text-gray-400">Ganancia neta:</p>
                <p className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Mejor ganancia:</p>
                <p className="text-yellow-400 font-bold">{formatCurrency(stats.bestWin)}</p>
              </div>
            </div>
          </div>

          {/* Rachas */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">🔥 Rachas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Racha actual:</p>
                <p className={`font-bold text-lg ${stats.currentStreak >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Mejor racha:</p>
                <p className="text-yellow-400 font-bold text-lg">{stats.bestStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
