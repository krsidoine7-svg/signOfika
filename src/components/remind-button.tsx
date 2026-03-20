'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface RemindButtonProps {
  submissionId: string
  submitterId: string
}

export function RemindButton({ submissionId, submitterId }: RemindButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleRemind = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/submissions/${submissionId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterId })
      })

      if (response.ok) {
        setSent(true)
        toast.success('Rappel envoyé !')
        setTimeout(() => setSent(false), 3000)
      } else {
        throw new Error('Erreur lors de l\'envoi')
      }
    } catch (err) {
      console.error('Failed to send reminder:', err)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemind}
      disabled={loading || sent}
      className={`rounded-xl h-10 px-4 transition-all ${sent ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold'}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
      ) : sent ? (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Rappel envoyé
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          Relancer
        </>
      )}
    </Button>
  )
}
