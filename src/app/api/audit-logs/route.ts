import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: events, error: dbError } = await (supabase as any)
      .from('events')
      .select(`
        *,
        submission:submissions(id, template:templates(name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)


    if (dbError) throw dbError

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching global audit logs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    )
  }
}
