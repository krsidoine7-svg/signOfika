import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  // Récupérer la liste des documents
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des documents:', error)
    return (
      <div className="container mx-auto py-8">
        <p>Erreur lors du chargement des documents. Veuillez réessayer.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes documents</h1>
        <Button asChild>
          <Link href="/documents/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau document
          </Link>
        </Button>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Créé le {new Date(doc.created_at).toLocaleDateString()}</p>
                    <p className="capitalize">
                      Statut: {doc.status || 'Non signé'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">Aucun document</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter votre premier document.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/documents/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un document
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
