'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ConnexionPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        setEmailSent(true)
        toast.success('Compte créé ! Vérifiez votre email.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Connexion réussie !')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      const msg = err.message?.includes('Invalid login credentials')
        ? 'Email ou mot de passe incorrect'
        : err.message?.includes('already registered')
          ? 'Cet email est déjà utilisé'
          : err.message || 'Une erreur est survenue'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '24px', padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#C9A84C', marginBottom: '1rem' }}>Email envoyé !</h2>
          <p style={{ color: '#8A8799', lineHeight: 1.7, marginBottom: '2rem' }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: '#F0EDE6' }}>{email}</strong>.
            Cliquez dessus pour activer votre compte et commencer à voter.
          </p>
          <button onClick={() => { setEmailSent(false); setMode('login') }}
            style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A30)', border: 'none', color: '#0A0A0F', padding: '0.8rem 2rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '24px', padding: '2.5rem', maxWidth: '440px', width: '100%' }}>
        {/* Crown */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>👑</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#C9A84C', marginTop: '0.5rem' }}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p style={{ color: '#8A8799', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            {mode === 'login' ? 'Connectez-vous pour voter' : 'Rejoignez et votez pour votre candidat'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#12121A', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '0.5rem', border: 'none', borderRadius: '7px', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', transition: 'all 0.2s',
                background: mode === m ? '#1A1A26' : 'transparent',
                color: mode === m ? '#F0EDE6' : '#8A8799',
                fontWeight: mode === m ? 600 : 400,
              }}>
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#8A8799', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Nom complet
              </label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                placeholder="Ex : Jean Dupont"
                style={{ width: '100%', background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6', padding: '0.8rem 1rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', outline: 'none' }} />
            </div>
          )}

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#8A8799', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Adresse email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="votre@email.com"
              style={{ width: '100%', background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6', padding: '0.8rem 1rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#8A8799', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Mot de passe
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              minLength={6}
              style={{ width: '100%', background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6', padding: '0.8rem 1rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #C9A84C, #9A7A30)',
              border: 'none', borderRadius: '10px', color: '#0A0A0F', fontFamily: 'Outfit, sans-serif',
              fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '1px', opacity: loading ? 0.7 : 1, transition: 'all 0.3s',
            }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8A8799', marginTop: '1.5rem', lineHeight: 1.6 }}>
          En vous inscrivant, vous acceptez de voter une seule fois par catégorie.
          Chaque email ne peut voter qu'une seule fois.
        </p>
      </div>
    </div>
  )
}
