import { PDFDocument, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'

interface Field {
  id: string
  type: 'signature' | 'text' | 'date' | 'checkbox'

  page: number
  x: number
  y: number
  width: number
  height: number
  label: string
  required: boolean
}

export async function generateSignedPDF(submissionId: string) {
  const supabase = await createClient()
  
  // Récupérer la submission avec template et submitters
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select(`
      *,
      template:templates(*, template_documents(*)),
      submitters(*)
    `)
    .eq('id', submissionId)
    .single()
  
  if (subError || !submission || !submission.template) {
    throw new Error('Submission ou template introuvable')
  }
  
  // Récupérer le PDF original
  const templateDoc = submission.template.template_documents?.[0]
  if (!templateDoc) {
    throw new Error('Aucun document PDF trouvé dans le template')
  }
  
  // Charger le PDF
  const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${templateDoc.file_path}`
  const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(pdfBytes)
  
  const schema = (submission.template.schema || []) as Field[]
  const pages = pdfDoc.getPages()
  
  // Trier les signataires par position
  const sortedSubmitters = [...submission.submitters].sort((a, b) => (a.position || 0) - (b.position || 0))
  const completedSubmitters = sortedSubmitters.filter(s => s.status === 'completed')

  // Pour chaque champ dans le template
  for (const field of schema) {
    const pageIndex = (field.page || 1) - 1
    if (pageIndex >= pages.length) continue
    
    const page = pages[pageIndex]
    const { width: pageWidth, height: pageHeight } = page.getSize()
    
    // Conversion des coordonnées (l'éditeur utilise probablement une largeur de référence, souvent 612 ou 595 points)
    // On va assumer que les coordonnées X,Y sont proportionnelles à une largeur de référence si elles ne correspondent pas
    // Mais ici, on va utiliser les valeurs directes en supposant qu'elles sont au format points PDF (1/72 inch)
    // Inversion de l'axe Y car pdf-lib commence en bas à gauche
    const pdfX = field.x
    const pdfY = pageHeight - field.y - field.height

    if (field.type === 'signature') {
      // Trouver le signataire correspondant à ce champ (pour l'instant par index)
      // TODO: Dans une version future, mapper via field.signerId
      const signerIndex = schema.filter(f => f.type === 'signature').indexOf(field)
      const submitter = completedSubmitters[signerIndex] || completedSubmitters[0]
      
      if (submitter && submitter.signature_url) {
        try {
          const signatureBytes = await fetch(submitter.signature_url).then(res => res.arrayBuffer())
          const signatureImage = await pdfDoc.embedPng(signatureBytes)
          
          page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY,
            width: field.width,
            height: field.height,
          })
          
          // Petit texte sous la signature
          page.drawText(`Signé par ${submitter.name} le ${new Date(submitter.completed_at).toLocaleDateString('fr-FR')}`, {
            x: pdfX,
            y: pdfY - 10,
            size: 6,
            color: rgb(0.5, 0.5, 0.5),
          })
        } catch (e) {
          console.error(`Erreur lors de l'intégration de la signature de ${submitter.name}:`, e)
        }
      }
    } else if (field.type === 'text' || field.type === 'date') {
      // Pour les champs de texte, on prend la valeur du premier signataire (ou on pourrait agréger)
      const value = completedSubmitters[0]?.values?.[field.id] || 
                    (field.type === 'date' ? new Date().toLocaleDateString('fr-FR') : field.label)
      
      page.drawText(String(value), {
        x: pdfX + 5,
        y: pdfY + (field.height / 2) - 4,
        size: 10,
        color: rgb(0, 0, 0),
      })
    } else if (field.type === 'checkbox') {
      const isChecked = completedSubmitters[0]?.values?.[field.id] === true
      
      // Dessiner le cadre de la case
      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: field.width,
        height: field.height,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      })

      if (isChecked) {
        // Dessiner une croix (X)
        page.drawText('X', {
          x: pdfX + (field.width / 4),
          y: pdfY + (field.height / 4),
          size: field.height * 0.8,
          color: rgb(0, 0, 0),
        })
      }
    }
  }

  
  // Metadata & Footer
  pages.forEach(p => {
    p.drawText(`Document généré par SignOfika - ID: ${submissionId.substring(0, 8)}`, {
      x: 50,
      y: 15,
      size: 7,
      color: rgb(0.7, 0.7, 0.7),
    })
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
  
  // URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)
  
  // Enregistrer ou mettre à jour le document de soumission
  const { data: existingDoc } = await supabase
    .from('submission_documents')
    .select('id')
    .eq('submission_id', submissionId)
    .single()

  if (existingDoc) {
    await supabase
      .from('submission_documents')
      .update({
        file_path: fileName,
        file_name: `${submission.template.name}-signé.pdf`,
        file_size: signedPdfBytes.length,
      })
      .eq('id', existingDoc.id)
  } else {
    await supabase
      .from('submission_documents')
      .insert({
        submission_id: submissionId,
        file_path: fileName,
        file_name: `${submission.template.name}-signé.pdf`,
        file_size: signedPdfBytes.length,
      })
  }
  
  return publicUrl
}

