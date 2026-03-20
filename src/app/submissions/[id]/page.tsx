import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, Send, Copy, ExternalLink, Download, Calendar } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { DownloadPDFButton } from '@/components/download-pdf-button'
import { ClientPdfViewer } from '@/components/client-pdf-viewer'
import { AuditTrail } from '@/components/audit-trail'
import { CopyLinkButton } from '@/components/copy-link-button'
import { RemindButton } from '@/components/remind-button'




export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(name, description, template_documents(file_path)),
      submitters(*),
      events(*)
    `)
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .order('created_at', { foreignTable: 'events', ascending: true })
    .single()


  if (!submission) {
    redirect('/submissions')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'opened':
        return <Send className="h-5 w-5 text-blue-500" />
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Signé'
      case 'pending':
        return 'En attente'
      case 'opened':
        return 'Ouvert'
      case 'declined':
        return 'Refusé'
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'opened':
        return 'bg-blue-100 text-blue-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCount = submission.submitters?.filter((s: any) => s.status === 'completed').length || 0
  const totalCount = submission.submitters?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <Link href="/submissions">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux soumissions
            </Button>
          </Link>
        </div>

        {/* Submission Header */}
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-navy-900 text-2xl mb-2">
                  {submission.template?.name || 'Document'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Créé le {formatDate(submission.created_at)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(submission.status)}`}>
                  {getStatusText(submission.status)}
                </span>
                <DownloadPDFButton 
                  submissionId={submission.id} 
                  isCompleted={submission.status === 'completed'} 
                />
              </div>
            </div>
          </CardHeader>
          {submission.template?.description && (
            <CardContent>
              <p className="text-gray-600">{submission.template.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Progress */}
        <Card className="mb-6 bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900">Progression</CardTitle>
            <CardDescription className="text-gray-600">
              {completedCount} sur {totalCount} signataires ont signé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">

              <div
                className="bg-gradient-to-r from-burgundy-600 to-burgundy-700 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {submission.status === 'pending' && submission.next_reminder_at && (
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 w-fit">
                <Clock className="h-4 w-4" />
                Prochain rappel automatique : {formatDate(submission.next_reminder_at)} (Tous les {submission.reminder_interval_days || 2} jours)
              </div>
            )}
            {submission.expires_at && (
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border w-fit mt-2 ${
                submission.status === 'expired'
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : new Date(submission.expires_at) < new Date()
                    ? 'text-red-700 bg-red-50 border-red-200'
                    : 'text-amber-700 bg-amber-50 border-amber-100'
              }`}>
                <Calendar className="h-4 w-4" />
                {submission.status === 'expired' || new Date(submission.expires_at) < new Date()
                  ? `⛔ Expiré le ${formatDate(submission.expires_at)}`
                  : `Expire le ${formatDate(submission.expires_at)}`
                }
              </div>
            )}

          </CardContent>
        </Card>


        {/* Audit Trail - High Importance */}
        <div className="mb-6">
          <AuditTrail events={submission.events || []} />
        </div>



        {/* PDF Viewer */}
        {submission.template?.template_documents?.[0]?.file_path && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-navy-900 dark:text-white">📄 Aperçu du Document</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Visualisez le document PDF original
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientPdfViewer 
                url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${submission.template.template_documents[0].file_path}`}
                showControls={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Submitters List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900">Signataires</CardTitle>
            <CardDescription className="text-gray-600">
              Liste des personnes invitées à signer ce document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submission.submitters?.map((submitter: any) => (
                <div
                  key={submitter.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-burgundy-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(submitter.status)}
                    <div className="flex-1">
                      <p className="font-medium text-navy-900">{submitter.name}</p>
                      <p className="text-sm text-gray-600">{submitter.email}</p>
                      {submitter.completed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Signé le {formatDate(submitter.completed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {submitter.status !== 'completed' && (
                      <>
                        <RemindButton submissionId={submission.id} submitterId={submitter.id} />
                        <CopyLinkButton slug={submitter.slug} />
                      </>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(submitter.status)}`}>
                      {getStatusText(submitter.status)}
                    </span>


                    {submitter.signature_url && (
                      <Link href={submitter.signature_url} target="_blank">
                        <Button variant="ghost" size="sm" className="text-burgundy-600 hover:text-burgundy-700 hover:bg-burgundy-50">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
  )
}
