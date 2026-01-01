import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { to, type, ...params } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Le destinataire est obligatoire' },
        { status: 400 }
      )
    }

    let result
    
    switch (type) {
      case 'test':
      case 'custom':
        result = await EmailService.sendTestEmail(to)
        break
        
      case 'signature-request':
        if (!params.recipientName || !params.senderName || !params.documentName || !params.signatureUrl) {
          return NextResponse.json(
            { error: 'Tous les paramètres sont requis pour une demande de signature' },
            { status: 400 }
          )
        }
        result = await EmailService.sendSignatureRequest({
          to,
          ...params
        })
        break
        
      case 'signature-completed':
        if (!params.recipientName || !params.documentName || !params.submitterName) {
          return NextResponse.json(
            { error: 'Tous les paramètres sont requis pour une notification de signature' },
            { status: 400 }
          )
        }
        result = await EmailService.sendSignatureCompleted({
          to,
          ...params
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Type d\'email non pris en charge' },
          { status: 400 }
        )
    }

    if (!result.success) {
      console.error('Erreur Supabase Email:', result.error)
      return NextResponse.json(
        { error: result.error?.message || "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Erreur inattendue:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
