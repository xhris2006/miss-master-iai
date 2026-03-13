import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isVotingOpen } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

    if (!isVotingOpen()) return NextResponse.json({ error: 'Les votes sont fermés' }, { status: 403 })

    const { candidateId } = await req.json()
    if (!candidateId) return NextResponse.json({ error: 'Candidat manquant' }, { status: 400 })

    // Get candidate
    const { data: candidate, error: cErr } = await supabase
      .from('candidates').select('id, category').eq('id', candidateId).single()
    if (cErr || !candidate) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 })

    // Check already voted in this category
    const { data: alreadyVoted } = await supabase.rpc('has_voted_in_category', {
      p_user_id: user.id,
      p_category: candidate.category,
    })

    if (alreadyVoted) {
      return NextResponse.json({ error: `Vous avez déjà voté dans la catégorie ${candidate.category}` }, { status: 409 })
    }

    // Insert vote
    const { error: vErr } = await supabase.from('votes').insert({ user_id: user.id, candidate_id: candidateId })
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

    // Increment vote count
    const { error: uErr } = await supabase.rpc('increment_vote', { p_candidate_id: candidateId })
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
