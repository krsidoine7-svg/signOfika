import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Get submitter by slug
  const { data: submitter, error: submitterError } = await supabase
    .from('submitters')
    .select(`
      *,
      submission:submissions(
        *,
        template:templates(name, description, schema, template_documents(file_path)),
        user:profiles(full_name, company_name, brand_color, brand_logo_url)
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single()


  if (submitterError || !submitter) {
    return NextResponse.json({ error: 'Submitter not found' }, { status: 404 })
  }

  // Check if submission is expired
  const submission = submitter.submission
  if (submission && submission.expires_at) {
    const expiresAt = new Date(submission.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Document expired' }, { status: 410 })
    }
  }

  // Log opening event (only if not already completed/declined)
  if (submitter.status === 'pending') {
    await logAuditEvent({
      event_type: 'submission_opened',
      submission_id: submitter.submission_id,
      submitter_id: submitter.id,
      user_id: (submitter.submission as any).user_id,
      event_data: {
        email: submitter.email,
        name: submitter.name
      },
      request
    })


    // Update opened_at 
    await supabase
      .from('submitters')
      .update({ 
        opened_at: new Date().toISOString() 
      })
      .eq('id', submitter.id)
  }


  return NextResponse.json({
    submitter,
    submission: submitter.submission,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()
  const body = await request.json()
  const { signature, fields } = body

  if (!signature) {
    return NextResponse.json({ error: 'Signature required' }, { status: 400 })
  }

  // Get submitter
  const { data: submitter, error: submitterError } = await supabase
    .from('submitters')
    .select('*, submission:submissions(id, user_id, status, is_sequential)')
    .eq('slug', resolvedParams.slug)
    .single()



  if (submitterError || !submitter) {
    return NextResponse.json({ error: 'Submitter not found' }, { status: 404 })
  }

  // Check if already completed
  if (submitter.status === 'completed') {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  }

  // Upload signature to storage
  const signatureBlob = Buffer.from(signature.split(',')[1], 'base64')
  const fileName = `signatures/${submitter.submission_id}/${submitter.id}.png`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, signatureBlob, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  // Update submitter status
  const { error: updateError } = await supabase
    .from('submitters')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      signature_url: urlData.publicUrl,
      values: fields || {},
    })
    .eq('id', submitter.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Log signature completion
  await logAuditEvent({
    event_type: 'signature_completed',
    submission_id: submitter.submission_id,
    submitter_id: submitter.id,
    user_id: (submitter.submission as any).user_id,
    event_data: {
      email: submitter.email,
      name: submitter.name,
      signature_url: urlData.publicUrl
    },
    request
  })



  // Check if all submitters have completed
  const { data: allSubmitters } = await supabase
    .from('submitters')
    .select('status')
    .eq('submission_id', submitter.submission_id)

  const allCompleted = allSubmitters?.every(s => s.status === 'completed')

  // Fetch submission data with full branding info for notifications
  const { data: submissionData } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(name),
      user:profiles(email, full_name, webhook_url, brand_logo_url, brand_color, company_url)
    `)
    .eq('id', submitter.submission_id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (allCompleted) {
    try {
      const { generateSignedPDF } = await import('@/lib/pdf-generator')
      const signedDocUrl = await generateSignedPDF(submitter.submission_id)
      
      if (submissionData) {
        // Envoi au Webhook si configuré
        const webhookUrl = (submissionData.user as any)?.webhook_url
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'document.signed',
                timestamp: new Date().toISOString(),
                submission_id: submitter.submission_id,
                document_name: (submissionData.template as any)?.name,
                status: 'completed',
                download_url: signedDocUrl,
                submitters: allSubmitters
              })
            })
            console.log('🔗 Webhook envoyé avec succès')
          } catch (err) {
            console.error('❌ Erreur envoi webhook:', err)
          }
        }

        // Notify owner
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: (submissionData.user as any)?.email,
            type: 'signature-completed',
            recipientName: (submissionData.user as any)?.full_name || 'Utilisateur',
            documentName: (submissionData.template as any)?.name || 'Document',
            submitterName: submitter.name,
            downloadUrl: `${appUrl}/submissions/${submitter.submission_id}`,
            brandLogoUrl: (submissionData.user as any)?.brand_logo_url,
            companyUrl: (submissionData.user as any)?.company_url,
            brandColor: (submissionData.user as any)?.brand_color,
          })
        })
      }
    } catch (err) {
      console.error('Error in completion logic:', err)
    }
  } else if (submitter.submission.is_sequential) {
    // Si séquentiel, notifier le signataire suivant
    try {
      const { data: nextSubmitter } = await supabase
        .from('submitters')
        .select('*')
        .eq('submission_id', submitter.submission_id)
        .eq('position', (submitter.position || 0) + 1)
        .single()

      if (nextSubmitter && nextSubmitter.status === 'pending') {
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: nextSubmitter.email,
            type: 'signature-request',
            recipientName: nextSubmitter.name,
            senderName: (submissionData?.user as any)?.full_name || 'SignOfika',
            documentName: (submissionData?.template as any)?.name || 'Document',
            signatureUrl: `${appUrl}/s/${nextSubmitter.slug}`,
            brandLogoUrl: (submissionData?.user as any)?.brand_logo_url,
            companyUrl: (submissionData?.user as any)?.company_url,
            brandColor: (submissionData?.user as any)?.brand_color,
          })
        })
        console.log(`➡️ Email envoyé au signataire suivant : ${nextSubmitter.email}`)
      }
    } catch (err) {
      console.error('Erreur notification signataire suivant:', err)
    }
  }

  return NextResponse.json({ success: true })
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { reason = 'Non spécifiée' } = await request.json()

  // Get submitter
  const { data: submitter, error: submitterError } = await (supabase as any)
    .from('submitters')
    .select('*, submission:submissions(id, user_id, template:templates(name))')
    .eq('slug', resolvedParams.slug)
    .single()

  if (submitterError || !submitter) {
    return NextResponse.json({ error: 'Submitter not found' }, { status: 404 })
  }

  // Update submitter status
  const { error: updateError } = await supabase
    .from('submitters')
    .update({
      status: 'declined',
      completed_at: new Date().toISOString(),
      values: { decline_reason: reason }
    })
    .eq('id', submitter.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update submission status
  await supabase
    .from('submissions')
    .update({ status: 'declined' })
    .eq('id', submitter.submission_id)

  // Log audit event
  await logAuditEvent({
    event_type: 'submission_declined',
    submission_id: submitter.submission_id,
    submitter_id: submitter.id,
    event_data: {
      reason,
      email: submitter.email,
      name: submitter.name
    },
    request
  })

  return NextResponse.json({ success: true })
}


