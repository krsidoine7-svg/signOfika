import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { submitterId, signature, slug } = await request.json()

    if (!signature) {
      return NextResponse.json(
        { error: 'La signature est obligatoire' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Récupérer le submitter par slug ou ID
    let submitter
    if (slug) {
      const { data, error } = await supabase
        .from('submitters')
        .select('*, submission:submissions(*)')
        .eq('slug', slug)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Signataire non trouvé' },
          { status: 404 }
        )
      }
      submitter = data
    } else if (submitterId) {
      const { data, error } = await supabase
        .from('submitters')
        .select('*, submission:submissions(*)')
        .eq('id', submitterId)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Signataire non trouvé' },
          { status: 404 }
        )
      }
      submitter = data
    } else {
      return NextResponse.json(
        { error: 'ID ou slug du signataire requis' },
        { status: 400 }
      )
    }

    // Vérifier si déjà signé
    if (submitter.status === 'completed') {
      return NextResponse.json(
        { error: 'Vous avez déjà signé ce document' },
        { status: 400 }
      )
    }

    // Téléverser la signature dans le stockage
    const signatureFileName = `signatures/${submitter.submission_id}/${submitter.id}.png`
    
    // Convertir la data URL en blob
    const base64Data = signature.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(signatureFileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Erreur lors du téléversement de la signature:', uploadError)
      throw new Error('Erreur lors de l\'enregistrement de la signature')
    }

    // Récupérer l'URL publique de la signature
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(signatureFileName)

    // Mettre à jour le submitter avec la signature
    const { data: updatedSubmitter, error: updateError } = await supabase
      .from('submitters')
      .update({
        status: 'completed',
        signature_url: publicUrl,
        completed_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .eq('id', submitter.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du signataire:', updateError)
      // Essayer de supprimer le fichier téléversé en cas d'échec
      await supabase.storage.from('documents').remove([signatureFileName])
      throw new Error('Erreur lors de l\'enregistrement de la signature')
    }

    // Vérifier si tous les signataires ont signé
    const { data: allSubmitters } = await supabase
      .from('submitters')
      .select('status')
      .eq('submission_id', submitter.submission_id)

    const allCompleted = allSubmitters?.every(s => s.status === 'completed')

    // Si tous ont signé, mettre à jour le statut de la submission
    if (allCompleted) {
      await supabase
        .from('submissions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', submitter.submission_id)
    }

    // Envoyer les emails de notification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Récupérer les infos complètes pour les emails
    const { data: submission } = await supabase
      .from('submissions')
      .select('*, template:templates(name), user:profiles(email, full_name)')
      .eq('id', submitter.submission_id)
      .single()

    // Email de confirmation au signataire
    try {
      await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: submitter.email,
          type: 'signature-completed',
          recipientName: submitter.name,
          documentName: submission?.template?.name || 'Document',
          submitterName: submitter.name,
          downloadUrl: `${appUrl}/submissions/${submitter.submission_id}`
        })
      })
      console.log(`📧 Email de confirmation envoyé à ${submitter.email}`)
    } catch (error) {
      console.error('Erreur envoi email signataire:', error)
    }

    // Si tous ont signé, notifier le créateur
    if (allCompleted && submission?.user) {
      try {
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: submission.user.email,
            type: 'signature-completed',
            recipientName: submission.user.full_name || submission.user.email,
            documentName: submission.template?.name || 'Document',
            submitterName: 'Tous les signataires',
            downloadUrl: `${appUrl}/submissions/${submitter.submission_id}`
          })
        })
        console.log(`📧 Email de notification envoyé au créateur ${submission.user.email}`)
      } catch (error) {
        console.error('Erreur envoi email créateur:', error)
      }
    }

    return NextResponse.json({
      success: true,
      submitter: updatedSubmitter,
    })
  } catch (error) {
    console.error('Erreur lors de la création de la signature:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
