'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoginModal from '@/components/LoginModal';
import Link from 'next/link';

export default function PublicHome() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-green-400 rounded-full blur-2xl animate-pulse delay-3000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="text-8xl mb-8">🎰</div>
          <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
            Ruleta Casino
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Bienvenido al casino más emocionante. Prueba tu suerte en nuestras ruletas y vive la experiencia del juego.
          </p>
          
          {!user ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 hover:scale-105 shadow-lg mr-4"
              >
                🎯 Iniciar Sesión y Jugar
              </button>
              <p className="text-gray-400 text-lg">
                ¿No tienes cuenta? Regístrate al hacer clic en "Iniciar Sesión"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.isAdmin ? (
                <Link
                  href="/admin"
                  className="inline-block bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  👑 Ir al Panel de Administración
                </Link>
              ) : (
                <Link
                  href="/game"
                  className="inline-block bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  🎯 Ir a Jugar
                </Link>
              )}
              <p className="text-gray-400 text-lg">
                Bienvenido de vuelta, {user.username}!
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <div className="text-center p-8 bg-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-700">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">Ruleta Manual</h3>
            <p className="text-gray-300">
              Juega en tiempo real, elige tu número de la suerte y observa la ruleta girar. 
              Probabilidad de ganar: 1/30, pago: 30:1
            </p>
          </div>

          <div className="text-center p-8 bg-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-700">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Ruleta Automática</h3>
            <p className="text-gray-300">
              Participa en juegos programados con otros jugadores. 
              Apuestas físicas y virtuales en un mismo evento.
            </p>
          </div>

          <div className="text-center p-8 bg-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-700">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-4 text-green-400">Estadísticas</h3>
            <p className="text-gray-300">
              Lleva un registro de tus juegos, ganancias, rachas y logros. 
              Mejora tu estrategia con datos detallados.
            </p>
          </div>
        </div>

        {/* Game Rules Section */}
        <div className="py-16 text-center">
          <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            ¿Cómo Jugar?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="text-4xl mb-4">1️⃣</div>
              <h4 className="text-xl font-bold mb-2 text-yellow-400">Elige tu número</h4>
              <p className="text-gray-300">Selecciona un número del 1 al 30. Cada número tiene la misma probabilidad de salir.</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="text-4xl mb-4">2️⃣</div>
              <h4 className="text-xl font-bold mb-2 text-green-400">Haz tu apuesta</h4>
              <p className="text-gray-300">Decide cuánto quieres apostar. Asegúrate de tener saldo suficiente.</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="text-4xl mb-4">3️⃣</div>
              <h4 className="text-xl font-bold mb-2 text-blue-400">Gira la ruleta</h4>
              <p className="text-gray-300">Presiona el botón y observa cómo gira la ruleta hasta detenerse en un número.</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="text-4xl mb-4">4️⃣</div>
              <h4 className="text-xl font-bold mb-2 text-purple-400">¡Gana!</h4>
              <p className="text-gray-300">Si aciertas, ganas 30 veces tu apuesta. Si no, inténtalo de nuevo.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-16 border-t border-gray-700">
          <div className="text-4xl mb-4">🍀</div>
          <p className="text-xl text-gray-400 mb-4">¡Que la suerte esté de tu lado!</p>
          <p className="text-gray-500">Juega responsablemente • Probabilidad de ganar: 3.33% (1/30) • Pago: 30:1</p>
          <div className="mt-8 space-y-2">
            <p className="text-sm text-gray-600">Ruleta Casino © 2025</p>
            <p className="text-xs text-gray-700">Entretenimiento digital • No es apuesta real</p>
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
