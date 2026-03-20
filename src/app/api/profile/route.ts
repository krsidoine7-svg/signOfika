import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('id, full_name, email, company_name, phone, brand_color, brand_logo_url, webhook_url, company_url')


      .eq('id', user.id)
      .single()


    if (dbError) throw dbError

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, company_name, phone, brand_color, brand_logo_url } = body

    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .update({
        full_name,
        company_name,
        phone,
        brand_color,
        brand_logo_url,
        webhook_url: body.webhook_url,
        company_url: body.company_url,
        updated_at: new Date().toISOString()


      })
      .eq('id', user.id)
      .select()
      .single()


    if (dbError) throw dbError

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}
