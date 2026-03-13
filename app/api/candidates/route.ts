import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/config'

// GET - list all candidates
export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.from('candidates').select('*').order('vote_count', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST - create candidate (admin only)
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const { name, description, category, promotion, photo_url } = body
  if (!name || !category) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const { data, error } = await supabase.from('candidates')
    .insert({ name, description, category, promotion, photo_url: photo_url || null, vote_count: 0 })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
