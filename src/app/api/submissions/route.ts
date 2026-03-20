import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { logAuditEvent } from '@/lib/audit'


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
  const { template_id, submitters, is_sequential = false, expires_in_days, reminder_interval_days } = body


  const slug = generateSlug()

    // Get template reminder settings and user branding
    const { data: template } = await supabase
      .from('templates')
      .select('name, reminder_interval_days')
      .eq('id', template_id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_color, brand_logo_url, company_url, full_name')
      .eq('id', user.id)
      .single()


    const intervalDays = reminder_interval_days || template?.reminder_interval_days || 2
    const nextReminderAt = new Date()
    nextReminderAt.setDate(nextReminderAt.getDate() + intervalDays)

    // Calcul de la date d'expiration si spécifiée
    let expiresAt: string | null = null
    if (expires_in_days && parseInt(expires_in_days) > 0) {
      const expDate = new Date()
      expDate.setDate(expDate.getDate() + parseInt(expires_in_days))
      expiresAt = expDate.toISOString()
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        template_id,
        slug,
        user_id: user.id,
        status: 'pending',
        reminder_interval_days: intervalDays,
        next_reminder_at: nextReminderAt.toISOString(),
        is_sequential: !!is_sequential,
        expires_at: expiresAt,
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

    // Le nom du template a déjà été récupéré ci-dessus


    // Envoyer les emails d'invitation
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Si séquentiel, on n'envoie qu'au premier signataire (position 0)
    const submittersToNotify = is_sequential && submittersData.length > 0
      ? [submittersData.sort((a: any, b: any) => a.position - b.position)[0]]
      : submittersData

    for (const submitterData of submittersToNotify) {

      try {
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: submitterData.email,
            type: 'signature-request',
            recipientName: submitterData.name,
            senderName: profile?.full_name || user.email || 'SignOfika',
            documentName: template?.name || 'Document',
            signatureUrl: `${appUrl}/s/${submitterData.slug}`,
            brandLogoUrl: profile?.brand_logo_url,
            companyUrl: profile?.company_url,
            brandColor: profile?.brand_color,
          })

        })
        await logAuditEvent({
          event_type: 'email_sent',
          submission_id: submission.id,
          user_id: user.id,
          event_data: {
            to: submitterData.email,
            recipientName: submitterData.name,
            type: 'signature-request'
          },
          request
        })
        console.log(`📧 Email envoyé à ${submitterData.email}`)
      } catch (error) {
        console.error('Erreur envoi email:', error)
      }
    }
  }

  // Log final creation
  await logAuditEvent({
    event_type: 'submission_created',
    submission_id: submission.id,
    user_id: user.id,
    event_data: {
      template_id,
      submitter_count: submitters?.length || 0
    },
    request
  })

  return NextResponse.json({ submission }, { status: 201 })
}

