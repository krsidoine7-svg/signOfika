'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Créer le template
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          schema: [],
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du template')
      }

      const { template } = await response.json()

      // 2. Si un fichier est sélectionné, l'uploader
      if (file) {
        toast.info('Upload du PDF en cours...')
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('templateId', template.id)

        const uploadResponse = await fetch('/api/templates/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Erreur lors de l\'upload du fichier')
        }
        
        toast.success('PDF uploadé avec succès !')
      }

      // 3. Rediriger vers l'éditeur
      toast.success('Template créé avec succès !')
      router.push(`/templates/${template.id}/edit`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <Link href="/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux templates
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900">Créer un nouveau template</CardTitle>
            <CardDescription className="text-gray-600">
              Définissez les informations de base pour votre modèle de document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-navy-900">
                  Nom du template *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contrat de travail, NDA, Facture..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-navy-900">
                  Description
                </label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Décrivez l'objectif de ce template..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="file" className="text-sm font-medium text-navy-900">
                  Document PDF (optionnel)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    id="file"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0])
                      }
                    }}
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Cliquez pour uploader
                    </span>
                    <span className="text-gray-600"> ou glissez-déposez</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    {file ? file.name : 'PDF jusqu\'à 10MB'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white"
                >
                  {loading ? 'Création...' : 'Créer le template'}
                </Button>
                <Link href="/templates" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
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
