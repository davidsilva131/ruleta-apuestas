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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-700 shadow-md">
      <h2 className="text-lg font-bold text-center mb-4 text-gray-900 dark:text-white">
        💰 Panel de Apuestas
      </h2>

      {/* Selección de número */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-center text-gray-900 dark:text-white">
          Elige tu número de la suerte
        </h3>
        <div className="grid grid-cols-6 gap-1.5">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberSelect(num)}
              disabled={spinning}
              className={`
                h-10 rounded-md font-bold text-sm transition-colors duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${chosenNumber === num 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${spinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {num}
            </button>
          ))}
        </div>
        {chosenNumber && (
          <p className="text-center mt-2 text-green-600 dark:text-green-400 font-semibold text-base">
            Número seleccionado: <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">{chosenNumber}</span>
          </p>
        )}
      </div>

      {/* Apuestas rápidas */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3 text-center text-gray-900 dark:text-white">
          Apuestas rápidas
        </h3>
        <div className="grid grid-cols-5 gap-1.5">
          {quickBets.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={spinning || amount > balance}
              className={`
                h-9 rounded-md font-semibold text-xs transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500
                ${betAmount === amount
                  ? 'bg-green-600 text-white border-green-500 shadow-md'
                  : amount > balance
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600'
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
        <h3 className="text-base font-semibold mb-3 text-center text-gray-900 dark:text-white">
          Cantidad personalizada
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={balance}
            value={betAmount || ''}
            onChange={(e) => setBetAmount(Number(e.target.value) || 0)}
            disabled={spinning}
            placeholder="Ingresa cantidad"
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            onClick={handleMaxBet}
            disabled={spinning || balance === 0}
            className="px-3 py-2 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            MAX
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          Saldo disponible: <span className="text-green-600 dark:text-green-400 font-semibold">${balance.toLocaleString()}</span>
        </p>
      </div>

      {/* Información de la apuesta */}
      {chosenNumber && betAmount > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-md p-3 border border-gray-300 dark:border-gray-600">
          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 text-sm">
            Resumen de tu apuesta:
          </h4>
          <div className="space-y-1 text-xs">
            <p className="text-gray-700 dark:text-gray-300">
              Número: <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{chosenNumber}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Apuesta: <span className="text-green-600 dark:text-green-400 font-bold">${betAmount.toLocaleString()}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Ganancia potencial: <span className="text-purple-600 dark:text-purple-400 font-bold">${(betAmount * 29).toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}

      {/* Botón de girar */}
      <button
        onClick={onSpin}
        disabled={spinning || !chosenNumber || betAmount <= 0 || betAmount > balance}
        className={`
          w-full h-12 rounded-lg font-bold text-base transition-colors duration-200 focus:outline-none focus:ring-4
          ${spinning 
            ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
            : (!chosenNumber || betAmount <= 0 || betAmount > balance)
            ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700 shadow-lg focus:ring-red-300'
          }
        `}
      >
        {spinning ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            GIRANDO...
          </div>
        ) : (
          '🎰 ¡GIRAR RULETA!'
        )}
      </button>

      {/* Mensajes de validación */}
      {!spinning && (
        <div className="mt-2 text-center text-xs">
          {!chosenNumber && (
            <p className="text-red-600 dark:text-red-400">⚠️ Selecciona un número</p>
          )}
          {chosenNumber && betAmount <= 0 && (
            <p className="text-red-600 dark:text-red-400">⚠️ Ingresa una cantidad válida</p>
          )}
          {chosenNumber && betAmount > balance && (
            <p className="text-red-600 dark:text-red-400">⚠️ Saldo insuficiente</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BettingPanel;
