import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Navbar from '@/components/Navbar';
import SchedulerInitializer from '@/components/SchedulerInitializer';
import { Toaster } from 'react-hot-toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f2937',
}

export const metadata: Metadata = {
  title: '🎰 Ruleta de Apuestas - Juego de Casino Online',
  description: 'Juega a la ruleta de 30 números con animales de la suerte. ¡Haz tu apuesta y gira la ruleta para ganar grandes premios!',
  keywords: 'ruleta, casino, apuestas, juego, números, animales, suerte, premios',
  authors: [{ name: 'Ruleta Casino' }],
  creator: 'Ruleta Casino',
  publisher: 'Ruleta Casino',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '🎰 Ruleta de Apuestas - Juego de Casino Online',
    description: 'Juega a la ruleta de 30 números con animales de la suerte.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎰 Ruleta de Apuestas',
    description: 'Juego de ruleta con animales de la suerte',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <SchedulerInitializer />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster
              position="bottom-left"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-text)',
                  border: '1px solid var(--toast-border)',
                  fontSize: '16px',
                  padding: '16px 20px',
                  minWidth: '350px',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}