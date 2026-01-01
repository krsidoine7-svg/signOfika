'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, Plus, Trash2 } from 'lucide-react'

interface Submitter {
  email: string
  name: string
}

export default function SendTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [submitters, setSubmitters] = useState<Submitter[]>([{ email: '', name: '' }])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTemplate()
  }, [resolvedParams.id])

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSubmitter = () => {
    setSubmitters([...submitters, { email: '', name: '' }])
  }

  const removeSubmitter = (index: number) => {
    if (submitters.length > 1) {
      setSubmitters(submitters.filter((_, i) => i !== index))
    }
  }

  const updateSubmitter = (index: number, field: 'email' | 'name', value: string) => {
    const updated = [...submitters]
    updated[index][field] = value
    setSubmitters(updated)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: resolvedParams.id,
          submitters: submitters.filter(s => s.email && s.name),
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du document')
      }

      router.push('/submissions')
    } catch (err: any) {
      setError(err.message)
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-navy-900 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux templates
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900">Envoyer le document à signer</CardTitle>
            <CardDescription className="text-gray-600">
              Template : <span className="font-semibold">{template?.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Submitters Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-navy-900">Signataires</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubmitter}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un signataire
                  </Button>
                </div>

                {submitters.map((submitter, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-navy-900 block mb-2">
                            Nom complet *
                          </label>
                          <Input
                            type="text"
                            placeholder="Jean Dupont"
                            value={submitter.name}
                            onChange={(e) => updateSubmitter(index, 'name', e.target.value)}
                            required
                            className="bg-white border-gray-300 text-navy-900"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-navy-900 block mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            placeholder="jean.dupont@exemple.com"
                            value={submitter.email}
                            onChange={(e) => updateSubmitter(index, 'email', e.target.value)}
                            required
                            className="bg-white border-gray-300 text-navy-900"
                          />
                        </div>
                      </div>
                      {submitters.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubmitter(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Section */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-navy-900 block">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-navy-900 ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Bonjour, merci de bien vouloir signer ce document..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sending ? 'Envoi en cours...' : 'Envoyer pour signature'}
                </Button>
                <Link href="/templates" className="flex-1">
                  <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
  )
}
