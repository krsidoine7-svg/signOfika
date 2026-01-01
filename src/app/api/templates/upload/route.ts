import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const templateId = formData.get('templateId') as string

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID manquant' }, { status: 400 })
    }

    // Vérifier que le template appartient à l'utilisateur
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, user_id')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ 
        error: 'Template non trouvé'
      }, { status: 404 })
    }

    // Vérifier le type de fichier
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
    }

    // Vérifier la taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Upload du fichier vers Supabase Storage
    const fileName = `templates/${templateId}/${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Erreur lors de l\'upload du fichier' }, { status: 500 })
    }

    // Créer l'entrée dans template_documents
    const { data: document, error: docError } = await supabase
      .from('template_documents')
      .insert([{
        template_id: templateId,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
      }])
      .select()
      .single()

    if (docError) {
      // Nettoyer le fichier uploadé en cas d'erreur
      await supabase.storage.from('documents').remove([fileName])
      
      return NextResponse.json({ 
        error: 'Erreur lors de la création du document'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      document 
    })
  } catch (error) {
    console.error('Error uploading template file:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}
