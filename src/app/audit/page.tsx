'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  History, 
  ArrowRight,
  Loader2,
  Filter,
  RefreshCcw,
  Search,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { AuditTrail } from '@/components/audit-trail'
import Link from 'next/link'

export default function GlobalAuditPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit-logs')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      } else {
        throw new Error('Erreur lors du chargement')
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
      toast.error('Impossible de charger les journaux d\'audit')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-burgundy-600" />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-navy-900 tracking-tight flex items-center gap-3">
            <History className="h-10 w-10 text-burgundy-600" />
            Journal d'Audit Global
          </h1>
          <p className="text-gray-600 text-lg">Retracez chaque événement important de votre compte en temps réel</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadEvents}
            className="rounded-xl border-gray-200 hover:bg-gray-50 h-10 px-4 font-semibold text-gray-700"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AuditTrail events={events} />
        
        {events.length > 0 && (
          <div className="flex justify-center mt-4">
            <p className="text-sm text-gray-400 italic font-medium italic">
              Affichage des 50 derniers événements
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
