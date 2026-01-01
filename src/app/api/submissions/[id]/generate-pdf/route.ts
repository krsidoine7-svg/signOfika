import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSignedPDF } from '@/lib/pdf-generator'

export async function POST(
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
    
    // Vérifier que la submission existe et appartient à l'utilisateur
    const { data: submission } = await supabase
      .from('submissions')
      .select('user_id, status')
      .eq('id', resolvedParams.id)
      .single()
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission introuvable' }, { status: 404 })
    }
    
    if (submission.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    
    if (submission.status !== 'completed') {
      return NextResponse.json({ error: 'Le document n\'est pas complètement signé' }, { status: 400 })
    }
    
    // Générer le PDF
    const pdfUrl = await generateSignedPDF(resolvedParams.id)
    
    return NextResponse.json({ success: true, pdfUrl })
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur génération PDF' },
      { status: 500 }
    )
  }
}
