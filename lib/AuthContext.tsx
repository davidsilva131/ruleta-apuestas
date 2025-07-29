'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la página, verificar si hay una sesión activa
    // ya no necesitamos verificar localStorage
    fetchUser();
  }, []);

  const fetchUser = async () => {
    console.log('Verificando sesión...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      // Ahora enviamos cookies automáticamente, no necesitamos Authorization header
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Importante: incluir cookies en la request
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
      } else {
        console.log('No sesión activa encontrada');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      // Si es un error de timeout o de red, aún así permitir continuar
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request timed out');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: userData } = await response.json();
        // Ya no manejamos el token manualmente, las cookies lo hacen
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        const { user: userData } = await response.json();
        // Ya no manejamos el token manualmente, las cookies lo hacen
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout para limpiar la sesión del servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Importante: incluir cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      // Redirigir a la página principal pública
      window.location.href = '/';
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};
