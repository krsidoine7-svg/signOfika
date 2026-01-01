'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function SendSignatureRequest({ documentId, documentName }: { documentId: string; documentName: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsLoading(true)

    try {
      // Générer une URL de signature unique (à implémenter)
      const signatureUrl = `${window.location.origin}/sign/${documentId}?token=unique-token`
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'signature-request',
          to: email,
          recipientName: name,
          senderName: 'Vous', // Remplacer par le nom de l'utilisateur connecté
          documentName: documentName,
          signatureUrl: signatureUrl,
          message: message || `Veuillez signer le document "${documentName}"`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande')
      }

      toast.success(`Une demande de signature a été envoyée à ${email}`)

      // Réinitialiser le formulaire
      setEmail('')
      setName('')
      setMessage('')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Demander une signature</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du signataire *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email du signataire *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean.dupont@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message (optionnel)</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Veuillez signer ce document dès que possible."
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Envoi en cours...' : 'Envoyer la demande de signature'}
        </Button>
      </form>
    </div>
  )
}
