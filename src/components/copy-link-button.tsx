'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyLinkButtonProps {
  slug: string
}

export function CopyLinkButton({ slug }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/s/${slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien de signature copié !')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Erreur lors de la copie du lien')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`border-gray-300 transition-all ${copied ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Copié !
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          Copier le lien
        </>
      )}
    </Button>
  )
}
