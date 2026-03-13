'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { isContestEnded } from '@/lib/config'
import type { Candidate } from '@/lib/types'
import Image from 'next/image'

export default function ResultatsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const ended = isContestEnded()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('candidates').select('*').order('vote_count', { ascending: false })
      setCandidates(data || [])
      setLoading(false)
    }
    fetch()
    const channel = supabase.channel('results-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const miss = candidates.filter(c => c.category === 'miss')
  const master = candidates.filter(c => c.category === 'master')
  const totalVotes = candidates.reduce((s, c) => s + c.vote_count, 0)

  const medals = ['🥇', '🥈', '🥉']

  const ResultSection = ({ title, list, color }: { title: string; list: Candidate[]; color: string }) => {
    const maxV = Math.max(...list.map(c => c.vote_count), 1)
    return (
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ color }}>{title}</span>
        </h2>

        {ended && list[0] && (
          <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, border: `1px solid ${color}55`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${color}`, flexShrink: 0 }}>
              {list[0].photo_url
                ? <Image src={list[0].photo_url} alt={list[0].name} fill style={{ objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: '#12121A' }}>{color === '#D4547A' ? '👸' : '🤴'}</div>
              }
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color, marginBottom: '0.3rem' }}>🏆 Gagnant(e)</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 900 }}>{list[0].name}</div>
              <div style={{ fontSize: '0.8rem', color: '#8A8799' }}>{list[0].vote_count} votes</div>
            </div>
          </div>
        )}

        {list.map((c, i) => {
          const pct = Math.round((c.vote_count / maxV) * 100)
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: i === 0 ? `linear-gradient(135deg, ${color}12, #1A1A26)` : '#1A1A26', border: `1px solid ${i === 0 ? color + '44' : 'rgba(201,168,76,0.12)'}`, borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '0.8rem' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', minWidth: '36px', textAlign: 'center', color: i === 0 ? '#C9A84C' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#8A8799' }}>
                {medals[i] || `#${i + 1}`}
              </span>
              <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(201,168,76,0.2)`, flexShrink: 0 }}>
                {c.photo_url
                  ? <Image src={c.photo_url} alt={c.name} fill style={{ objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#12121A' }}>{color === '#D4547A' ? '👸' : '🤴'}</div>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#8A8799' }}>{c.promotion}</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', marginTop: '0.4rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '10px', transition: 'width 1s ease' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '70px' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color }}>{c.vote_count}</div>
                <div style={{ fontSize: '0.7rem', color: '#8A8799' }}>{pct}%</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, background: 'linear-gradient(135deg, #E8C97A, #C9A84C, #9A7A30)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {ended ? '🏆 Résultats Officiels' : '📊 Classement en direct'}
        </h1>
        <p style={{ color: '#8A8799', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {ended ? 'Le concours est terminé' : 'Mis à jour en temps réel'} · {totalVotes} votes au total
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#8A8799' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Chargement...</p>
        </div>
      ) : (
        <>
          <ResultSection title="♛ Miss IAI" list={miss} color="#D4547A" />
          <ResultSection title="♚ Master IAI" list={master} color="#4A8FD4" />
        </>
      )}
    </div>
  )
}
