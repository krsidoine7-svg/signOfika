'use client'

import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser, Download } from 'lucide-react'

interface SignaturePadProps {
  onSave?: (dataUrl: string) => void
  width?: number
  height?: number
}

export function SignaturePad({ onSave, width = 500, height = 200 }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)

  const clear = () => {
    sigCanvas.current?.clear()
  }

  const save = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL('image/png')
      onSave?.(dataUrl)
    }
  }

  const download = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'signature.png'
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width,
            height,
            className: 'signature-canvas',
          }}
          backgroundColor="white"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={clear}>
          <Eraser className="mr-2 h-4 w-4" />
          Effacer
        </Button>
        <Button type="button" variant="outline" onClick={download}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger
        </Button>
        {onSave && (
          <Button type="button" onClick={save}>
            Enregistrer la signature
          </Button>
        )}
      </div>
    </div>
  )
}
