import { createClient } from '@/lib/supabase/server'

export type AuditEventType = 
  | 'submission_created'
  | 'email_sent'
  | 'submission_opened'
  | 'signature_completed'
  | 'pdf_generated'
  | 'submission_declined'
  | 'submission_expired'

export interface AuditLogData {
  event_type: AuditEventType
  submission_id: string
  submitter_id?: string
  user_id?: string
  event_data?: any
  request?: Request
}

export async function logAuditEvent({
  event_type,
  submission_id,
  submitter_id,
  user_id,
  event_data = {},
  request
}: AuditLogData) {
  try {
    const supabase = await createClient()
    
    // Extract client info if request is provided
    let ip_address = 'unknown'
    let user_agent = 'unknown'
    
    if (request) {
      ip_address = request.headers.get('x-forwarded-for') || '127.0.0.1'
      user_agent = request.headers.get('user-agent') || 'unknown'
    }

    const { error } = await (supabase as any)
      .from('events')
      .insert({
        event_type,
        submission_id,
        submitter_id,
        user_id,
        event_data: {
          ...event_data,
          ip_address,
          user_agent,
          timestamp: new Date().toISOString()
        }
      })

    if (error) {
      console.error('Audit Log Error:', error)
    }
  } catch (err) {
    console.error('Audit Log critical failure:', err)
  }
}
