import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { 
  PlusCircle, 
  Mail, 
  Eye, 
  PenTool, 
  CheckCircle2, 
  FileCheck,
  Globe,
  Monitor
} from 'lucide-react'

interface AuditEvent {
  id: string
  event_type: string
  event_data: any
  created_at: string
  submitter?: {
    name: string
    email: string
  }
}

interface AuditTrailProps {
  events: AuditEvent[]
}

export function AuditTrail({ events }: AuditTrailProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'submission_created': return <PlusCircle className="h-5 w-5 text-blue-500" />
      case 'email_sent': return <Mail className="h-5 w-5 text-indigo-500" />
      case 'submission_opened': return <Eye className="h-5 w-5 text-amber-500" />
      case 'signature_completed': return <PenTool className="h-5 w-5 text-burgundy-500" />
      case 'pdf_generated': return <FileCheck className="h-5 w-5 text-emerald-500" />
      default: return <CheckCircle2 className="h-5 w-5 text-gray-500" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'submission_created': return 'Document envoyé'
      case 'email_sent': return 'Email d\'invitation envoyé'
      case 'submission_opened': return 'Document consulté'
      case 'signature_completed': return 'Signature apposée'
      case 'pdf_generated': return 'Document final généré'
      default: return type
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <CardTitle className="text-navy-900 flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-burgundy-600" />
          Journal d'Audit (Preuve Juridique)
        </CardTitle>
        <CardDescription className="text-gray-600">
          Historique complet des actions effectuées sur ce document
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative p-6">
          <div className="absolute left-[35px] top-8 bottom-8 w-0.5 bg-gray-100" />
          
          <div className="space-y-8">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun événement enregistré. Activez l'audit pour les nouveaux documents.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-[38px] h-[38px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-1">
                      <h4 className="font-bold text-navy-900">{getEventLabel(event.event_type)}</h4>
                      <span className="text-xs font-medium text-gray-400">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {event.event_data?.name || event.submitter?.name || 'Système'} 
                      {event.event_data?.email && ` (${event.event_data.email})`}
                    </p>

                    {(event.event_data?.ip_address || event.event_data?.user_agent) && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {event.event_data.ip_address && (
                          <div className="flex items-center gap-1.5 text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100">
                            <Globe className="h-3 w-3" />
                            IP: {event.event_data.ip_address}
                          </div>
                        )}
                        {event.event_data.user_agent && (
                          <div className="flex items-center gap-1.5 text-[10px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100 max-w-[200px] truncate">
                            <Monitor className="h-3 w-3" />
                            {event.event_data.user_agent}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
