import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { submitterId } = body

    // Get submitter and check if they belong to a submission owned by the user
    const { data: submitter, error: submitterError } = await (supabase as any)
      .from('submitters')
      .select('*, submission:submissions(*, template:templates(name))')
      .eq('id', submitterId)
      .single()

    if (submitterError || !submitter) {
      return NextResponse.json({ error: 'Signataire introuvable' }, { status: 404 })
    }

    if (submitter.submission.user_id !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (submitter.status === 'completed') {
      return NextResponse.json({ error: 'Déjà signé' }, { status: 400 })
    }

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await fetch(`${appUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: submitter.email,
        type: 'signature-request',
        recipientName: submitter.name,
        senderName: user.user_metadata?.full_name || user.email || 'SignOfika',
        documentName: submitter.submission.template.name || 'Document',

        signatureUrl: `${appUrl}/s/${submitter.slug}`,
        isReminder: true
      })
    })

    // Log event
    await logAuditEvent({
      event_type: 'email_sent',
      submission_id: submitter.submission_id,
      submitter_id: submitter.id,
      user_id: user.id,
      event_data: {
        type: 'reminder',
        email: submitter.email
      },
      request
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du rappel' }, { status: 500 })
  }
}
