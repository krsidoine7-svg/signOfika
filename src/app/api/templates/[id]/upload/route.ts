import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify template ownership
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Check file type
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const fileName = `templates/${user.id}/${resolvedParams.id}.pdf`
  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  // Update template with file URL
  const { error: updateError } = await supabase
    .from('templates')
    .update({
      document_url: urlData.publicUrl,
    })
    .eq('id', resolvedParams.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    url: urlData.publicUrl,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify template ownership
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Delete from storage
  const fileName = `templates/${user.id}/${resolvedParams.id}.pdf`
  
  const { error: deleteError } = await supabase.storage
    .from('documents')
    .remove([fileName])

  if (deleteError) {
    console.error('Delete error:', deleteError)
  }

  // Update template to remove URL
  const { error: updateError } = await supabase
    .from('templates')
    .update({
      document_url: null,
    })
    .eq('id', resolvedParams.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
