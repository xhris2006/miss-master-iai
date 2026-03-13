'use client'
import Image from 'next/image'
import type { Candidate } from '@/lib/types'

interface Props {
  candidate: Candidate
  maxVotes: number
  onClick: () => void
}

export default function CandidateCard({ candidate, maxVotes, onClick }: Props) {
  const pct = maxVotes > 0 ? Math.round((candidate.vote_count / maxVotes) * 100) : 0
  const isMiss = candidate.category === 'miss'

  return (
    <div onClick={onClick} className="card-hover cursor-pointer animate-fade-up"
      style={{ background: '#1A1A26', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '20px', overflow: 'hidden' }}>

      {/* Photo */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        {candidate.photo_url ? (
          <Image src={candidate.photo_url} alt={candidate.name} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }}
            className="hover:scale-105" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'linear-gradient(135deg, #20202E, #12121A)' }}>
            {isMiss ? '👸' : '🤴'}
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.8) 0%, transparent 50%)' }} />

        {/* Category badge */}
        <span style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: isMiss ? 'rgba(212,84,122,0.9)' : 'rgba(74,143,212,0.9)',
          color: 'white', padding: '0.3rem 0.8rem', borderRadius: '50px',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase'
        }}>
          {isMiss ? 'Miss' : 'Master'}
        </span>

        {/* Vote count */}
        <span style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(10,10,15,0.85)', border: '1px solid rgba(201,168,76,0.5)',
          color: '#C9A84C', padding: '0.3rem 0.7rem', borderRadius: '50px',
          fontSize: '0.8rem', fontWeight: 600
        }}>
          🗳 {candidate.vote_count}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.2rem 1.4rem 1.5rem' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem' }}>
          {candidate.name}
        </h3>
        {candidate.promotion && (
          <p style={{ fontSize: '0.75rem', color: '#C9A84C', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500, marginBottom: '0.6rem' }}>
            {candidate.promotion}
          </p>
        )}
        <p style={{ fontSize: '0.82rem', color: '#8A8799', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {candidate.description}
        </p>

        {/* Vote bar */}
        <div style={{ marginTop: '1rem', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: '10px', transition: 'width 1s ease',
            background: isMiss
              ? 'linear-gradient(90deg, #D4547A, #e87fa0)'
              : 'linear-gradient(90deg, #4A8FD4, #7ab8f5)'
          }} />
        </div>
        <p style={{ fontSize: '0.7rem', color: '#8A8799', marginTop: '0.4rem', textAlign: 'right' }}>{pct}% des votes</p>
      </div>
    </div>
  )
}
