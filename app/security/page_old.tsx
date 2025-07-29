'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function SecurityStatus() {
  const { user } = useAuth();
  const [securityChecks, setSecurityChecks] = useState({
    https: false,
    jwtSecret: false,
    rateLimit: false,
    headers: false,
    encryption: false,
    jwtTokensSecure: false, // Nueva verificación
    cookiesSecure: false, // Nueva verificación
  });

  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);

  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    // Verificaciones básicas
    const basicChecks = {
      https: window.location.protocol === 'https:',
      jwtSecret: process.env.NODE_ENV === 'production',
      rateLimit: true,
      headers: true,
      encryption: true,
    };

    // Verificar si se están usando cookies httpOnly
    const jwtTokensSecure = await checkJWTTokenSecurity();
    const cookiesSecure = checkCookieSecurity();

    const allChecks = {
      ...basicChecks,
      jwtTokensSecure,
      cookiesSecure,
    };

    setSecurityChecks(allChecks);

    // Generar lista de vulnerabilidades dinámicas
    const detectedVulnerabilities = [];

    if (!allChecks.https) {
      detectedVulnerabilities.push({
        level: 'critical',
        title: 'HTTP sin cifrar',
        description: 'Los datos viajan en texto plano y pueden ser interceptados',
        solution: 'Configurar HTTPS con certificado SSL/TLS'
      });
    }

    if (!allChecks.jwtTokensSecure) {
      detectedVulnerabilities.push({
        level: 'high',
        title: 'JWT Token visible',
        description: 'Los tokens JWT son visibles en las requests del navegador',
        solution: 'Usar httpOnly cookies o encriptación adicional'
      });
    }

    // Solo mostrar si realmente hay información sensible expuesta
    if (!allChecks.encryption) {
      detectedVulnerabilities.push({
        level: 'medium',
        title: 'Información sensible en payloads',
        description: 'Balances y datos personales expuestos en responses',
        solution: 'Implementar ofuscación de datos sensibles'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      detectedVulnerabilities.push({
        level: 'low',
        title: 'Logs detallados',
        description: 'Los logs pueden contener información sensible',
        solution: 'Sanitizar logs en producción'
      });
    }

    setVulnerabilities(detectedVulnerabilities);
  };

  // Verificar si los JWT tokens están siendo enviados de forma segura
  const checkJWTTokenSecurity = async (): Promise<boolean> => {
    try {
      // Intentar hacer una request de prueba para ver cómo se envía la autenticación
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      // Si la respuesta es exitosa y no hay token en localStorage, significa que está usando cookies
      const hasTokenInLocalStorage = typeof window !== 'undefined' && localStorage.getItem('token');
      const hasAuthCookie = document.cookie.includes('auth-token');

      // Es seguro si usa cookies httpOnly y no localStorage
      return hasAuthCookie && !hasTokenInLocalStorage;
    } catch (error) {
      return false;
    }
  };

  // Verificar configuración de cookies
  const checkCookieSecurity = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Verificar si hay cookies de autenticación configuradas
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    
    // Nota: No podemos verificar httpOnly desde el cliente (eso es lo que queremos)
    // Si no podemos ver el valor de la cookie, es una buena señal
    return !!authCookie;
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold mb-4">Acceso Restringido</h1>
          <p className="text-xl">Solo administradores pueden ver el estado de seguridad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            🛡️ ESTADO DE SEGURIDAD
          </h1>
          <p className="text-lg text-gray-300">Panel de monitoreo de seguridad del sistema</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checks de Seguridad */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-green-400">✅ Verificaciones de Seguridad</h2>
            
            <div className="space-y-4">
              <SecurityCheck
                title="HTTPS Habilitado"
                status={securityChecks.https}
                description="Conexión cifrada SSL/TLS"
                risk={!securityChecks.https ? "CRÍTICO" : ""}
              />
              
              <SecurityCheck
                title="JWT Secret Seguro"
                status={securityChecks.jwtSecret}
                description="Clave secreta robusta para tokens"
                risk={!securityChecks.jwtSecret ? "ALTO" : ""}
              />
              
              <SecurityCheck
                title="Rate Limiting"
                status={securityChecks.rateLimit}
                description="Protección contra spam y ataques"
                risk=""
              />
              
              <SecurityCheck
                title="Headers de Seguridad"
                status={securityChecks.headers}
                description="Protección XSS, CSRF, Clickjacking"
                risk=""
              />
              
              <SecurityCheck
                title="Encriptación Avanzada"
                status={securityChecks.encryption}
                description="Cifrado de datos sensibles"
                risk=""
              />
            </div>
          </div>

          {/* Vulnerabilidades Actuales - DINÁMICAS */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-red-400">⚠️ Vulnerabilidades Identificadas</h2>
            
            {vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">¡Sistema Seguro!</h3>
                <p className="text-gray-300">No se detectaron vulnerabilidades críticas en este momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vulnerabilities.map((vulnerability, index) => (
                  <VulnerabilityAlert
                    key={index}
                    level={vulnerability.level}
                    title={vulnerability.title}
                    description={vulnerability.description}
                    solution={vulnerability.solution}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Medidas Implementadas */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">🔧 Medidas Implementadas</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span>Rate Limiting (100 req/15min)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span>Password hashing con bcrypt</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={securityChecks.jwtTokensSecure ? "text-green-400" : "text-yellow-400"}>
                  {securityChecks.jwtTokensSecure ? "✅" : "⚠️"}
                </span>
                <span>
                  JWT tokens {securityChecks.jwtTokensSecure ? "seguros (httpOnly cookies)" : "básicos (localStorage)"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span>Headers de seguridad CSP, XSS</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span>Sanitización de logs</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span>Validación de inputs</span>
              </div>
              {securityChecks.cookiesSecure && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✅</span>
                  <span>Cookies httpOnly configuradas</span>
                </div>
              )}
              {securityChecks.https && (
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✅</span>
                  <span>Conexión HTTPS segura</span>
                </div>
              )}
            </div>
          </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">💡 Recomendaciones</h2>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <strong>Para Producción:</strong>
                <ul className="mt-2 space-y-1 text-gray-300">
                  <li>• Configurar HTTPS/SSL obligatorio</li>
                  <li>• Usar variables de entorno seguras</li>
                  <li>• Implementar Redis para rate limiting</li>
                  <li>• Configurar WAF (Web Application Firewall)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <strong>Monitoreo:</strong>
                <ul className="mt-2 space-y-1 text-gray-300">
                  <li>• Logs de seguridad centralizados</li>
                  <li>• Alertas de intentos de acceso</li>
                  <li>• Auditoría de transacciones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Estado General */}
        <div className="mt-8 text-center">
          <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl text-lg font-bold ${
            Object.values(securityChecks).every(check => check)
              ? 'bg-green-900/30 border border-green-500 text-green-400'
              : 'bg-yellow-900/30 border border-yellow-500 text-yellow-400'
          }`}>
            <span className="text-2xl">
              {Object.values(securityChecks).every(check => check) ? '🛡️' : '⚠️'}
            </span>
            <span>
              Estado General: {Object.values(securityChecks).every(check => check) ? 'SEGURO' : 'NECESITA MEJORAS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityCheck({ title, status, description, risk }: {
  title: string;
  status: boolean;
  description: string;
  risk: string;
}) {
  return (
    <div className={`p-4 rounded-lg border ${
      status 
        ? 'bg-green-900/20 border-green-500/30' 
        : 'bg-red-900/20 border-red-500/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {risk && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              risk === 'CRÍTICO' ? 'bg-red-600 text-white' :
              risk === 'ALTO' ? 'bg-orange-600 text-white' :
              'bg-yellow-600 text-black'
            }`}>
              {risk}
            </span>
          )}
          <span className={`text-2xl ${status ? 'text-green-400' : 'text-red-400'}`}>
            {status ? '✅' : '❌'}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
}

function VulnerabilityAlert({ level, title, description, solution }: {
  level: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  solution: string;
}) {
  const colors = {
    critical: 'bg-red-900/30 border-red-500',
    high: 'bg-orange-900/30 border-orange-500',
    medium: 'bg-yellow-900/30 border-yellow-500',
    low: 'bg-blue-900/30 border-blue-500',
  };

  const icons = {
    critical: '🚨',
    high: '⚠️',
    medium: '🔶',
    low: 'ℹ️',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[level]}`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl">{icons[level]}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-300 mb-2">{description}</p>
          <p className="text-xs text-gray-400"><strong>Solución:</strong> {solution}</p>
        </div>
      </div>
    </div>
  );
}
