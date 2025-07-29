'use client'
import { getAnimalEmoji, getAnimalName, formatCurrency } from '@/lib/utils';

interface ResultsPanelProps {
  winningNumber: number | null;
  chosenNumber: number | null;
  betAmount: number;
  result: 'win' | 'lose' | null;
  animal: string | null;
  onReset: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  winningNumber,
  chosenNumber,
  betAmount,
  result,
  animal,
  onReset
}) => {

  if (!winningNumber) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 shadow-md min-h-[600px] flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          📊 Resultados
        </h2>
        <div className="text-center text-gray-600 dark:text-gray-400 flex-1 flex flex-col justify-center">
          <div className="text-6xl mb-4">🎲</div>
          <p className="text-lg">¡Haz tu apuesta y gira la ruleta!</p>
          <p className="text-sm mt-2 opacity-75">Los resultados aparecerán aquí</p>
        </div>
      </div>
    );
  }

  const isWin = result === 'win';
  const winnings = isWin ? betAmount * 29 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 shadow-md min-h-[500px] flex flex-col">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">
        📊 Resultados
      </h2>

      <div className="flex-1 flex flex-col justify-between">
        {!winningNumber ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">¡Haz tu apuesta y gira la ruleta!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Los resultados aparecerán aquí</p>
          </div>
        ) : (
          <>
            {/* Número ganador */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className={`text-5xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 border-4 ${
                  isWin 
                    ? 'bg-green-500 border-green-400 text-white shadow-lg' 
                    : 'bg-red-500 border-red-400 text-white shadow-lg'
                }`}>
                  {winningNumber}
                </div>
                <div className="absolute -top-1 -right-1 text-2xl">
                  {getAnimalEmoji(winningNumber)}
                </div>
              </div>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Número ganador: {winningNumber}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Animal: {getAnimalEmoji(winningNumber)} {getAnimalName(winningNumber)}
              </p>
            </div>

            {/* Resultado */}
            <div className={`text-center mb-6 p-4 rounded-lg border-2 ${
              isWin 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-500' 
                : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-500'
            }`}>
              <div className="text-4xl mb-2">
                {isWin ? '🎉' : '😔'}
              </div>
              <h3 className={`text-xl font-bold mb-1 ${
                isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isWin ? '¡GANASTE!' : 'PERDISTE'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {isWin 
                  ? `¡Felicidades! Acertaste el número ${winningNumber}` 
                  : `El número ganador fue ${winningNumber}, apostaste al ${chosenNumber}`
                }
              </p>
            </div>

            {/* Detalles de la apuesta */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
                Detalles de la apuesta:
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Tu número:</p>
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{chosenNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Número ganador:</p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">{winningNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Apuesta:</p>
                  <p className="text-gray-900 dark:text-white font-bold">{formatCurrency(betAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Resultado:</p>
                  <p className={`font-bold ${
                    isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isWin ? `+${formatCurrency(winnings)}` : `-${formatCurrency(betAmount)}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Botón para nueva partida */}
        {winningNumber && (
          <div className="mt-auto">
            <button
              onClick={onReset}
              className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              🎰 Nueva Partida
            </button>

            {/* Mensaje motivacional */}
            <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
              {isWin ? (
                <p>🌟 ¡Increíble suerte! ¿Intentas otra vez?</p>
              ) : (
                <p>🍀 ¡No te rindas! La suerte puede cambiar</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
