'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignaturePad } from '@/components/signature-pad'
import { DocumentViewer } from '@/components/document-viewer'
import { toast } from 'sonner'
import { CheckCircle, FileText } from 'lucide-react'

export default function SignDocumentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const documentId = params.id as string
  const token = searchParams.get('token')

  const [document, setDocument] = useState<any>(null)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          throw new Error('Document non trouvé')
        }
        const data = await response.json()
        setDocument(data)
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Impossible de charger le document')
      } finally {
        setIsLoading(false)
      }
    }

    if (documentId) {
      fetchDocument()
    }
  }, [documentId])

  const handleSignature = (dataUrl: string) => {
    setSignature(dataUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signature) {
      toast.error('Veuillez apposer votre signature')
      return
    }

    if (!signerName.trim() || !signerEmail.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setIsSigning(true)

    try {
      const response = await fetch('/api/signatures/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          signerName,
          signerEmail,
          signature,
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la signature')
      }

      // Envoyer une notification par email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'signature-completed',
          to: document.owner_email || 'owner@example.com', // Email du propriétaire
          recipientName: 'Propriétaire',
          documentName: document.name,
          submitterName: signerName,
          downloadUrl: `${window.location.origin}/documents/${documentId}`,
        }),
      })

      setSigned(true)
      toast.success('Document signé avec succès !')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Document non trouvé</h2>
            <p className="text-muted-foreground">
              Le document que vous cherchez n'existe pas ou a été supprimé.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (signed) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Document signé avec succès !</h2>
            <p className="text-muted-foreground mb-6">
              Votre signature a été enregistrée. Le propriétaire du document a été notifié.
            </p>
            <Button onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Signer le document</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visualisation du document */}
          <Card>
            <CardHeader>
              <CardTitle>{document.name}</CardTitle>
              <CardDescription>
                Veuillez lire attentivement le document avant de le signer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.file_url && (
                <DocumentViewer url={document.file_url} width={500} />
              )}
            </CardContent>
          </Card>

          {/* Formulaire de signature */}
          <Card>
            <CardHeader>
              <CardTitle>Apposer votre signature</CardTitle>
              <CardDescription>
                Remplissez les informations et signez dans le cadre ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="jean.dupont@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Signature *</Label>
                  <SignaturePad onSave={handleSignature} width={450} height={200} />
                  {signature && (
                    <p className="text-sm text-green-600">✓ Signature enregistrée</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSigning || !signature}>
                    {isSigning ? 'Signature en cours...' : 'Signer le document'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  En signant ce document, vous acceptez que votre signature électronique 
                  a la même valeur légale qu'une signature manuscrite.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
