'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestEmailPage() {
  const [email, setEmail] = useState('krsidoine@gmail.com') // Pré-rempli avec votre email
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const sendTestEmail = async () => {
    if (!email) {
      setResult('Veuillez entrer une adresse email')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          to: email,
          subject: 'Test depuis SignOfika',
          title: 'Email de test',
          content: 'Ceci est un email de test envoyé depuis SignOfika. Si vous recevez cet email, cela signifie que la configuration fonctionne correctement !',
          buttonText: 'Accéder à SignOfika',
          buttonUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult('✅ Email envoyé avec succès ! Vérifiez votre boîte de réception.')
      } else {
        setResult(`❌ Erreur: ${data.error || 'Une erreur est survenue'}`)
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const sendSignatureRequestTest = async () => {
    if (!email) {
      setResult('Veuillez entrer une adresse email')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'signature-request',
          to: email,
          subject: 'Demande de signature - Document test',
          recipientName: 'Utilisateur Test',
          senderName: 'Équipe SignOfika',
          documentName: 'Contrat de test',
          signatureUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/s/test-slug`
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult('✅ Email de demande de signature envoyé avec succès !')
      } else {
        setResult(`❌ Erreur: ${data.error || 'Une erreur est survenue'}`)
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const sendTest = async () => {
    if (!email) {
      setResult('Veuillez entrer une adresse email')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(`✅ Email envoyé avec succès à ${email}`)
      } else {
        setResult(`❌ Erreur: ${data.error}`)
      }
    } catch (error: any) {
      setResult(`❌ Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              ← Retour au tableau de bord
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900">📧 Tester l'envoi d'emails</CardTitle>
            <CardDescription className="text-gray-600">
              Testez l'envoi d'emails via Resend avec React Email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-navy-900">
                Adresse email de test
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300 text-navy-900"
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={sendTestEmail}
                disabled={loading}
                className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer un email de test'}
              </Button>

              <Button
                onClick={sendSignatureRequestTest}
                disabled={loading}
                variant="outline"
                className="w-full border-burgundy-600 text-burgundy-600 hover:bg-burgundy-50"
              >
                {loading ? 'Envoi en cours...' : 'Tester demande de signature'}
              </Button>
            </div>

            {result && (
              <div className={`mt-4 p-4 rounded-lg ${
                result.includes('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Configuration Resend :</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• RESEND_API_KEY dans .env.local</li>
                <li>• Inscrivez-vous sur <strong>resend.com</strong> (gratuit)</li>
                <li>• Gratuit jusqu'à 3000 emails/mois</li>
                <li>• Templates React Email professionnels</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Mode test Resend :</h3>
              <p className="text-xs text-yellow-800">
                Avec un compte Resend gratuit, vous ne pouvez envoyer des emails qu'à votre propre adresse (krsidoine@gmail.com). 
                Pour envoyer à d'autres destinataires, vérifiez un domaine sur resend.com/domains.
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-900 mb-2">✨ Prévisualiser les templates :</h3>
              <p className="text-xs text-green-800 mb-2">
                Pour voir vos templates d'emails en temps réel :
              </p>
              <code className="text-xs bg-white px-2 py-1 rounded border">npm run email</code>
              <p className="text-xs text-green-800 mt-2">
                Puis ouvrez <strong>http://localhost:3001</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
