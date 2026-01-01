'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Upload, File, X, Loader2 } from 'lucide-react'

interface PdfUploadProps {
  onUpload: (file: File) => Promise<void>
  existingUrl?: string
  onRemove?: () => void
}

export default function PdfUpload({ onUpload, existingUrl, onRemove }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        await handleFile(file)
      } else {
        alert('Veuillez sélectionner un fichier PDF')
      }
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload du fichier')
    } finally {
      setUploading(false)
    }
  }

  if (existingUrl) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-burgundy-600" />
            <div>
              <p className="font-medium text-navy-900">Document PDF</p>
              <p className="text-sm text-gray-600">PDF téléchargé</p>
            </div>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-burgundy-500 bg-burgundy-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
      
      {uploading ? (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-burgundy-600 mx-auto animate-spin" />
          <p className="text-gray-600">Upload en cours...</p>
        </div>
      ) : (
        <>
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <span className="text-burgundy-600 hover:text-burgundy-700 font-medium">
              Cliquez pour uploader
            </span>
            <span className="text-gray-600"> ou glissez-déposez</span>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            PDF jusqu'à 10MB
          </p>
        </>
      )}
    </div>
  )
}
