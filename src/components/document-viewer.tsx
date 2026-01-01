'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import { useState } from 'react'

// Configure le worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface DocumentViewerProps {
  url: string
  width?: number
}

export function DocumentViewer({ url, width = 600 }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Erreur lors du chargement du document:', error)
    setError('Impossible de charger le document')
    setIsLoading(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="document-viewer">
      <div className="flex justify-center bg-gray-50 p-4 rounded-md border border-gray-200">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
      
      {numPages && numPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>
            Page {pageNumber} sur {numPages}
          </div>
          <div className="space-x-2">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
