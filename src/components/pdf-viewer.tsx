'use client'

import { useState, useEffect, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configuration du worker PDF.js local
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}



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

interface PdfViewerProps {
  url: string
  onPageClick?: (pageNumber: number, x: number, y: number) => void
  showControls?: boolean
  className?: string
  fields?: Field[]
}

export function PdfViewer({ url, onPageClick, showControls = true, className = '', fields = [] }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('PDF URL:', url)
  }, [url])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully:', numPages, 'pages')
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    console.error('URL tentée:', url)
    setError(`Erreur: ${error.message}`)
    setLoading(false)
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onPageClick) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / scale
    const y = (event.clientY - rect.top) / scale

    onPageClick(pageNumber, x, y)
  }

  // Filtrer les champs pour la page actuelle
  const currentPageFields = fields.filter(f => f.page === pageNumber)

  // Optimisation PDF.js : On mémoïse les objets passés à <Document />
  const fileOptions = useMemo(() => ({ 
    url,
    // prevent unnecessary re-requests
    withCredentials: false
  }), [url])

  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`
  }), [])



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {pageNumber} / {numPages || '?'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={loading}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={loading}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Display */}
      <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
        {loading && (
          <div className="flex items-center justify-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-burgundy-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement du PDF...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">❌ {error}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vérifiez que le fichier PDF est valide</p>
            </div>
          </div>
        )}

        {!error && (
          <div className="flex justify-center">
            <div
              className="relative"
              onClick={handlePageClick}
              style={{ cursor: onPageClick ? 'crosshair' : 'default' }}
            >
              <Document
                file={fileOptions}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                options={pdfOptions}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>

              {/* Field Overlays */}
              {!loading && currentPageFields.map((field) => (
                <div
                  key={field.id}
                  className={`absolute flex items-center justify-center rounded border-2 border-dashed ${
                    field.type === 'signature' 
                      ? 'border-blue-400 bg-blue-50/30' 
                      : field.type === 'text'
                        ? 'border-green-400 bg-green-50/30'
                        : 'border-purple-400 bg-purple-50/30'
                  }`}
                  style={{
                    left: field.x * scale,
                    top: field.y * scale,
                    width: field.width * scale,
                    height: field.height * scale,
                    pointerEvents: 'none',
                  }}
                >
                  <span className="text-[10px] font-bold text-gray-600 opacity-60 uppercase pointer-events-none">
                    {field.type === 'signature' && '✍️ Signature'}
                    {field.type === 'text' && '📝 Texte'}
                    {field.type === 'date' && '📅 Date'}
                    {field.type === 'checkbox' && '⬜ Case'}
                  </span>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      {showControls && numPages > 0 && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          {onPageClick ? (
            '💡 Cliquez sur le PDF pour placer un champ'
          ) : (
            fields.length > 0 ? '🔍 Les zones en pointillés indiquent les endroits à remplir ou signer' : null
          )}
        </div>
      )}
    </div>
  )
}

