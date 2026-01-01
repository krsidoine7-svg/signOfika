import { sendSignatureRequest, sendSignatureCompleted, sendEmail } from './email'

export const EmailService = {
  async sendSignatureRequest(params: {
    to: string
    recipientName: string
    senderName: string
    documentName: string
    signatureUrl: string
  }) {
    return sendSignatureRequest({
      to: params.to,
      signerName: params.recipientName,
      documentName: params.documentName,
      signUrl: params.signatureUrl,
      message: `${params.senderName} vous a envoyé ce document à signer.`,
    })
  },

  async sendSignatureCompleted(params: {
    to: string
    recipientName: string
    documentName: string
    submitterName: string
    downloadUrl?: string
  }) {
    return sendSignatureCompleted({
      to: params.to,
      documentName: params.documentName,
      downloadUrl: params.downloadUrl || '#',
      senderName: params.submitterName,
    })
  },

  async sendTestEmail(to: string) {
    // Envoie un email de test en utilisant le template de signature
    return sendSignatureRequest({
      to,
      signerName: 'Test User',
      documentName: 'Email de Test',
      signUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      message: '✅ Félicitations ! Votre configuration d\'envoi d\'emails avec Resend fonctionne parfaitement. Vous pouvez maintenant envoyer des notifications de signature à vos clients !',
    })
  },
}
