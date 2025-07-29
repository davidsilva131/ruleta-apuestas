'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-300/60 dark:border-gray-700/60 shadow-lg' 
          : 'bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-3xl">🎰</div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ruleta Casino
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.isAdmin ? "Panel de Administración" : "Juegos de azar"}
                </p>
              </div>
            </Link>

            {/* Menú de navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span>🏠</span>
                <span>Inicio</span>
              </Link>

              {!user?.isAdmin && (
                <>
                  <Link 
                    href="/game" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <span>🎯</span>
                    <span>Ruleta Manual</span>
                  </Link>
                  
                  <Link 
                    href="/ruleta-automatica" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
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
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    <span>⚙️</span>
                    <span>Panel Admin</span>
                  </Link>
                  <Link 
                    href="/security" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <span>🛡️</span>
                    <span>Seguridad</span>
                  </Link>
                </>
              )}
            </div>

            {/* Usuario, Toggle Tema y Login - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Botón toggle tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              >
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>
              {user ? (
                <>
                  <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <FiUser className={user.isAdmin ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"} />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</p>
                      {user.isAdmin ? (
                        <p className="text-xs text-red-500 dark:text-red-400">👑 Administrador</p>
                      ) : (
                        <p className="text-xs text-green-500 dark:text-green-400">${user.balance.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <FiLogOut />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiUser />
                  <span>Iniciar Sesión</span>
                </button>
              )}
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Toggle tema móvil */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              >
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {isMenuOpen && (
            <div className={`md:hidden rounded-lg mt-2 p-4 space-y-4 border transition-all duration-300 ${
              isScrolled 
                ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-gray-300/60 dark:border-gray-700/60 shadow-lg' 
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-md'
            }`}>
              <Link 
                href="/" 
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🏠</span>
                <span>Inicio</span>
              </Link>

              {!user?.isAdmin && (
                <>
                  <Link 
                    href="/game" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🎯</span>
                    <span>Ruleta Manual</span>
                  </Link>
                  
                  <Link 
                    href="/ruleta-automatica" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
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
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Panel Admin</span>
                  </Link>
                  <Link 
                    href="/security" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🛡️</span>
                    <span>Seguridad</span>
                  </Link>
                </>
              )}

              <hr className="border-gray-300 dark:border-gray-600" />

              {user ? (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <FiUser className={user.isAdmin ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"} />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                      {user.isAdmin ? (
                        <p className="text-sm text-red-500 dark:text-red-400">👑 Administrador</p>
                      ) : (
                        <p className="text-sm text-green-500 dark:text-green-400">${user.balance.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="flex items-center space-x-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
