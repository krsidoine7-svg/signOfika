import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Plus, FolderOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteTemplateButton } from '@/components/delete-template-button'


export default async function TemplatesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-navy-900 mb-3">
              Mes Templates
            </h2>
            <p className="text-gray-600 text-lg">
              Créez et gérez vos modèles de documents
            </p>
          </div>
          <Link href="/templates/new">
            <Button className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau template
            </Button>
          </Link>
        </div>

        {/* Templates Grid */}
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white border-gray-200 hover:border-burgundy-500 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-burgundy-600/20 rounded-lg">
                      <FileText className="h-8 w-8 text-burgundy-400" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <DeleteTemplateButton id={template.id} name={template.name} />
                      {template.folder_id && (
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <CardTitle className="mt-4 text-navy-900">{template.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {template.description || 'Aucune description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Créé le {formatDate(template.created_at)}</p>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/templates/${template.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100">
                          Éditer
                        </Button>
                      </Link>
                      <Link href={`/templates/${template.id}/send`} className="flex-1">
                        <Button className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white">
                          Envoyer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 bg-white border-gray-200 shadow-sm">
            <CardContent>
              <div className="p-4 bg-burgundy-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-12 w-12 text-burgundy-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-navy-900">Aucun template</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Commencez par créer votre premier modèle de document pour gérer vos signatures électroniques
              </p>
              <Link href="/templates/new">
                <Button className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un template
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
  )
}
