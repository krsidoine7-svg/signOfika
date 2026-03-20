'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, FileText, PenTool, Loader2, XCircle } from 'lucide-react'

import SignatureCanvas from '@/components/signature-canvas'
import { ClientPdfViewer } from '@/components/client-pdf-viewer'

export default function SignPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitter, setSubmitter] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [showSignature, setShowSignature] = useState(false)
  const [signatureData, setSignatureData] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [error, setError] = useState('')


  // Form fields
  const [formData, setFormData] = useState<Record<string, any>>({})

  useEffect(() => {
    loadSubmission()
  }, [resolvedParams.slug])

  const loadSubmission = async () => {
    try {
      const response = await fetch(`/api/s/${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setSubmitter(data.submitter)
        setSubmission(data.submission)
        
        // Check if already completed or declined
        if (data.submitter.status === 'completed') {
          setCompleted(true)
        } else if (data.submitter.status === 'declined') {
          setDeclined(true)
        }

        // Initialize form data with defaults
        const schema = data.submission.template.schema || []
        const initialData: Record<string, any> = {}
        schema.forEach((field: any) => {
          if (field.type === 'date' && !initialData[field.id]) {
            initialData[field.id] = new Date().toISOString().split('T')[0]
          }
          if (field.type === 'checkbox' && initialData[field.id] === undefined) {
            initialData[field.id] = false
          }
        })
        setFormData(initialData)

      } else {
        setError('Document introuvable ou expiré')
      }
    } catch (error) {
      console.error('Error loading submission:', error)
      setError('Erreur lors du chargement du document')
    } finally {
      setLoading(false)
    }
  }

  const handleSignatureComplete = (dataUrl: string) => {
    setSignatureData(dataUrl)
    setShowSignature(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signatureData) {
      setError('Veuillez signer le document')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/s/${resolvedParams.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signatureData,
          fields: formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission')
      }

      setCompleted(true)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    const reason = window.prompt('Veuillez indiquer la raison du refus (Optionnel) :')
    if (reason === null) return // Cancelled

    setSubmitting(true)
    try {
      const response = await fetch(`/api/s/${resolvedParams.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Non précisée' })
      })

      if (response.ok) {
        setDeclined(true)
      } else {
        throw new Error('Erreur lors du refus')
      }
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-burgundy-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du document...</p>
        </div>
      </div>
    )
  }

  if (error && !submitter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600">Document introuvable</CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-gray-200 shadow-sm border-t-4 border-t-red-500">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-navy-900 text-2xl">Signature refusée</CardTitle>
            <CardDescription className="text-gray-600">
              Vous avez décliné la signature de ce document. L'émetteur a été informé de votre décision.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (completed) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-gray-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-navy-900 text-2xl">Document signé !</CardTitle>
            <CardDescription className="text-gray-600">
              Merci d'avoir signé le document. Une copie vous a été envoyée par email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: submission?.user?.brand_color || '#800020' }}
            >
              {submission?.user?.brand_logo_url ? (
                <img src={submission.user.brand_logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <PenTool className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900 leading-none">
                {submission?.user?.company_name || 'SignOfika'}
              </h1>
              {submission?.user?.company_name && (
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Powered by SignOfika</span>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900 text-2xl">
              Document à signer
            </CardTitle>
            <CardDescription className="text-gray-600">
              Bonjour <span className="font-semibold">{submitter?.name}</span>, veuillez signer ce document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Template Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5" style={{ color: submission?.user?.brand_color || '#800020' }} />
                  <h3 className="font-semibold text-navy-900">
                    {submission?.template?.name || 'Document'}
                  </h3>

                </div>
                {submission?.template?.description && (
                  <p className="text-sm text-gray-600 ml-8">
                    {submission.template.description}
                  </p>
                )}
              </div>
              {/* Form Fields Section */}
              {submission?.template?.schema && submission.template.schema.filter((f: any) => f.type !== 'signature').length > 0 && (
                <div className="space-y-4 p-4 border border-burgundy-100 bg-burgundy-50/30 rounded-lg">
                  <h3 className="font-semibold text-navy-900 border-b border-burgundy-100 pb-2 mb-4">
                    📋 Informations à compléter
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.template.schema
                      .filter((f: any) => f.type !== 'signature')
                      .map((field: any) => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="text-sm font-medium text-navy-800 flex items-center gap-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {field.type === 'checkbox' ? (
                            <div className="flex items-center space-x-2 py-2">
                              <input
                                type="checkbox"
                                id={field.id}
                                checked={!!formData[field.id]}
                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-burgundy-600 focus:ring-burgundy-500"
                              />
                              <label htmlFor={field.id} className="text-sm text-gray-600">
                                {field.label}
                              </label>
                            </div>
                          ) : (
                            <Input
                              type={field.type === 'date' ? 'date' : 'text'}
                              placeholder={`Saisir ${field.label.toLowerCase()}`}
                              required={field.required}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              className="bg-white border-gray-300 focus:border-burgundy-500"
                            />
                          )}

                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* PDF Viewer */}
              {submission?.template?.template_documents?.[0]?.file_path && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900">
                    📄 Aperçu du document
                  </label>
                  <ClientPdfViewer 
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${submission.template.template_documents[0].file_path}`}
                    showControls={true}
                    fields={submission.template.schema || []}
                  />

                </div>
              )}

              {/* Signature Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-navy-900">
                    Votre signature *
                  </label>
                  {signatureData && !showSignature && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSignature(true)}
                      className="text-burgundy-600 hover:text-burgundy-700 hover:bg-burgundy-50"
                    >
                      Modifier
                    </Button>
                  )}
                </div>

                {showSignature || !signatureData ? (
                  <SignatureCanvas
                    onSave={handleSignatureComplete}
                    onCancel={signatureData ? () => setShowSignature(false) : undefined}
                  />
                ) : (
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <img src={signatureData} alt="Signature" className="max-h-48 mx-auto" />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col md:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !signatureData}
                  className="flex-1 text-white py-6 text-lg font-bold shadow-lg"
                  style={{ backgroundColor: submission?.user?.brand_color || '#800020' }}
                >

                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signature en cours...
                    </>
                  ) : (
                    <>
                      <PenTool className="mr-2 h-5 w-5" />
                      Signer le document
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleDecline}
                  variant="outline"
                  disabled={submitting}
                  className="md:w-1/3 border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-semibold"
                >
                  Désactiver / Refuser
                </Button>
              </div>


              {/* Legal Notice */}
              <p className="text-xs text-gray-500 text-center">
                En signant ce document, vous acceptez que votre signature électronique 
                a la même valeur légale qu'une signature manuscrite.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
