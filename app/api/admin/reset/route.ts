import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/config'

export async function DELETE() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  // Delete all votes first (foreign key)
  await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  // Delete all candidates
  await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  return NextResponse.json({ success: true, message: 'Toutes les données ont été supprimées. Prêt pour une nouvelle édition !' })
}
