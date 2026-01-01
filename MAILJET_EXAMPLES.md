# 📧 Exemples d'utilisation Mailjet

Ce document contient des exemples pratiques pour utiliser Mailjet dans SignOfika.

---

## 🧪 1. Test de configuration

### Via le script de test
```bash
# Tester avec votre email
npm run test:mailjet votre-email@example.com
```

### Via l'API
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "votre-email@example.com",
    "type": "test"
  }'
```

### Via JavaScript/TypeScript
```typescript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'votre-email@example.com',
    type: 'test'
  })
})

const result = await response.json()
console.log(result)
```

---

## 📝 2. Demande de signature

### Dans un composant React
```typescript
'use client'

import { useState } from 'react'
import { EmailService } from '@/lib/email-service'

export function SendSignatureRequest() {
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    setLoading(true)
    
    try {
      const result = await EmailService.sendSignatureRequest({
        to: 'client@example.com',
        recipientName: 'Jean Dupont',
        senderName: 'Marie Martin',
        documentName: 'Contrat de prestation',
        signatureUrl: `${window.location.origin}/sign/abc123`
      })

      if (result.success) {
        alert('Email envoyé avec succès !')
      } else {
        alert('Erreur : ' + result.error?.message)
      }
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Envoi...' : 'Envoyer la demande'}
    </button>
  )
}
```

### Via l'API
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "client@example.com",
    "type": "signature-request",
    "recipientName": "Jean Dupont",
    "senderName": "Marie Martin",
    "documentName": "Contrat de prestation",
    "signatureUrl": "https://app.com/sign/abc123"
  }'
```

### Dans une API Route (Next.js)
```typescript
// app/api/documents/[id]/send-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // Récupérer le document
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
  }

  // Envoyer l'email
  const result = await EmailService.sendSignatureRequest({
    to: document.recipient_email,
    recipientName: document.recipient_name,
    senderName: document.sender_name,
    documentName: document.name,
    signatureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign/${document.slug}`
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: result.data })
}
```

---

## ✅ 3. Notification de signature complétée

### Après la signature d'un document
```typescript
// app/api/submissions/route.ts
import { EmailService } from '@/lib/email-service'

async function notifyDocumentSigned(submission: any) {
  const result = await EmailService.sendSignatureCompleted({
    to: submission.sender_email,
    recipientName: submission.sender_name,
    documentName: submission.document_name,
    submitterName: submission.signer_name,
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/download/${submission.id}`
  })

  if (!result.success) {
    console.error('Erreur envoi notification:', result.error)
  }
  
  return result
}
```

### Via l'API
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "expediteur@example.com",
    "type": "signature-completed",
    "recipientName": "Marie Martin",
    "documentName": "Contrat de prestation",
    "submitterName": "Jean Dupont",
    "downloadUrl": "https://app.com/download/abc123"
  }'
```

---

## 🔄 4. Envoi en masse (Batch)

### Envoyer à plusieurs destinataires
```typescript
async function sendBatchSignatureRequests(recipients: Array<{
  email: string
  name: string
  documentUrl: string
}>) {
  const results = await Promise.allSettled(
    recipients.map(recipient =>
      EmailService.sendSignatureRequest({
        to: recipient.email,
        recipientName: recipient.name,
        senderName: 'Votre Entreprise',
        documentName: 'Document à signer',
        signatureUrl: recipient.documentUrl
      })
    )
  )

  const successful = results.filter(r => r.status === 'fulfilled')
  const failed = results.filter(r => r.status === 'rejected')

  console.log(`✅ ${successful.length} emails envoyés`)
  console.log(`❌ ${failed.length} échecs`)

  return { successful, failed }
}

// Utilisation
const recipients = [
  { email: 'client1@example.com', name: 'Client 1', documentUrl: '/sign/1' },
  { email: 'client2@example.com', name: 'Client 2', documentUrl: '/sign/2' },
  { email: 'client3@example.com', name: 'Client 3', documentUrl: '/sign/3' },
]

await sendBatchSignatureRequests(recipients)
```

---

## 🎨 5. Email personnalisé avec template custom

### Créer un nouveau template
```typescript
// emails/custom-notification.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface CustomNotificationEmailProps {
  userName: string
  message: string
  actionUrl: string
  actionText: string
}

export default function CustomNotificationEmail({
  userName,
  message,
  actionUrl,
  actionText,
}: CustomNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle notification</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bonjour {userName} 👋</Heading>
          <Text style={text}>{message}</Text>
          <Section style={buttonContainer}>
            <Button style={button} href={actionUrl}>
              {actionText}
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px' }
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold' }
const text = { color: '#333', fontSize: '16px', lineHeight: '26px' }
const buttonContainer = { padding: '27px 0 27px' }
const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
}
```

### Utiliser le template custom
```typescript
import { sendEmail } from '@/lib/email'
import CustomNotificationEmail from '@/emails/custom-notification'

async function sendCustomNotification() {
  return sendEmail({
    to: 'client@example.com',
    subject: 'Notification personnalisée',
    react: CustomNotificationEmail({
      userName: 'Jean Dupont',
      message: 'Votre document est prêt à être consulté.',
      actionUrl: 'https://app.com/documents/123',
      actionText: 'Voir le document'
    })
  })
}
```

---

## 🔔 6. Notifications automatiques

### Webhook après signature
```typescript
// app/api/webhooks/signature-completed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  const payload = await request.json()

  // Vérifier la signature du webhook (sécurité)
  // ...

  // Envoyer la notification
  await EmailService.sendSignatureCompleted({
    to: payload.sender_email,
    recipientName: payload.sender_name,
    documentName: payload.document_name,
    submitterName: payload.signer_name,
    downloadUrl: payload.download_url
  })

  return NextResponse.json({ success: true })
}
```

### Rappel automatique (cron job)
```typescript
// app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email-service'

