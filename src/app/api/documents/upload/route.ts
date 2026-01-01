import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour téléverser un document' },
        { status: 401 }
      )
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `documents/${fileName}`

    // Téléverser le fichier vers le stockage Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Erreur de téléversement:', uploadError)
      throw new Error('Erreur lors du téléversement du fichier')
    }

    // Récupérer l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Créer un template pour ce document
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert([
        {
          name: name || file.name,
          slug: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          user_id: user.id,
          schema: [],
        },
      ])
      .select()
      .single()

    if (templateError) {
      console.error('Erreur création template:', templateError)
      await supabase.storage.from('documents').remove([filePath])
      throw new Error('Erreur lors de la création du template')
    }

    // Enregistrer le document PDF dans template_documents
    const { data: document, error: dbError } = await supabase
      .from('template_documents')
      .insert([
        {
          template_id: template.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Erreur base de données:', dbError)
      // Essayer de supprimer le fichier téléversé en cas d'échec de l'insertion en base
      await supabase.storage.from('documents').remove([filePath])
      await supabase.from('templates').delete().eq('id', template.id)
      throw new Error('Erreur lors de la sauvegarde des métadonnées du document')
    }

    return NextResponse.json({
      success: true,
      templateId: template.id,
      documentId: document.id,
      fileUrl: publicUrl,
    })
  } catch (error) {
    console.error('Erreur lors du téléversement:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}
