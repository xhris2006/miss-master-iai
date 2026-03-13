'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/config'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Candidats' },
    { href: '/resultats', label: 'Résultats' },
  ]

  return (
    <header className="relative z-20" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
      {/* Top banner */}
      <div style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.1), rgba(201,168,76,0.05))', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
        className="text-center py-2 px-4 text-xs tracking-widest uppercase" style2={{ color: '#8A8799' }}>
        <span style={{ color: '#8A8799', letterSpacing: '3px', fontSize: '0.7rem' }}>
          ✦ Institut Africain d'Informatique · Mbalmayo ✦
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Logo */}
        <div className="text-center mb-4">
          <span className="animate-float text-4xl block mb-2">👑</span>
          <h1 className="font-playfair font-black text-gradient-gold tracking-widest"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(135deg, #E8C97A, #C9A84C, #9A7A30)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Miss & Master IAI
          </h1>
          <p style={{ color: '#8A8799', letterSpacing: '4px', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.25rem' }}>
            Mbalmayo · Édition 2025
          </p>
        </div>

        {/* Nav */}
        <nav className="flex justify-center items-center gap-2 flex-wrap">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              style={{
                background: 'transparent',
                border: `1px solid ${pathname === link.href ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`,
                color: pathname === link.href ? '#C9A84C' : '#8A8799',
                padding: '0.4rem 1.2rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                background2: pathname === link.href ? 'rgba(201,168,76,0.08)' : 'transparent',
              }}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              {isAdmin(user.email) && (
                <Link href="/admin"
                  style={{
                    border: `1px solid ${pathname.startsWith('/admin') ? 'rgba(74,143,212,0.8)' : 'rgba(74,143,212,0.3)'}`,
                    color: pathname.startsWith('/admin') ? '#4A8FD4' : '#7AABDA',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}>
                  ⚙️ Admin
                </Link>
              )}
              <span style={{ color: '#8A8799', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                {user.email}
              </span>
              <button onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(224,82,82,0.3)',
                  color: '#E05252',
                  padding: '0.4rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s',
                }}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/connexion"
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #9A7A30)',
                border: 'none',
                color: '#0A0A0F',
                padding: '0.4rem 1.3rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: '700',
                letterSpacing: '1px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
              Se connecter
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
