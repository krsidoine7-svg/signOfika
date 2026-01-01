import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Send, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function SubmissionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(name),
      submitters(email, name, status)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Send className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété'
      case 'pending':
        return 'En attente'
      case 'declined':
        return 'Refusé'
      case 'expired':
        return 'Expiré'
      default:
        return status
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-navy-900 mb-2">
            Mes Soumissions
          </h2>
          <p className="text-gray-600">
            Suivez l'état de vos documents envoyés
          </p>
        </div>

        {/* Submissions List */}
        {submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission: any) => (
              <Card key={submission.id} className="bg-white border-gray-200 hover:border-burgundy-500 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(submission.status)}
                        <CardTitle className="text-lg text-navy-900">
                          {submission.template?.name || 'Template supprimé'}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span>Créé le {formatDate(submission.created_at)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          {getStatusText(submission.status)}
                        </span>
                      </CardDescription>
                    </div>
                    <Link href={`/submissions/${submission.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                        Détails
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Signataires:</p>
                    <div className="flex flex-wrap gap-2">
                      {submission.submitters?.map((submitter: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md text-sm"
                        >
                          <span>{submitter.name || submitter.email}</span>
                          <span className={`text-xs ${
                            submitter.status === 'completed' ? 'text-green-600' :
                            submitter.status === 'opened' ? 'text-blue-600' :
                            submitter.status === 'declined' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            ({submitter.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 bg-white border-gray-200 shadow-sm">
            <CardContent>
              <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune soumission</h3>
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore envoyé de documents à signer
              </p>
              <Link href="/templates">
                <Button>
                  Envoyer un document
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
  )
}
