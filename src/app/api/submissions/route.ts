import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(name),
      submitters(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submissions })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { template_id, submitters } = body

  const slug = generateSlug()

  // Create submission
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .insert({
      template_id,
      slug,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (submissionError) {
    return NextResponse.json({ error: submissionError.message }, { status: 500 })
  }

  // Create submitters
  if (submitters && submitters.length > 0) {
    const submittersData = submitters.map((s: any, index: number) => ({
      submission_id: submission.id,
      email: s.email,
      name: s.name,
      slug: generateSlug(),
      role: s.role || 'signer',
      position: index,
    }))

    const { error: submittersError } = await supabase
      .from('submitters')
      .insert(submittersData)

    if (submittersError) {
      return NextResponse.json({ error: submittersError.message }, { status: 500 })
    }

    // Récupérer le nom du template pour les emails
    const { data: template } = await supabase
      .from('templates')
      .select('name')
      .eq('id', template_id)
      .single()

    // Envoyer les emails d'invitation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    for (const submitterData of submittersData) {
      try {
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: submitterData.email,
            type: 'signature-request',
            recipientName: submitterData.name,
            senderName: user.email || 'SignOfika',
            documentName: template?.name || 'Document',
            signatureUrl: `${appUrl}/s/${submitterData.slug}`
          })
        })
        console.log(`📧 Email envoyé à ${submitterData.email}`)
      } catch (error) {
        console.error('Erreur envoi email:', error)
        // On continue même si l'email échoue
      }
    }
  }

  return NextResponse.json({ submission }, { status: 201 })
}
