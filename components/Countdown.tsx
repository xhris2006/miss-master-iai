'use client'
import { useEffect, useState } from 'react'
import { CONTEST_CONFIG, isVotingOpen, isContestEnded } from '@/lib/config'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const calc = () => {
      const now = new Date().getTime()
      const end = CONTEST_CONFIG.voteEndDate.getTime()
      const diff = Math.max(0, end - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [])

  if (!mounted) return null

  if (isContestEnded()) {
    return (
      <div className="text-center my-6 mx-auto max-w-2xl px-4"
        style={{ background: 'linear-gradient(135deg, rgba(224,82,82,0.12), rgba(224,82,82,0.05))', border: '1px solid rgba(224,82,82,0.4)', borderRadius: '14px', padding: '1rem 2rem' }}>
        <p style={{ color: '#E05252', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
          🏆 Le concours est terminé — Découvrez les gagnants !
        </p>
      </div>
    )
  }

  if (!isVotingOpen()) {
    return (
      <div className="text-center my-6 mx-auto max-w-2xl px-4"
        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '14px', padding: '1rem 2rem' }}>
        <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.85rem' }}>
          Les votes n'ont pas encore commencé
        </p>
      </div>
    )
  }

  return (
    <div className="text-center my-6 mx-auto max-w-lg px-4"
      style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '14px', padding: '1.2rem 2rem' }}>
      <p style={{ color: '#8A8799', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
        Fin des votes dans
      </p>
      <div className="flex justify-center gap-6 items-center">
        {[
          { val: timeLeft.days, label: 'Jours' },
          { val: timeLeft.hours, label: 'Heures' },
          { val: timeLeft.minutes, label: 'Minutes' },
          { val: timeLeft.seconds, label: 'Secondes' },
        ].map((unit, i) => (
          <div key={i} className="text-center">
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>
              {pad(unit.val)}
            </div>
            <div style={{ fontSize: '0.6rem', color: '#8A8799', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
