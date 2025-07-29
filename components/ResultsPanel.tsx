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
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl min-h-[600px] flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">
          📊 Resultados
        </h2>
        <div className="text-center text-gray-400 flex-1 flex flex-col justify-center">
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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 shadow-2xl min-h-[500px] flex flex-col">
      <h2 className="text-xl font-bold text-center mb-4 text-purple-400">
        📊 Resultados
      </h2>

      <div className="flex-1 flex flex-col justify-between">
        {!winningNumber ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-lg text-gray-300 mb-2">¡Haz tu apuesta y gira la ruleta!</p>
            <p className="text-sm text-gray-400">Los resultados aparecerán aquí</p>
          </div>
        ) : (
          <>
            {/* Número ganador */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className={`text-5xl font-bold rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 border-4 ${
                  isWin ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50 animate-pulse' : 'bg-red-500 border-red-300 shadow-lg shadow-red-500/50'
                }`}>
                  {winningNumber}
                </div>
                <div className="absolute -top-1 -right-1 text-2xl animate-bounce">
                  {getAnimalEmoji(winningNumber)}
                </div>
              </div>
              <p className="text-lg font-semibold text-yellow-400 mb-1">
                Número ganador: {winningNumber}
              </p>
              <p className="text-sm text-gray-300">
                Animal: {getAnimalEmoji(winningNumber)} {getAnimalName(winningNumber)}
              </p>
            </div>

            {/* Resultado */}
            <div className={`text-center mb-4 p-3 rounded-xl border-2 ${
              isWin 
                ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/20' 
                : 'bg-red-900/30 border-red-500 shadow-lg shadow-red-500/20'
            }`}>
              <div className={`text-4xl mb-2 ${isWin ? 'animate-bounce' : 'animate-pulse'}`}>
                {isWin ? '🎉' : '😔'}
              </div>
              <h3 className={`text-xl font-bold mb-1 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? '¡GANASTE!' : 'PERDISTE'}
              </h3>
              <p className="text-sm text-gray-300">
                {isWin 
                  ? `¡Felicidades! Acertaste el número ${winningNumber}` 
                  : `El número ganador fue ${winningNumber}, apostaste al ${chosenNumber}`
                }
              </p>
            </div>

            {/* Detalles de la apuesta */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4 space-y-1">
              <h4 className="font-semibold text-yellow-400 mb-2 text-sm">Detalles de la apuesta:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Tu número:</p>
                  <p className="text-white font-bold">{chosenNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400">Número ganador:</p>
                  <p className="text-yellow-400 font-bold">{winningNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400">Apuesta:</p>
                  <p className="text-blue-400 font-bold">{formatCurrency(betAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Resultado:</p>
                  <p className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
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
              className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 text-sm"
            >
              🎰 Nueva Partida
            </button>

            {/* Mensaje motivacional */}
            <div className="mt-2 text-center text-xs text-gray-400">
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
