'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Charger le PdfViewer seulement côté client
const PdfViewer = dynamic(
  () => import('@/components/pdf-viewer').then(mod => ({ default: mod.PdfViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-burgundy-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement du PDF...</span>
      </div>
    )
  }
)

interface ClientPdfViewerProps {
  url: string
  showControls?: boolean
  className?: string
  fields?: any[]
}

export function ClientPdfViewer({ url, showControls = true, className = '', fields = [] }: ClientPdfViewerProps) {
  return <PdfViewer url={url} showControls={showControls} className={className} fields={fields} />
}

