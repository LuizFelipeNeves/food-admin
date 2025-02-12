import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Food Admin',
  description: 'Food Admin',
  icons: {
    icon: '/favicon.ico',
  },
};

// This enables server-side rendering
export const dynamic = 'auto';
export const runtime = 'nodejs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'dark:bg-zinc-800 dark:text-white',
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}