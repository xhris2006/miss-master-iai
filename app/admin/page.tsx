'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAdmin, CONTEST_CONFIG } from '@/lib/config'
import toast from 'react-hot-toast'
import Image from 'next/image'
import type { Candidate } from '@/lib/types'

type Tab = 'dashboard' | 'candidates' | 'users' | 'settings'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, miss: 0, master: 0, voters: 0 })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null)
  const [form, setForm] = useState({ name: '', description: '', category: 'miss', promotion: '', photo_url: '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !isAdmin(data.user.email)) { router.push('/'); return }
      setUser(data.user)
      loadData()
    })
  }, [])

  const loadData = async () => {
    setLoading(false)
    // Candidates
    const { data: cands } = await supabase.from('candidates').select('*').order('vote_count', { ascending: false })
    setCandidates(cands || [])
    // Stats
    const { count: voterCount } = await supabase.from('votes').select('user_id', { count: 'exact', head: true })
    const total = (cands || []).reduce((s, c) => s + c.vote_count, 0)
    const miss = (cands || []).filter(c => c.category === 'miss').reduce((s, c) => s + c.vote_count, 0)
    const master = (cands || []).filter(c => c.category === 'master').reduce((s, c) => s + c.vote_count, 0)
    setStats({ total, miss, master, voters: voterCount || 0 })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) { setForm(f => ({ ...f, photo_url: data.url })); toast.success('Photo uploadée !') }
    else toast.error(data.error || 'Erreur upload')
  }

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = editCandidate ? `/api/candidates/${editCandidate.id}` : '/api/candidates'
    const method = editCandidate ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      toast.success(editCandidate ? 'Candidat modifié !' : 'Candidat ajouté !')
      setShowAddForm(false); setEditCandidate(null)
      setForm({ name: '', description: '', category: 'miss', promotion: '', photo_url: '' })
      loadData()
    } else { toast.error(data.error) }
  }

  const handleDelete = async (c: Candidate) => {
    if (!confirm(`Supprimer ${c.name} et tous ses votes ?`)) return
    const res = await fetch(`/api/candidates/${c.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Candidat supprimé'); loadData() }
    else toast.error('Erreur')
  }

  const handleEdit = (c: Candidate) => {
    setEditCandidate(c)
    setForm({ name: c.name, description: c.description, category: c.category, promotion: c.promotion, photo_url: c.photo_url || '' })
    setShowAddForm(true)
  }

  const handleReset = async () => {
    const res = await fetch('/api/admin/reset', { method: 'DELETE' })
    if (res.ok) { toast.success('Données réinitialisées !'); setShowReset(false); loadData() }
    else toast.error('Erreur')
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6', padding: '0.75rem 1rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', color: '#8A8799', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem' }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8799' }}>Chargement...</div>

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { key: 'candidates', label: 'Candidats', icon: '👥' },
    { key: 'settings', label: 'Paramètres', icon: '⚙️' },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #E8C97A, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          ⚙️ Panneau Admin
        </h1>
        <p style={{ color: '#8A8799', fontSize: '0.85rem', marginTop: '0.3rem' }}>Connecté en tant que {user?.email}</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '0.6rem 1.2rem', border: `1px solid ${tab === t.key ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', background: tab === t.key ? 'rgba(201,168,76,0.1)' : 'transparent', color: tab === t.key ? '#C9A84C' : '#8A8799', fontFamily: 'Outfit, sans-serif', cursor: 'pointer', fontSize: '0.9rem' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total votes', val: stats.total, icon: '🗳', color: '#C9A84C' },
              { label: 'Votes Miss', val: stats.miss, icon: '♛', color: '#D4547A' },
              { label: 'Votes Master', val: stats.master, icon: '♚', color: '#4A8FD4' },
              { label: 'Candidats', val: candidates.length, icon: '👥', color: '#4CAF7D' },
            ].map(s => (
              <div key={s.label} style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A8799', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: '1rem', color: '#C9A84C' }}>Top 5 candidats</h3>
            {candidates.slice(0, 5).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ minWidth: '24px', color: '#8A8799', fontSize: '0.85rem' }}>#{i + 1}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: c.category === 'miss' ? '#D4547A' : '#4A8FD4', background: c.category === 'miss' ? 'rgba(212,84,122,0.15)' : 'rgba(74,143,212,0.15)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{c.category}</span>
                <span style={{ color: '#C9A84C', fontWeight: 600 }}>{c.vote_count} votes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANDIDATES */}
      {tab === 'candidates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>Gestion des candidats</h2>
            <button onClick={() => { setShowAddForm(true); setEditCandidate(null); setForm({ name: '', description: '', category: 'miss', promotion: '', photo_url: '' }) }}
              style={{ background: 'linear-gradient(135deg, #C9A84C, #9A7A30)', border: 'none', color: '#0A0A0F', padding: '0.7rem 1.5rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              + Ajouter un candidat
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: '1.2rem', color: '#C9A84C' }}>
                {editCandidate ? 'Modifier le candidat' : 'Nouveau candidat'}
              </h3>
              <form onSubmit={handleSaveCandidate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Nom complet *</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Marie Nguemo" />

                    <label style={labelStyle}>Catégorie *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="miss">♛ Miss IAI</option>
                      <option value="master">♚ Master IAI</option>
                    </select>

                    <label style={labelStyle}>Promotion / Filière</label>
                    <input style={inputStyle} value={form.promotion} onChange={e => setForm(f => ({ ...f, promotion: e.target.value }))} placeholder="Ex: Licence 3 Génie Logiciel" />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea style={{ ...inputStyle, height: '100px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Présentation du candidat..." />

                    <label style={labelStyle}>Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ ...inputStyle, padding: '0.5rem' }} />
                    {uploading && <p style={{ color: '#8A8799', fontSize: '0.8rem' }}>Upload en cours...</p>}
                    {form.photo_url && (
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', marginTop: '0.5rem' }}>
                        <Image src={form.photo_url} alt="preview" fill style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg, #C9A84C, #9A7A30)', border: 'none', color: '#0A0A0F', padding: '0.8rem', borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Sauvegarde...' : editCandidate ? '✓ Sauvegarder' : '+ Ajouter'}
                  </button>
                  <button type="button" onClick={() => { setShowAddForm(false); setEditCandidate(null) }} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#8A8799', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Candidates list */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {candidates.map(c => (
              <div key={c.id} style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {c.photo_url
                    ? <Image src={c.photo_url} alt={c.name} fill style={{ objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', background: '#12121A' }}>{c.category === 'miss' ? '👸' : '🤴'}</div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8A8799' }}>{c.promotion}</div>
                  <span style={{ fontSize: '0.72rem', color: c.category === 'miss' ? '#D4547A' : '#4A8FD4', background: c.category === 'miss' ? 'rgba(212,84,122,0.15)' : 'rgba(74,143,212,0.15)', padding: '0.2rem 0.6rem', borderRadius: '50px', marginTop: '0.3rem', display: 'inline-block' }}>
                    {c.category === 'miss' ? '♛ Miss' : '♚ Master'}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>{c.vote_count}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8A8799' }}>votes</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(c)} style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}>
                    ✏️ Modifier
                  </button>
                  <button onClick={() => handleDelete(c)} style={{ background: 'rgba(224,82,82,0.15)', border: '1px solid rgba(224,82,82,0.3)', color: '#E05252', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}>
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Paramètres du concours</h2>

          <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#C9A84C', marginBottom: '1rem', fontSize: '1rem' }}>📅 Dates du concours</h3>
            <div style={{ display: 'grid', gap: '0.7rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#8A8799' }}>Début des votes</span>
                <span style={{ color: '#F0EDE6' }}>{CONTEST_CONFIG.voteStartDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0' }}>
                <span style={{ color: '#8A8799' }}>Fin des votes</span>
                <span style={{ color: '#F0EDE6' }}>{CONTEST_CONFIG.voteEndDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#5A5770', marginTop: '1rem', lineHeight: 1.5 }}>
              Pour modifier ces dates, changez les variables NEXT_PUBLIC_VOTE_START_DATE et NEXT_PUBLIC_VOTE_END_DATE dans Vercel → Settings → Environment Variables, puis redéployez.
            </p>
          </div>

          {/* DANGER ZONE */}
          <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ color: '#E05252', marginBottom: '0.5rem', fontSize: '1rem' }}>🚨 Zone Danger — Réinitialisation</h3>
            <p style={{ color: '#8A8799', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              Supprimer <strong style={{ color: '#F0EDE6' }}>tous les candidats et tous les votes</strong> pour repartir à zéro l'année prochaine.
              Cette action est <strong style={{ color: '#E05252' }}>irréversible</strong>.
            </p>
            {!showReset ? (
              <button onClick={() => setShowReset(true)}
                style={{ background: 'transparent', border: '1px solid rgba(224,82,82,0.5)', color: '#E05252', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>
                🗑 Réinitialiser toutes les données
              </button>
            ) : (
              <div>
                <p style={{ color: '#E05252', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ⚠️ Êtes-vous certain ? Cette action supprimera {candidates.length} candidats et {stats.total} votes.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleReset}
                    style={{ background: '#E05252', border: 'none', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                    Oui, tout supprimer
                  </button>
                  <button onClick={() => setShowReset(false)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#8A8799', padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
