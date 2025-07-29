'use client'
import { useState } from 'react';

interface BettingPanelProps {
  chosenNumber: number | null;
  setChosenNumber: (num: number | null) => void;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  onSpin: () => void;
  spinning: boolean;
  balance: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  chosenNumber,
  setChosenNumber,
  betAmount,
  setBetAmount,
  onSpin,
  spinning,
  balance
}) => {
  const [quickBetAmount, setQuickBetAmount] = useState<number>(10);

  // Números de la ruleta organizados en grid
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);
  
  // Apuestas rápidas
  const quickBets = [10, 25, 50, 100, 250];

  const handleNumberSelect = (num: number) => {
    if (!spinning) {
      setChosenNumber(chosenNumber === num ? null : num);
    }
  };

  const handleQuickBet = (amount: number) => {
    if (!spinning && amount <= balance) {
      setBetAmount(amount);
      setQuickBetAmount(amount);
    }
  };

  const handleMaxBet = () => {
    if (!spinning) {
      setBetAmount(balance);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 shadow-2xl">
      <h2 className="text-xl font-bold text-center mb-4 text-yellow-400">
        💰 Panel de Apuestas
      </h2>

      {/* Selección de número */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 text-center">Elige tu número de la suerte</h3>
        <div className="grid grid-cols-6 gap-1.5">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberSelect(num)}
              disabled={spinning}
              className={`
                h-8 rounded-md font-bold text-sm transition-all duration-200 border-2 transform-gpu will-change-transform
                ${chosenNumber === num 
                  ? 'bg-yellow-500 text-black border-yellow-300 shadow-lg shadow-yellow-500/50' 
                  : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:shadow-md'
                }
                ${spinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {num}
            </button>
          ))}
        </div>
        {chosenNumber && (
          <p className="text-center mt-2 text-green-400 font-semibold text-sm">
            Número seleccionado: <span className="text-yellow-400 text-lg">{chosenNumber}</span>
          </p>
        )}
      </div>

      {/* Apuestas rápidas */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 text-center">Apuestas rápidas</h3>
        <div className="grid grid-cols-5 gap-1.5">
          {quickBets.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={spinning || amount > balance}
              className={`
                h-8 rounded-md font-bold text-xs transition-all duration-200 border-2 transform-gpu will-change-transform
                ${betAmount === amount
                  ? 'bg-green-500 text-white border-green-300 shadow-lg'
                  : amount > balance
                  ? 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 hover:shadow-md'
                }
                ${spinning ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Cantidad personalizada */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 text-center">Cantidad personalizada</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={balance}
            value={betAmount || ''}
            onChange={(e) => setBetAmount(Number(e.target.value) || 0)}
            disabled={spinning}
            placeholder="Ingresa cantidad"
            className="flex-1 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none disabled:opacity-50 text-sm"
          />
          <button
            onClick={handleMaxBet}
            disabled={spinning || balance === 0}
            className="px-3 py-1.5 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            MAX
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Saldo disponible: <span className="text-green-400 font-semibold">${balance}</span>
        </p>
      </div>

      {/* Información de la apuesta */}
      {chosenNumber && betAmount > 0 && (
        <div className="mb-4 bg-gray-700/50 rounded-lg p-3 border border-gray-600">
          <h4 className="font-semibold text-yellow-400 mb-1 text-sm">Resumen de tu apuesta:</h4>
          <div className="space-y-0.5 text-xs">
            <p>Número: <span className="text-yellow-400 font-bold">{chosenNumber}</span></p>
            <p>Apuesta: <span className="text-green-400 font-bold">${betAmount}</span></p>
            <p>Ganancia potencial: <span className="text-purple-400 font-bold">${betAmount * 29}</span></p>
            <p className="text-xs text-gray-400">Probabilidad: 3.33% (1/30)</p>
          </div>
        </div>
      )}

      {/* Botón de girar */}
      <button
        onClick={onSpin}
        disabled={spinning || !chosenNumber || betAmount <= 0 || betAmount > balance}
        className={`
          w-full h-12 rounded-xl font-bold text-lg transition-all duration-300 border-4 transform-gpu will-change-transform
          ${spinning 
            ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed' 
            : (!chosenNumber || betAmount <= 0 || betAmount > balance)
            ? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 hover:from-red-400 hover:to-pink-400 hover:shadow-xl shadow-lg shadow-red-500/30 animate-pulse'
          }
        `}
      >
        {spinning ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            GIRANDO...
          </div>
        ) : (
          '🎰 ¡GIRAR RULETA! 🎰'
        )}
      </button>

      {/* Mensajes de validación */}
      {!spinning && (
        <div className="mt-2 text-center text-xs">
          {!chosenNumber && (
            <p className="text-red-400">⚠️ Selecciona un número</p>
          )}
          {chosenNumber && betAmount <= 0 && (
            <p className="text-red-400">⚠️ Ingresa una cantidad válida</p>
          )}
          {chosenNumber && betAmount > balance && (
            <p className="text-red-400">⚠️ Saldo insuficiente</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BettingPanel;
