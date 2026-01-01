import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()

    // Récupérer le document avec son template
    const { data: document, error } = await supabase
      .from('template_documents')
      .select('*, template:templates(*)')
      .eq('id', resolvedParams.id)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer d'abord le document pour obtenir le chemin du fichier et vérifier la propriété
    const { data: document, error: fetchError } = await supabase
      .from('template_documents')
      .select('file_path, template:templates(user_id)')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est propriétaire du template
    const templateData = document.template as any
    if (templateData?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Supprimer le fichier du stockage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('Erreur lors de la suppression du fichier:', storageError)
    }

    // Supprimer le document de la base de données
    const { error: deleteError } = await supabase
      .from('template_documents')
      .delete()
      .eq('id', resolvedParams.id)

    if (deleteError) {
      throw new Error('Erreur lors de la suppression du document')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
