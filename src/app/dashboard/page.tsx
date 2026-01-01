import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Send, CheckCircle, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: templatesCount } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_archived', false)

  const { count: submissionsCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  const { count: completedCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-navy-900 mb-3">
          Bienvenue sur SignOfika
        </h2>
        <p className="text-gray-600 text-lg">
          Gérez vos documents et signatures électroniques en toute simplicité
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-gray-200 hover:border-burgundy-500 transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-navy-900">Templates</CardTitle>
            <div className="p-2 bg-burgundy-600/20 rounded-lg">
              <FileText className="h-4 w-4 text-burgundy-400" />
            </div>
          </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{templatesCount || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Modèles de documents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-burgundy-500 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-navy-900">Soumissions</CardTitle>
              <div className="p-2 bg-burgundy-600/20 rounded-lg">
                <Send className="h-4 w-4 text-burgundy-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{submissionsCount || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Total envoyées
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-burgundy-500 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-navy-900">En attente</CardTitle>
              <div className="p-2 bg-yellow-600/20 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{pendingCount || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                À compléter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 hover:border-burgundy-500 transition-all duration-300 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-navy-900">Complétées</CardTitle>
              <div className="p-2 bg-green-600/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{completedCount || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                Signées
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-navy-900 text-2xl">Actions rapides</CardTitle>
            <CardDescription className="text-gray-600">
              Commencez à créer et envoyer des documents
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/templates/new">
              <Button className="w-full h-28 flex flex-col gap-3 bg-burgundy-50 hover:bg-burgundy-100 border-burgundy-200 text-burgundy-900" variant="outline">
                <div className="p-2 bg-burgundy-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Créer un template</span>
              </Button>
            </Link>
            <Link href="/templates">
              <Button className="w-full h-28 flex flex-col gap-3 bg-burgundy-50 hover:bg-burgundy-100 border-burgundy-200 text-burgundy-900" variant="outline">
                <div className="p-2 bg-burgundy-600 rounded-lg">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Envoyer un document</span>
              </Button>
            </Link>
            <Link href="/submissions">
              <Button className="w-full h-28 flex flex-col gap-3 bg-burgundy-50 hover:bg-burgundy-100 border-burgundy-200 text-burgundy-900" variant="outline">
                <div className="p-2 bg-burgundy-600 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Voir les soumissions</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
  )
}
