import { render } from '@react-email/render'
import SignatureRequestEmail from '../../emails/signature-request'
import SignatureCompletedEmail from '../../emails/signature-completed'

// Configuration Mailzeet
const MAILZEET_API_URL = 'https://api.mailzeet.com/v1/mails'
const MAILZEET_API_KEY = process.env.MAILZEET_API_KEY || ''

interface EmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

/**
 * Envoie un email via Mailzeet avec React Email
 */
export async function sendEmail({ to, subject, react }: EmailOptions) {
  try {
    // Convertir le composant React en HTML
    const htmlContent = render(react)

    // Préparer les données pour Mailzeet
    const payload = {
      sender: {
        email: process.env.MAILZEET_SENDER_EMAIL || 'noreply@yourdomain.com',
        name: process.env.MAILZEET_SENDER_NAME || 'SignOfika',
      },
      recipients: [
        {
          email: to,
        },
      ],
      subject: subject,
      html: htmlContent,
    }

    // Envoyer l'email via Mailzeet API
    const response = await fetch(MAILZEET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILZEET_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur Mailzeet:', result)
      return {
        success: false,
        error: {
          message: result.message || 'Erreur lors de l\'envoi',
          statusCode: response.status,
        },
      }
    }

    console.log('✅ Email envoyé avec succès à:', to)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('❌ Erreur Mailzeet:', error)
    return {
      success: false,
      error: {
        message: error.message || 'Erreur inconnue',
        statusCode: error.statusCode,
      },
    }
  }
}

/**
 * Envoie une demande de signature
 */
export async function sendSignatureRequest({
  to,
  signerName,
  documentName,
  signUrl,
  message,
}: {
  to: string
  signerName: string
  documentName: string
  signUrl: string
  message?: string
}) {
  return sendEmail({
    to,
    subject: `📝 Signature requise : ${documentName}`,
    react: SignatureRequestEmail({
      signerName,
      documentName,
      signUrl,
      message,
    }),
  })
}

/**
 * Envoie une notification de signature complétée
 */
export async function sendSignatureCompleted({
  to,
  documentName,
  downloadUrl,
  senderName,
}: {
  to: string
  documentName: string
  downloadUrl: string
  senderName: string
}) {
  return sendEmail({
    to,
    subject: `✅ Document signé : ${documentName}`,
    react: SignatureCompletedEmail({
      documentName,
      downloadUrl,
      senderName,
    }),
  })
}
