'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadPDFButtonProps {
  submissionId: string
  isCompleted: boolean
}

export function DownloadPDFButton({ submissionId, isCompleted }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)

      // Générer le PDF d'abord
      const generateResponse = await fetch(`/api/submissions/${submissionId}/generate-pdf`, {
        method: 'POST',
      })

      if (!generateResponse.ok) {
        const error = await generateResponse.json()
        throw new Error(error.error || 'Erreur lors de la génération du PDF')
      }

      // Télécharger le PDF
      window.open(`/api/submissions/${submissionId}/download`, '_blank')
      
      toast.success('PDF signé téléchargé avec succès !')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors du téléchargement')
    } finally {
      setLoading(false)
    }
  }

  if (!isCompleted) {
    return null
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Télécharger le PDF signé
        </>
      )}
    </Button>
  )
}
