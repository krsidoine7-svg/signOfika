import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Get submitter by slug
  const { data: submitter, error: submitterError } = await supabase
    .from('submitters')
    .select(`
      *,
      submission:submissions(
        *,
        template:templates(name, description, schema, template_documents(file_path))
      )
    `)
    .eq('slug', resolvedParams.slug)
    .single()

  if (submitterError || !submitter) {
    return NextResponse.json({ error: 'Submitter not found' }, { status: 404 })
  }

  // Check if submission is expired
  const submission = submitter.submission
  if (submission && submission.expires_at) {
    const expiresAt = new Date(submission.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Document expired' }, { status: 410 })
    }
  }

  return NextResponse.json({
    submitter,
    submission: submitter.submission,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params
  const supabase = await createClient()
  const body = await request.json()
  const { signature, fields } = body

  if (!signature) {
    return NextResponse.json({ error: 'Signature required' }, { status: 400 })
  }

  // Get submitter
  const { data: submitter, error: submitterError } = await supabase
    .from('submitters')
    .select('*, submission:submissions(id, status)')
    .eq('slug', resolvedParams.slug)
    .single()

  if (submitterError || !submitter) {
    return NextResponse.json({ error: 'Submitter not found' }, { status: 404 })
  }

  // Check if already completed
  if (submitter.status === 'completed') {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 })
  }

  // Upload signature to storage
  const signatureBlob = Buffer.from(signature.split(',')[1], 'base64')
  const fileName = `signatures/${submitter.submission_id}/${submitter.id}.png`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, signatureBlob, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  // Update submitter status
  const { error: updateError } = await supabase
    .from('submitters')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      signature_url: urlData.publicUrl,
      values: fields || {},
    })
    .eq('id', submitter.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Check if all submitters have completed
  const { data: allSubmitters } = await supabase
    .from('submitters')
    .select('status')
    .eq('submission_id', submitter.submission_id)

  const allCompleted = allSubmitters?.every(s => s.status === 'completed')

  if (allCompleted) {
    // Update submission status
    await supabase
      .from('submissions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', submitter.submission_id)
  }

  return NextResponse.json({ success: true })
}
