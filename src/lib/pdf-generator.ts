import { PDFDocument, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'

export async function generateSignedPDF(submissionId: string) {
  const supabase = await createClient()
  
  // Récupérer la submission avec template et submitters
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(*, template_documents(*)),
      submitters(*)
    `)
    .eq('id', submissionId)
    .single()
  
  if (!submission || !submission.template) {
    throw new Error('Submission ou template introuvable')
  }
  
  // Récupérer le PDF original (si existe)
  const templateDoc = submission.template.template_documents?.[0]
  if (!templateDoc) {
    throw new Error('Aucun document PDF trouvé')
  }
  
  // Charger le PDF
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${templateDoc.file_path}`
  const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(pdfBytes)
  
  // Ajouter les signatures
  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  
  let yPosition = 700
  for (const submitter of submission.submitters) {
    if (submitter.signature_url) {
      // Charger l'image de signature
      const signatureBytes = await fetch(submitter.signature_url).then(res => res.arrayBuffer())
      const signatureImage = await pdfDoc.embedPng(signatureBytes)
      
      // Ajouter le nom du signataire
      firstPage.drawText(`${submitter.name} - Signé le ${new Date(submitter.completed_at).toLocaleDateString('fr-FR')}`, {
        x: 50,
        y: yPosition + 60,
        size: 10,
        color: rgb(0, 0, 0),
      })
      
      // Ajouter la signature
      firstPage.drawImage(signatureImage, {
        x: 50,
        y: yPosition,
        width: 150,
        height: 50,
      })
      
      yPosition -= 100
    }
  }
  
  // Ajouter un certificat/metadata
  firstPage.drawText('Document signé électroniquement via SignOfika', {
    x: 50,
    y: 30,
    size: 8,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  // Sauvegarder
  const signedPdfBytes = await pdfDoc.save()
  
  // Upload vers Storage
  const fileName = `signed/${submissionId}/document-signed.pdf`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, signedPdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    })
  
  if (uploadError) throw uploadError
  
  // Récupérer l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)
  
  // Vérifier si un document existe déjà
  const { data: existingDoc } = await supabase
    .from('submission_documents')
    .select('id')
    .eq('submission_id', submissionId)
    .single()

  if (existingDoc) {
    // Mettre à jour l'existant
    await supabase
      .from('submission_documents')
      .update({
        file_path: fileName,
        file_name: 'document-signed.pdf',
        file_size: signedPdfBytes.length,
      })
      .eq('id', existingDoc.id)
  } else {
    // Créer un nouveau
    await supabase
      .from('submission_documents')
      .insert({
        submission_id: submissionId,
        file_path: fileName,
        file_name: 'document-signed.pdf',
        file_size: signedPdfBytes.length,
      })
  }
  
  return publicUrl
}
