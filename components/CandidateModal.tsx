'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { isVotingOpen, isContestEnded } from '@/lib/config'
import type { Candidate } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface Props {
  candidate: Candidate | null
  onClose: () => void
  onVoteSuccess: (candidateId: string) => void
}

export default function CandidateModal({ candidate, onClose, onVoteSuccess }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!candidate) return
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        // Check if already voted for this category
        const { data: vote } = await supabase
          .from('votes')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('candidate_id', candidate.id)
          .single()
        setHasVoted(!!vote)

        // Check if voted in same category
        if (!vote) {
          const { data: catVote } = await supabase
            .from('votes')
            .select('candidates(category)')
            .eq('user_id', data.user.id)
          const votedCategories = (catVote || []).map((v: any) => v.candidates?.category)
          if (votedCategories.includes(candidate.category)) setHasVoted(true)
        }
      }
    })
  }, [candidate])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!candidate) return null

  const isMiss = candidate.category === 'miss'
  const votingOpen = isVotingOpen()
  const ended = isContestEnded()

  const handleVote = async () => {
    if (!user) { router.push('/connexion'); return }
    if (!votingOpen) return
    setLoading(true)
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors du vote')
      setHasVoted(true)
      onVoteSuccess(candidate.id)
      toast.success(`Vote enregistré pour ${candidate.name} ! 🎉`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getVoteButtonLabel = () => {
    if (loading) return 'Envoi...'
    if (hasVoted) return '✓ Vous avez voté pour cette catégorie'
    if (ended) return '🏁 Concours terminé'
    if (!votingOpen) return '⏳ Votes pas encore ouverts'
    if (!user) return '🔐 Se connecter pour voter'
    return `Voter pour ${candidate.name}`
  }

  const canVote = user && votingOpen && !hasVoted && !loading

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>

      <div style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '24px', maxWidth: '580px', width: '100%', overflow: 'hidden', position: 'relative', animation: 'fadeSlideUp 0.35s ease', margin: 'auto' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          ✕
        </button>

        {/* Photo */}
        <div style={{ position: 'relative', height: '340px' }}>
          {candidate.photo_url ? (
            <Image src={candidate.photo_url} alt={candidate.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', background: 'linear-gradient(135deg, #20202E, #12121A)' }}>
              {isMiss ? '👸' : '🤴'}
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,38,1) 0%, transparent 50%)' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 2rem 2rem' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, color: isMiss ? '#D4547A' : '#4A8FD4' }}>
            {isMiss ? '♛ Miss IAI' : '♚ Master IAI'}
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', fontWeight: 900, margin: '0.3rem 0' }}>
            {candidate.name}
          </h2>
          {candidate.promotion && (
            <p style={{ fontSize: '0.8rem', color: '#C9A84C', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {candidate.promotion}
            </p>
          )}

          <p style={{ fontSize: '0.9rem', color: '#9A97B0', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            {candidate.description}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#12121A', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#C9A84C' }}>
                {candidate.vote_count}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8A8799', letterSpacing: '2px', textTransform: 'uppercase' }}>Votes</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: isMiss ? '#D4547A' : '#4A8FD4' }}>
                {isMiss ? 'Miss' : 'Master'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8A8799', letterSpacing: '2px', textTransform: 'uppercase' }}>Catégorie</div>
            </div>
          </div>

          {/* Vote button */}
          <button
            onClick={canVote ? handleVote : (!user ? () => router.push('/connexion') : undefined)}
            disabled={!!user && (!votingOpen || hasVoted || loading)}
            style={{
              width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
              fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700,
              cursor: canVote || !user ? 'pointer' : 'not-allowed',
              letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s',
              opacity: (user && (!votingOpen || hasVoted)) ? 0.6 : 1,
              background: hasVoted
                ? 'linear-gradient(135deg, #4CAF7D, #2d8a5a)'
                : isMiss
                  ? 'linear-gradient(135deg, #D4547A, #e87fa0)'
                  : 'linear-gradient(135deg, #4A8FD4, #7ab8f5)',
              color: 'white',
            }}>
            {getVoteButtonLabel()}
          </button>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8A8799', marginTop: '0.8rem' }}>
              Vous devez être connecté(e) pour voter
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
