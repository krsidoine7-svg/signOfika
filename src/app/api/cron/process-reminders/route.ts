import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Find submissions needing reminder
    const { data: submissions, error: subError } = await (supabase as any)
      .from('submissions')
      .select(`
        *,
        template:templates(name),
        user:profiles(full_name, email),
        submitters(*)
      `)
      .eq('status', 'pending')
      .lte('next_reminder_at', now)

    if (subError) throw subError
    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ message: 'Aucun rappel à envoyer' })
    }

    let logsSent = 0
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    for (const sub of submissions) {
      const pendingSubmitters = sub.submitters.filter((s: any) => 
        s.status === 'pending' || s.status === 'opened'
      )

      if (pendingSubmitters.length > 0) {
        for (const submitter of pendingSubmitters) {
          // Send Email
          try {
            await fetch(`${appUrl}/api/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: submitter.email,
                type: 'signature-request',
                recipientName: submitter.name,
                senderName: sub.user?.full_name || sub.user?.email || 'SignOfika',
                documentName: sub.template?.name || 'Document',
                signatureUrl: `${appUrl}/s/${submitter.slug}`,
                isReminder: true
              })
            })

            // Log Audit
            await logAuditEvent({
              event_type: 'email_sent',
              submission_id: sub.id,
              submitter_id: submitter.id,
              user_id: sub.user_id,
              event_data: { type: 'auto-reminder', email: submitter.email },
              request
            })
            logsSent++
          } catch (err) {
            console.error('Error sending auto-reminder email:', err)
          }
        }
      }

      // Calculate next reminder
      const interval = sub.reminder_interval_days || 2
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + interval)

      await supabase
        .from('submissions')
        .update({ 
          next_reminder_at: nextDate.toISOString() 
        })
        .eq('id', sub.id)
    }

    return NextResponse.json({ 
      success: true, 
      remindersSent: logsSent, 
      submissionsProcessed: submissions.length 
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