export async function GET() {
  const supabase = createClient()

  // Récupérer les documents en attente depuis plus de 3 jours
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { data: pendingDocs } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', threeDaysAgo.toISOString())

  // Envoyer les rappels
  for (const doc of pendingDocs || []) {
    await EmailService.sendSignatureRequest({
      to: doc.recipient_email,
      recipientName: doc.recipient_name,
      senderName: doc.sender_name,
      documentName: `[RAPPEL] ${doc.name}`,
      signatureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign/${doc.slug}`
    })
  }

  return NextResponse.json({ 
    success: true, 
    sent: pendingDocs?.length || 0 
  })
}
```

---

## 🧪 7. Tests unitaires

### Tester l'envoi d'email
```typescript
// __tests__/email-service.test.ts
import { EmailService } from '@/lib/email-service'

describe('EmailService', () => {
  it('devrait envoyer un email de test', async () => {
    const result = await EmailService.sendTestEmail('test@example.com')
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('devrait envoyer une demande de signature', async () => {
    const result = await EmailService.sendSignatureRequest({
      to: 'client@example.com',
      recipientName: 'Test User',
      senderName: 'Test Sender',
      documentName: 'Test Document',
      signatureUrl: 'https://example.com/sign/test'
    })

    expect(result.success).toBe(true)
  })

  it('devrait gérer les erreurs', async () => {
    const result = await EmailService.sendTestEmail('invalid-email')
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

## 📊 8. Tracking et analytics

### Logger les envois
```typescript
async function sendAndLog(emailData: any) {
  const supabase = createClient()
  
  // Envoyer l'email
  const result = await EmailService.sendSignatureRequest(emailData)

  // Logger dans la base de données
  await supabase.from('email_logs').insert({
    recipient: emailData.to,
    type: 'signature-request',
    status: result.success ? 'sent' : 'failed',
    error: result.error?.message,
    sent_at: new Date().toISOString()
  })

  return result
}
```

---

## 🔐 9. Sécurité et validation

### Valider les emails avant envoi
```typescript
import { z } from 'zod'

const emailSchema = z.object({
  to: z.string().email('Email invalide'),
  recipientName: z.string().min(1, 'Nom requis'),
  senderName: z.string().min(1, 'Expéditeur requis'),
  documentName: z.string().min(1, 'Nom du document requis'),
  signatureUrl: z.string().url('URL invalide')
})

async function sendValidatedEmail(data: unknown) {
  // Valider les données
  const validated = emailSchema.parse(data)
  
  // Envoyer l'email
  return EmailService.sendSignatureRequest(validated)
}
```

---

## 💡 Conseils pratiques

1. **Toujours gérer les erreurs**
   ```typescript
   const result = await EmailService.sendTestEmail(email)
   if (!result.success) {
     console.error('Erreur:', result.error)
     // Gérer l'erreur (retry, notification, etc.)
   }
   ```

2. **Utiliser des variables d'environnement**
   ```typescript
   const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
   ```

3. **Logger les envois importants**
   ```typescript
   console.log(`Email envoyé à ${email} - Type: ${type}`)
   ```

4. **Tester en mode sandbox d'abord**
   - Ajoutez votre email dans Mailjet
   - Testez tous les types d'emails
   - Vérifiez le rendu HTML

5. **Surveiller les statistiques**
   - Consultez https://app.mailjet.com/stats
   - Vérifiez les taux d'ouverture
   - Identifiez les bounces

---

**Besoin d'aide ?** Consultez [MAILJET_SETUP.md](./MAILJET_SETUP.md)
