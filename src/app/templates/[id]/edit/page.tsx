'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Charger le PdfFieldEditor seulement côté client (pas de SSR)
const PdfFieldEditor = dynamic(
  () => import('@/components/pdf-field-editor').then(mod => ({ default: mod.PdfFieldEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement de l'éditeur...</span>
      </div>
    )
  }
)

interface Field {
  id: string
  type: 'signature' | 'text' | 'date' | 'checkbox'
  page: number
  x: number
  y: number
  width: number
  height: number
  label: string
  required: boolean
}

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    loadTemplate()
  }, [resolvedParams.id])

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
        
        // Get PDF URL
        if (data.template.template_documents?.[0]?.file_path) {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${data.template.template_documents[0].file_path}`
          setPdfUrl(url)
        }
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Erreur lors du chargement du template')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFields = async (fields: Field[]) => {
    try {
      const response = await fetch(`/api/templates/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: fields }),
      })
      if (response.ok) {
        toast.success('Template sauvegardé avec succès !')
        router.push('/templates')
      } else {

        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-burgundy-600" />
          <div className="text-navy-900 dark:text-white text-xl">Chargement du template...</div>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              📄
            </div>
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Pas de PDF</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ce template n'a pas encore de document PDF associé.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>Astuce :</strong> Retournez à la liste des templates et uploadez un PDF lors de la création, ou créez un nouveau template avec un fichier PDF.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/templates">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux templates
              </Button>
            </Link>
            <Link href="/templates/new">
              <Button className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
                Créer un nouveau template
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-6">
          <Link href="/templates">
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-4">{template?.name || 'Template'}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Éditeur de champs PDF avec drag & drop</p>
        </div>

        <PdfFieldEditor
          url={pdfUrl}
          initialFields={template?.schema || []}
          onSave={handleSaveFields}
        />
      </main>
  )
}
