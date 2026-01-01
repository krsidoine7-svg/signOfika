import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentViewer } from '@/components/document-viewer'
import { SendSignatureRequest } from '@/components/send-signature-request'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Récupérer les informations du document
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single()
    
  if (error || !document) {
    console.error('Erreur lors de la récupération du document:', error)
    notFound()
  }

  // Récupérer les signatures du document
  const { data: signatures } = await supabase
    .from('signatures')
    .select('*')
    .eq('document_id', params.id)
    .order('signed_at', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{document.name}</h1>
        <div className="space-x-2">
          <Button variant="outline">Télécharger</Button>
          <Button>Envoyer à signer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du document</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentViewer url={document.file_url} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Créé le</p>
                <p>{new Date(document.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p>{document.status || 'Non signé'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signataires</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="request" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="request">Demander</TabsTrigger>
                  <TabsTrigger value="status">Statut</TabsTrigger>
                </TabsList>
                <TabsContent value="request">
                  <SendSignatureRequest 
                    documentId={document.id}
                    documentName={document.name}
                  />
                </TabsContent>
                <TabsContent value="status" className="space-y-4">
                  {signatures && signatures.length > 0 ? (
                    <div className="space-y-3">
                      {signatures.map((sig) => (
                        <div key={sig.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{sig.signer_name}</p>
                              <p className="text-xs text-muted-foreground">{sig.signer_email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Signé le {new Date(sig.signed_at).toLocaleDateString()} à{' '}
                                {new Date(sig.signed_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <a 
                              href={sig.signature_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Voir signature
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune signature pour le moment.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
