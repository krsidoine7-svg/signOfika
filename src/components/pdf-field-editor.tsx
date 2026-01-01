'use client'

import { useState, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Loader2,
  PenTool,
  Type,
  Calendar,
  Trash2,
  Save
} from 'lucide-react'
import { toast } from 'sonner'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configuration du worker PDF.js
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

interface Field {
  id: string
  type: 'signature' | 'text' | 'date'
  page: number
  x: number
  y: number
  width: number
  height: number
  label: string
  required: boolean
}

interface PdfFieldEditorProps {
  url: string
  initialFields?: Field[]
  onSave: (fields: Field[]) => Promise<void>
}

export function PdfFieldEditor({ url, initialFields = [], onSave }: PdfFieldEditorProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [fields, setFields] = useState<Field[]>(initialFields)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)
  
  // Mode dessin (comme DocuSeal)
  const [drawingMode, setDrawingMode] = useState<'signature' | 'text' | 'date' | null>(null)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('✅ PDF chargé:', numPages, 'pages')
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(err: Error) {
    console.error('❌ Erreur chargement PDF:', err)
    console.error('URL:', url)
    setError(`Erreur: ${err.message}`)
    setLoading(false)
    toast.error('Impossible de charger le PDF')
  }

  // Activer le mode dessin (comme DocuSeal)
  const startDrawingMode = (type: 'signature' | 'text' | 'date') => {
    setDrawingMode(type)
    setSelectedField(null)
    const label = type === 'signature' ? 'Signature' : type === 'text' ? 'Texte' : 'Date'
    toast.info(`🎨 Mode dessin activé - Dessinez le champ "${label}" sur le PDF`, {
      duration: 3000,
    })
  }

  // Créer le champ après le dessin
  const createFieldFromDrawing = (startPos: { x: number; y: number }, endPos: { x: number; y: number }) => {
    if (!drawingMode) return

    const x = Math.min(startPos.x, endPos.x)
    const y = Math.min(startPos.y, endPos.y)
    const width = Math.abs(endPos.x - startPos.x)
    const height = Math.abs(endPos.y - startPos.y)

    // Taille minimale
    if (width < 30 || height < 20) {
      toast.error('❌ Le champ est trop petit - Dessinez un champ plus grand')
      return
    }

    const newField: Field = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: drawingMode,
      page: pageNumber,
      x,
      y,
      width,
      height,
      label: drawingMode === 'signature' ? 'Signature' : drawingMode === 'text' ? 'Texte' : 'Date',
      required: true,
    }

    setFields([...fields, newField])
    setSelectedField(newField.id)
    toast.success(`✅ Champ "${newField.label}" créé`, {
      duration: 2000,
    })
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId))
    setSelectedField(null)
    toast.success('Champ supprimé')
  }

  // Gestion du dessin sur le PDF (mode DocuSeal)
  const handlePdfMouseDown = (e: React.MouseEvent) => {
    const container = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - container.left) / scale
    const y = (e.clientY - container.top) / scale

    // Mode dessin activé
    if (drawingMode) {
      e.preventDefault()
      setDrawStart({ x, y })
      setDrawCurrent({ x, y })
      return
    }
  }

  const handlePdfMouseMove = (e: React.MouseEvent) => {
    const container = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - container.left) / scale
    const y = (e.clientY - container.top) / scale

    // Dessin en cours
    if (drawingMode && drawStart) {
      e.preventDefault()
      setDrawCurrent({ x, y })
      return
    }

    // Drag d'un champ existant
    if (dragging) {
      e.preventDefault()
      const newX = x - dragOffset.x
      const newY = y - dragOffset.y

      const currentField = fields.find(f => f.id === dragging)
      if (!currentField) return

      const maxX = 1000 - currentField.width
      const maxY = 1400 - currentField.height

      setFields(fields.map(field => 
        field.id === dragging 
          ? { 
              ...field, 
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY))
            }
          : field
      ))
    }
  }

  const handlePdfMouseUp = () => {
    // Fin du dessin
    if (drawingMode && drawStart && drawCurrent) {
      createFieldFromDrawing(drawStart, drawCurrent)
      setDrawingMode(null)
      setDrawStart(null)
      setDrawCurrent(null)
      return
    }

    // Fin du drag
    setDragging(null)
  }

  // Gestion du drag d'un champ existant
  const handleFieldMouseDown = (fieldId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const fieldRect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - fieldRect.left,
      y: e.clientY - fieldRect.top,
    })
    setDragging(fieldId)
    setSelectedField(fieldId)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(fields)
      toast.success('Champs sauvegardés avec succès !')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const currentPageFields = fields.filter(f => f.page === pageNumber)

  // Mémoïser les props pour éviter les re-renders inutiles
  const fileOptions = useMemo(() => ({ url }), [url])
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), [])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            Page {pageNumber} / {numPages || '?'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
            disabled={pageNumber >= numPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Add Field Buttons - Style DocuSeal */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mr-2">
            Ajouter un champ :
          </div>
          <button
            onClick={() => startDrawingMode('signature')}
            className="group relative px-4 py-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            title="Ajouter un champ de signature"
          >
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Signature</span>
          </button>
          <button
            onClick={() => startDrawingMode('text')}
            className="group relative px-4 py-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            title="Ajouter un champ de texte"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Texte</span>
          </button>
          <button
            onClick={() => startDrawingMode('date')}
            className="group relative px-4 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            title="Ajouter un champ de date"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Date</span>
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
            disabled={loading}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setScale(s => Math.min(s + 0.2, 2.5))}
            disabled={loading}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving || fields.length === 0}
          className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      {/* PDF Display with Fields */}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Vérifiez que le fichier PDF est accessible</p>
            </div>
          </div>
        )}

        {!error && (
          <div className="flex justify-center">
            <div
              className="relative select-none"
              style={{ 
                userSelect: 'none',
                cursor: drawingMode ? 'crosshair' : 'default'
              }}
              onMouseDown={handlePdfMouseDown}
              onMouseMove={handlePdfMouseMove}
              onMouseUp={handlePdfMouseUp}
              onMouseLeave={handlePdfMouseUp}
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

              {/* Rectangle de prévisualisation du dessin (mode DocuSeal) */}
              {drawingMode && drawStart && drawCurrent && (
                <div
                  className="absolute border-2 border-dashed bg-opacity-30 pointer-events-none"
                  style={{
                    left: Math.min(drawStart.x, drawCurrent.x) * scale,
                    top: Math.min(drawStart.y, drawCurrent.y) * scale,
                    width: Math.abs(drawCurrent.x - drawStart.x) * scale,
                    height: Math.abs(drawCurrent.y - drawStart.y) * scale,
                    borderColor: drawingMode === 'signature' ? '#3b82f6' : drawingMode === 'text' ? '#10b981' : '#a855f7',
                    backgroundColor: drawingMode === 'signature' ? '#3b82f6' : drawingMode === 'text' ? '#10b981' : '#a855f7',
                  }}
                >
                  <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                    {drawingMode === 'signature' && '✍️ Signature'}
                    {drawingMode === 'text' && '📝 Texte'}
                    {drawingMode === 'date' && '📅 Date'}
                  </div>
                </div>
              )}

              {/* Overlay Fields */}
              {currentPageFields.map((field) => (
                <div
                  key={field.id}
                  className={`absolute rounded-md border-2 ${
                    dragging === field.id 
                      ? 'cursor-grabbing border-burgundy-600 bg-burgundy-100/70 shadow-2xl z-50 scale-105' 
                      : selectedField === field.id 
                        ? 'cursor-grab border-burgundy-600 bg-burgundy-100/60 shadow-lg' 
                        : 'cursor-grab border-blue-400 bg-blue-50/40'
                  } hover:border-burgundy-400 hover:shadow-md transition-all`}
                  style={{
                    left: field.x * scale,
                    top: field.y * scale,
                    width: field.width * scale,
                    height: field.height * scale,
                    pointerEvents: 'auto',
                  }}
                  onMouseDown={(e) => {
                    // Vérifier si on clique sur le bouton de suppression
                    if ((e.target as HTMLElement).closest('button')) {
                      return
                    }
                    handleFieldMouseDown(field.id, e)
                  }}
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      setSelectedField(field.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between h-full px-2 text-xs font-medium pointer-events-none">
                    <span className="text-gray-800 font-semibold flex items-center gap-1">
                      {field.type === 'signature' && <span className="text-base">✍️</span>} 
                      {field.type === 'text' && <span className="text-base">📝</span>}
                      {field.type === 'date' && <span className="text-base">📅</span>}
                      {field.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteField(field.id)
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-red-100 bg-red-50 transition-colors pointer-events-auto"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-y-1">
        {drawingMode ? (
          <p className="text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
            🎨 Mode Dessin : Cliquez et glissez sur le PDF pour créer le champ "{drawingMode === 'signature' ? 'Signature' : drawingMode === 'text' ? 'Texte' : 'Date'}"
          </p>
        ) : (
          <p>💡 <strong>Astuce :</strong> Cliquez sur un bouton ci-dessus, puis dessinez le champ sur le PDF</p>
        )}
        <p>📊 {fields.length} champ(s) total, {currentPageFields.length} sur cette page</p>
        {dragging && (
          <p className="text-burgundy-600 dark:text-burgundy-400 font-semibold animate-pulse">
            🎯 Déplacement en cours... Relâchez pour placer
          </p>
        )}
      </div>
    </div>
  )
}
