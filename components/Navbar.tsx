'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-3xl">🎰</div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                  Ruleta Casino
                </h1>
                <p className="text-xs text-gray-400">
                  {user?.isAdmin ? "Panel de Administración" : "Juegos de azar"}
                </p>
              </div>
            </Link>

            {/* Menú de navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
              >
                <span>🏠</span>
                <span>Inicio</span>
              </Link>

              {!user?.isAdmin && (
                <>
                  <Link 
                    href="/game" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400 hover:text-yellow-300"
                  >
                    <span>🎯</span>
                    <span>Ruleta Manual</span>
                  </Link>
                  
                  <Link 
                    href="/ruleta-automatica" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-blue-400 hover:text-blue-300"
                  >
                    <span>⏰</span>
                    <span>Ruleta Automática</span>
                  </Link>
                </>
              )}

              {user?.isAdmin && (
                <>
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-purple-400 hover:text-purple-300"
                  >
                    <span>⚙️</span>
                    <span>Panel Admin</span>
                  </Link>
                  <Link 
                    href="/security" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
                  >
                    <span>🛡️</span>
                    <span>Seguridad</span>
                  </Link>
                </>
              )}
            </div>

            {/* Usuario y Login - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2">
                    <FiUser className={user.isAdmin ? "text-red-400" : "text-green-400"} />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                      {user.isAdmin ? (
                        <p className="text-xs text-red-400">👑 Administrador</p>
                      ) : (
                        <p className="text-xs text-green-400">${user.balance.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <FiLogOut />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-200 font-semibold"
                >
                  <FiUser />
                  <span>Iniciar Sesión</span>
                </button>
              )}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Menú móvil */}
          {isMenuOpen && (
            <div className="md:hidden bg-gray-800/95 rounded-lg mt-2 p-4 space-y-4">
              <Link 
                href="/" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🏠</span>
                <span>Inicio</span>
              </Link>

              {!user?.isAdmin && (
                <>
                  <Link 
                    href="/game" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🎯</span>
                    <span>Ruleta Manual</span>
                  </Link>
                  
                  <Link 
                    href="/ruleta-automatica" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>⏰</span>
                    <span>Ruleta Automática</span>
                  </Link>
                </>
              )}

              {user?.isAdmin && (
                <>
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Panel Admin</span>
                  </Link>
                  <Link 
                    href="/security" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-red-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🛡️</span>
                    <span>Security</span>
                  </Link>
                </>
              )}

              <hr className="border-gray-700" />

              {user ? (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <FiUser className={user.isAdmin ? "text-red-400" : "text-green-400"} />
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      {user.isAdmin ? (
                        <p className="text-sm text-red-400">👑 Administrador</p>
                      ) : (
                        <p className="text-sm text-green-400">${user.balance.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full p-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <FiLogOut />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold"
                >
                  <FiUser />
                  <span>Iniciar Sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Modal de Login */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Navbar;
