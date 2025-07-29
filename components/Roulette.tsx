'use client'
import { useState, useEffect, useRef } from 'react';
import { getAnimalEmoji, getNumberColor } from '@/lib/utils';

interface RouletteProps {
  spinning: boolean;
  winningNumber: number | null;
  animal: string | null;
}

const Roulette: React.FC<RouletteProps> = ({ spinning, winningNumber, animal }) => {
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [showAnimal, setShowAnimal] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Generar números de la ruleta (1-30)
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);

  // Efecto de animación de luces cuando está girando
  useEffect(() => {
    if (spinning) {
      setShowAnimal(false);
      
      animationRef.current = setInterval(() => {
        // Seleccionar un número aleatorio del 1 al 30
        const randomNumber = Math.floor(Math.random() * 30) + 1;
        setHighlightedNumber(randomNumber);
      }, 100); // Cambia cada 100ms

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      setHighlightedNumber(winningNumber);
      
      // Mostrar animal después de un breve delay
      if (winningNumber) {
        setTimeout(() => setShowAnimal(true), 500);
      }
    }
  }, [spinning, winningNumber, numbers]);

  return (
    <div className="relative">
      {/* Ruleta circular */}
      <div className="relative w-80 h-80 mx-auto">
        {/* Círculo exterior decorativo */}
        <div className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-2xl shadow-yellow-400/50 animate-pulse"></div>
        
        {/* Círculo principal de la ruleta */}
        <div className="absolute inset-4 rounded-full bg-gray-900 border-4 border-gray-700 overflow-hidden">
          
          {/* Números de la ruleta */}
          {numbers.map((num, index) => {
            const angle = (index * 360) / numbers.length;
            const isHighlighted = highlightedNumber === num;
            
            return (
              <div
                key={num}
                className={`absolute w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center text-white border-2 border-white/20 transition-all duration-200 ${
                  getNumberColor(num)
                } ${isHighlighted ? 'scale-150 shadow-2xl shadow-yellow-400 animate-pulse border-yellow-400 bg-yellow-500 text-black ring-4 ring-yellow-300' : ''}`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-130px) rotate(-${angle}deg)`,
                }}
              >
                {num}
              </div>
            );
          })}

          {/* Centro de la ruleta */}
          <div className="absolute inset-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-yellow-400 flex items-center justify-center">
            {showAnimal && winningNumber && !spinning ? (
              <div className="text-center animate-fade-in">
                <div className="text-8xl mb-2 animate-bounce">
                  {getAnimalEmoji(winningNumber)}
                </div>
                <p className="text-yellow-400 text-sm font-bold">#{winningNumber}</p>
                <p className="text-gray-300 text-xs mt-1">¡Ganador!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className={`text-6xl ${spinning ? 'animate-spin' : ''}`}>
                  🎯
                </div>
                {spinning && (
                  <p className="text-yellow-400 text-sm font-bold mt-2 animate-pulse">
                    GIRANDO...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Indicador de posición (flecha) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
        </div>
      </div>

      {/* Efectos de luces alrededor */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full ${spinning ? 'animate-ping' : ''}`}
            style={{
              background: `hsl(${i * 45}, 70%, 60%)`,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-200px)`,
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Roulette;
