'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginModal from '@/components/LoginModal';
import Link from 'next/link';

export default function PublicHome() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center py-20 border-b border-gray-300 dark:border-gray-700">
          <div className="text-6xl mb-8">🎰</div>
          <h1 className="text-5xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
            Ruleta Casino
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Bienvenido al casino más emocionante. Prueba tu suerte en nuestras ruletas y vive la experiencia del juego.
          </p>
          
          {!user ? (
            <div className="space-y-6">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-lg text-xl transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Iniciar Sesión y Jugar
              </button>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                ¿No tienes cuenta? Regístrate al hacer clic en "Iniciar Sesión"
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {user.isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-block bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-4 px-10 rounded-lg text-xl transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400"
                >
                  Panel de Administración
                </Link>
              ) : (
                <Link
                  href="/game"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-lg text-xl transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Ir a Jugar
                </Link>
              )}
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Bienvenido de vuelta, {user.username}!
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="py-20">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Modalidades de Juego
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ruleta Manual</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Juega en tiempo real, elige tu número de la suerte y observa la ruleta girar. 
                Probabilidad de ganar: 1/30, pago: 30:1
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
              <div className="text-5xl mb-6">⏰</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ruleta Automática</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Participa en juegos programados con otros jugadores. 
                Apuestas físicas y virtuales en un mismo evento.
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Estadísticas</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Lleva un registro de tus juegos, ganancias, rachas y logros. 
                Mejora tu estrategia con datos detallados.
              </p>
            </div>
          </div>
        </div>

        {/* Game Rules Section */}
        <div className="py-20 bg-white dark:bg-gray-800 rounded-xl mx-4 shadow-md border border-gray-300 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-16 text-center text-gray-900 dark:text-white">
            ¿Cómo Jugar?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 border border-gray-300 dark:border-gray-600 shadow-sm">
              <div className="text-4xl mb-6 text-center">1️⃣</div>
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Elige tu número</h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
                Selecciona un número del 1 al 30. Cada número tiene la misma probabilidad de salir.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 border border-gray-300 dark:border-gray-600 shadow-sm">
              <div className="text-4xl mb-6 text-center">2️⃣</div>
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Haz tu apuesta</h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
                Decide cuánto quieres apostar. Asegúrate de tener saldo suficiente.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 border border-gray-300 dark:border-gray-600 shadow-sm">
              <div className="text-4xl mb-6 text-center">3️⃣</div>
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Gira la ruleta</h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
                Presiona el botón y observa cómo gira la ruleta hasta detenerse en un número.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 border border-gray-300 dark:border-gray-600 shadow-sm">
              <div className="text-4xl mb-6 text-center">4️⃣</div>
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">¡Gana!</h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
                Si aciertas, ganas 30 veces tu apuesta. Si no, inténtalo de nuevo.
              </p>
            </div>
          </div>
        </div>        {/* Footer */}
        <footer className="text-center py-20 border-t border-gray-300 dark:border-gray-700">
          <div className="text-4xl mb-6">🍀</div>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 font-medium">¡Que la suerte esté de tu lado!</p>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Juega responsablemente • Probabilidad de ganar: 3.33% (1/30) • Pago: 30:1
          </p>
          <div className="space-y-3">
            <p className="text-base text-gray-600 dark:text-gray-400">Ruleta Casino © 2025</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Entretenimiento digital • No es apuesta real</p>
          </div>
        </footer>
      </div>

      {/* Modal de Login */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}
