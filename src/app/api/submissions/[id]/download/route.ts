import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Récupérer le document signé
    const { data: document } = await supabase
      .from('submission_documents')
      .select('file_path, submission:submissions(user_id, template:templates(name))')
      .eq('submission_id', resolvedParams.id)
      .single()
    
    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }
    
    // Vérifier la propriété (avec cast de type)
    const submission = document.submission as any
    if (submission.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    
    // Récupérer le fichier depuis Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path)
    
    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
    }
    
    // Retourner le fichier
    const fileName = `${submission.template?.name || 'document'}-signed.pdf`
    const buffer = await fileData.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Erreur téléchargement:', error)
    return NextResponse.json({ error: 'Erreur téléchargement' }, { status: 500 })
  }
}
