'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function NewDocumentPage() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Définir le nom du fichier comme nom par défaut
      if (!name) {
        setName(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    if (!name.trim()) {
      toast.error('Veuillez entrer un nom pour le document')
      return
    }

    setIsLoading(true)

    try {
      // 1. Téléverser le fichier vers le stockage Supabase
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du téléversement du document')
      }

      // Rediriger vers la page du document
      router.push(`/documents/${data.documentId}`)
      
      toast.success('Votre document a été ajouté avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nouveau document</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Importer un document</CardTitle>
            <CardDescription>
              Téléchargez un document pour commencer à collecter des signatures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document">Document (PDF uniquement)</Label>
                <Input
                  id="document"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Formats acceptés : .pdf (taille max : 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom du document</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Contrat de travail"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={!file || isLoading}>
                  {isLoading ? 'Téléversement...' : 'Créer le document'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
