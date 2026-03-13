'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Candidate } from '@/lib/types'
import CandidateCard from '@/components/CandidateCard'
import CandidateModal from '@/components/CandidateModal'
import Countdown from '@/components/Countdown'

type Filter = 'all' | 'miss' | 'master'

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('vote_count', { ascending: false })
    setCandidates(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCandidates()
    // Real-time subscription
    const channel = supabase
      .channel('candidates-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetchCandidates)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCandidates])

  const filtered = filter === 'all' ? candidates : candidates.filter(c => c.category === filter)
  const maxVotes = Math.max(...candidates.map(c => c.vote_count), 1)

  const handleVoteSuccess = (candidateId: string) => {
    setCandidates(prev => prev.map(c =>
      c.id === candidateId ? { ...c, vote_count: c.vote_count + 1 } : c
    ))
  }

  const filters: { key: Filter; label: string; color: string }[] = [
    { key: 'all', label: '✦ Tous', color: '#C9A84C' },
    { key: 'miss', label: '♛ Miss IAI', color: '#D4547A' },
    { key: 'master', label: '♚ Master IAI', color: '#4A8FD4' },
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Countdown />

      {/* Filter tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '0.6rem 1.8rem', borderRadius: '50px', fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', letterSpacing: '1px',
              border: `2px solid ${f.color}`,
              background: filter === f.key ? f.color : 'transparent',
              color: filter === f.key ? (f.key === 'all' ? '#0A0A0F' : 'white') : f.color,
              transition: 'all 0.25s',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ textAlign: 'center', color: '#8A8799', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '1px' }}>
        {filtered.length} candidat{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? `en ${filter === 'miss' ? 'Miss' : 'Master'}` : 'au total'}
      </p>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8799' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'float 1.5s ease-in-out infinite' }}>👑</div>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8799', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: '20px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</p>
          <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Aucun candidat pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filtered.map(c => (
            <CandidateCard key={c.id} candidate={c} maxVotes={maxVotes} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <CandidateModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onVoteSuccess={(id) => { handleVoteSuccess(id); setSelected(null) }}
        />
      )}
    </div>
  )
}
