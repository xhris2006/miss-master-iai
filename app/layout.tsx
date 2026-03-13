import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Miss & Master IAI Mbalmayo 2025',
  description: 'Votez pour vos candidats favoris au concours Miss & Master IAI Mbalmayo',
  openGraph: {
    title: 'Miss & Master IAI Mbalmayo 2025',
    description: 'Votez pour vos candidats favoris',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="relative z-10 min-h-screen">
          <Header />
          <main className="relative z-10">
            {children}
          </main>
          <footer className="relative z-10 text-center py-8 text-sm" style={{ color: '#8A8799', borderTop: '1px solid rgba(201,168,76,0.1)', marginTop: '4rem' }}>
            <p>© {new Date().getFullYear()} Miss & Master IAI Mbalmayo — Tous droits réservés</p>
            <p className="mt-1" style={{ color: '#5A5770' }}>Institut Africain d'Informatique · Mbalmayo, Cameroun</p>
          </footer>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1A26',
              color: '#F0EDE6',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#0A0A0F' } },
          }}
        />
      </body>
    </html>
  )
}
