'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, Plus, Trash2, Clock, Calendar } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const [isSequential, setIsSequential] = useState(false)
  const [expiresInDays, setExpiresInDays] = useState<number | ''>(7)
  const [reminderIntervalDays, setReminderIntervalDays] = useState<number>(2)


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
          submitters: submitters
            .filter(s => s.email && s.name)
            .map((s, index) => ({ ...s, position: index })),
          message,
          is_sequential: isSequential,
          expires_in_days: expiresInDays || null,
          reminder_interval_days: reminderIntervalDays,
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-burgundy-50 border border-burgundy-100 rounded-2xl mb-6">
                  <div>
                    <h3 className="font-bold text-navy-900 flex items-center gap-2">
                       🔄 Signature Séquentielle
                    </h3>
                    <p className="text-xs text-navy-700 opacity-70">
                      Les signataires recevront l'invitation l'un après l'autre, dans l'ordre de la liste.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-burgundy-200">
                    <span className="text-xs font-bold uppercase tracking-widest text-burgundy-800">
                      {isSequential ? 'Activée' : 'Désactivée'}
                    </span>
                    <input 
                      type="checkbox" 
                      className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-burgundy-600 transition-all cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-all checked:before:left-5.5"
                      checked={isSequential}
                      onChange={(e) => setIsSequential(e.target.checked)}
                    />
                  </div>
                </div>

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

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <div className="space-y-2">
                  <Label className="text-navy-800 font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-burgundy-600" />
                    Expiration du document (jours)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="7 (aucune = illimité)"
                    className="rounded-xl border-gray-200 h-11"
                  />
                  <p className="text-xs text-gray-400 pl-1">Laissez vide pour aucune expiration</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy-800 font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-burgundy-600" />
                    Rappels automatiques (jours)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={reminderIntervalDays}
                    onChange={(e) => setReminderIntervalDays(parseInt(e.target.value) || 2)}
                    placeholder="2"
                    className="rounded-xl border-gray-200 h-11"
                  />
                  <p className="text-xs text-gray-400 pl-1">Par défaut : rappel tous les 2 jours</p>
                </div>
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
