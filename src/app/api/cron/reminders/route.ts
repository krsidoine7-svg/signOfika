import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint dédié aux rappels automatiques et à l'expiration.
 * À appeler via un cron job (ex: Vercel Cron, GitHub Actions, etc.)
 * Sécurisé par un secret partagé dans CRON_SECRET.
 * Exemple d'URL : GET /api/cron/reminders?secret=xxx
 */
export async function GET(request: NextRequest) {
  // Vérification du secret (protection basique contre les appels non autorisés)
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== (process.env.CRON_SECRET || 'signofika-cron-secret')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date()
  const results = { reminders_sent: 0, expired: 0, errors: 0 }

  // === 1. Marquer les soumissions expirées ===
  const { data: expiredSubmissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('status', 'pending')
    .not('expires_at', 'is', null)
    .lt('expires_at', now.toISOString())

  if (expiredSubmissions && expiredSubmissions.length > 0) {
    const { error: expireError } = await supabase
      .from('submissions')
      .update({ status: 'expired' })
      .in('id', expiredSubmissions.map((s) => s.id))

    if (!expireError) {
      results.expired = expiredSubmissions.length
      console.log(`⏰ ${expiredSubmissions.length} soumission(s) expirée(s)`)
    }
  }

  // === 2. Envoyer les rappels automatiques ===
  const { data: pendingSubmissions } = await (supabase as any)
    .from('submissions')
    .select(`
      id,
      next_reminder_at,
      reminder_interval_days,
      template:templates(name),
      user:profiles(email, full_name, brand_logo_url, brand_color, company_url),
      submitters(id, email, name, slug, status)
    `)
    .eq('status', 'pending')
    .not('next_reminder_at', 'is', null)
    .lte('next_reminder_at', now.toISOString())

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (pendingSubmissions) {
    for (const submission of pendingSubmissions) {
      const pendingSubmitters = submission.submitters?.filter((s: any) => s.status !== 'completed') || []

      for (const submitter of pendingSubmitters) {
        try {
          await fetch(`${appUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: submitter.email,
              type: 'signature-request',
              recipientName: submitter.name,
              senderName: (submission.user as any)?.full_name || 'SignOfika',
              documentName: (submission.template as any)?.name || 'Document',
              signatureUrl: `${appUrl}/s/${submitter.slug}`,
              brandLogoUrl: (submission.user as any)?.brand_logo_url,
              companyUrl: (submission.user as any)?.company_url,
              brandColor: (submission.user as any)?.brand_color,
            }),
          })
          results.reminders_sent++
          console.log(`📧 Rappel automatique envoyé à ${submitter.email}`)
        } catch (err) {
          results.errors++
          console.error(`❌ Erreur rappel pour ${submitter.email}:`, err)
        }
      }

      // Planifier le prochain rappel
      const nextReminder = new Date()
      nextReminder.setDate(nextReminder.getDate() + (submission.reminder_interval_days || 2))

      await supabase
        .from('submissions')
        .update({ next_reminder_at: nextReminder.toISOString() })
        .eq('id', submission.id)
    }
  }

  console.log('✅ Cron rappels terminé :', results)
  return NextResponse.json({ success: true, ...results, timestamp: now.toISOString() })
}
