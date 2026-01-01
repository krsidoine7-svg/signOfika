# 📋 TODO - SignOfika

**Date de mise à jour** : 25 octobre 2025

---

## ✅ CE QUI EST DÉJÀ FAIT (90%)

- ✅ Authentification complète (signup, login, logout)
- ✅ Schema SQL complet avec toutes les tables
- ✅ Configuration Supabase (bucket + policies)
- ✅ Dashboard avec statistiques en temps réel
- ✅ Création et gestion de templates
- ✅ Éditeur de templates (placer des champs de signature)
- ✅ Upload de fichiers PDF
- ✅ Envoi de documents pour signature (avec multi-signataires)
- ✅ Page publique de signature `/s/{slug}`
- ✅ Canvas de signature électronique (souris + tactile)
- ✅ Enregistrement des signatures dans Supabase Storage
- ✅ Suivi des signatures (statuts, progression)
- ✅ Mise à jour automatique des statuts (submitter + submission)
- ✅ Design moderne blanc/burgundy/navy sur toutes les pages
- ✅ Service d'email (Resend) configuré
- ✅ Templates d'emails React

---

## 🔴 PRIORITÉ HAUTE - À FAIRE EN PREMIER

### 1. Envoi Automatique d'Emails 📧

**Statut** : Service prêt, intégration manquante
**Temps estimé** : 30-45 minutes
**Dépendance** : Compte Resend (gratuit)

#### Étapes :

1. **Créer un compte Resend**
   - Aller sur https://resend.com
   - S'inscrire gratuitement
   - Aller dans "API Keys"
   - Créer une nouvelle clé
   - Copier la clé (format: `re_xxxxx`)

2. **Ajouter la clé dans `.env.local`**
   ```env
   RESEND_API_KEY=re_votre_cle_ici
   ```

3. **Intégrer dans l'API de création de submissions**
   
   **Fichier** : `src/app/api/submissions/route.ts`
   
   **Ajouter après la création des submitters** (ligne ~78) :
   ```typescript
   // Envoyer les emails d'invitation
   const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
   
   for (const submitterData of submittersData) {
     try {
       await fetch(`${appUrl}/api/send-email`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           to: submitterData.email,
           type: 'signature-request',
           recipientName: submitterData.name,
           senderName: user.email || 'SignOfika',
           documentName: template.name,
           signatureUrl: `${appUrl}/s/${submitterData.slug}`
         })
       })
     } catch (error) {
       console.error('Erreur envoi email:', error)
     }
   }
   ```

4. **Intégrer dans l'API de signature**
   
   **Fichier** : `src/app/api/s/[slug]/route.ts`
   
   **Ajouter après la mise à jour du submitter** (ligne ~110) :
   ```typescript
   // Envoyer email de confirmation au signataire
   const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
   
   try {
     await fetch(`${appUrl}/api/send-email`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         to: submitter.email,
         type: 'signature-completed',
         recipientName: submitter.name,
         documentName: submitter.submission.template.name,
         submitterName: submitter.name
       })
     })
   } catch (error) {
     console.error('Erreur envoi email:', error)
   }
   
   // Si tous ont signé, notifier le créateur
   if (allCompleted) {
     const { data: owner } = await supabase
       .from('profiles')
       .select('email, full_name')
       .eq('id', submitter.submission.user_id)
       .single()
     
     if (owner) {
       await fetch(`${appUrl}/api/send-email`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           to: owner.email,
           type: 'signature-completed',
           recipientName: owner.full_name || owner.email,
           documentName: submitter.submission.template.name,
           submitterName: 'Tous les signataires'
         })
       })
     }
   }
   ```

5. **Tester**
   - Créer une nouvelle submission
   - Vérifier que les emails sont envoyés
   - Signer le document
   - Vérifier l'email de confirmation

---

### 2. Génération de PDF Signés 📄

**Statut** : À implémenter
**Temps estimé** : 1-2 heures
**Dépendance** : `pdf-lib` (déjà installé ✅)

#### Étapes :

1. **Créer le service de génération PDF**
   
   **Fichier** : `src/lib/pdf-generator.ts` (nouveau)
   ```typescript
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
     
     // Enregistrer dans submission_documents
     await supabase
       .from('submission_documents')
       .insert({
         submission_id: submissionId,
         file_path: fileName,
         file_name: 'document-signed.pdf',
         file_size: signedPdfBytes.length,
       })
     
     return publicUrl
   }
   ```

2. **Créer l'API endpoint**
   
   **Fichier** : `src/app/api/submissions/[id]/generate-pdf/route.ts` (nouveau)
   ```typescript
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
   ```

3. **Ajouter le bouton dans la page de détails**
   
   **Fichier** : `src/app/submissions/[id]/page.tsx`
   
   **Ajouter dans le header de la card** (après le statut) :
   ```typescript
   {submission.status === 'completed' && (
     <Button
       onClick={async () => {
         const res = await fetch(`/api/submissions/${submission.id}/generate-pdf`, {
           method: 'POST'
         })
         const data = await res.json()
         if (data.pdfUrl) {
           window.open(data.pdfUrl, '_blank')
         }
       }}
       className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
     >
       <Download className="mr-2 h-4 w-4" />
       Télécharger le PDF signé
     </Button>
   )}
   ```

4. **Tester**
   - Compléter une submission (tous les signataires signent)
   - Cliquer sur "Télécharger le PDF signé"
   - Vérifier que le PDF contient les signatures

---

### 3. Bouton de Téléchargement Direct 💾

**Statut** : À implémenter
**Temps estimé** : 30 minutes
**Dépendance** : Génération PDF (ci-dessus)

#### Étapes :

1. **Créer l'API de téléchargement**
   
   **Fichier** : `src/app/api/submissions/[id]/download/route.ts` (nouveau)
   ```typescript
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
       
       // Vérifier la propriété
       if (document.submission.user_id !== user.id) {
         return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
       }
       
       // Récupérer le fichier depuis Storage
       const { data: fileData } = await supabase.storage
         .from('documents')
         .download(document.file_path)
       
       if (!fileData) {
         return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
       }
       
       // Retourner le fichier
       const fileName = `${document.submission.template.name}-signed.pdf`
       return new NextResponse(fileData, {
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
   ```

2. **Utiliser dans le composant**
   
   **Remplacer le bouton précédent par** :
   ```typescript
   <Link href={`/api/submissions/${submission.id}/download`} target="_blank">
     <Button className="bg-burgundy-600 hover:bg-burgundy-700 text-white">
       <Download className="mr-2 h-4 w-4" />
       Télécharger le PDF signé
     </Button>
   </Link>
   ```

---

## 🟡 PRIORITÉ MOYENNE - Fonctionnalités Importantes

### 4. Visualiseur PDF dans l'Éditeur 📖

**Temps estimé** : 2-3 heures
**Dépendance** : `react-pdf` (déjà installé ✅)

- Afficher le PDF dans l'éditeur de templates
- Permettre de placer visuellement les champs de signature sur le PDF
- Drag & drop des champs sur le document

**Fichier à modifier** : `src/app/templates/[id]/edit/page.tsx`

---

### 5. Gestion de l'Expiration des Documents ⏰

**Temps estimé** : 1 heure

**Actions** :
- Ajouter un champ date d'expiration lors de l'envoi
- Vérifier l'expiration dans `/api/s/[slug]`
- Afficher un message d'erreur si expiré
- Marquer automatiquement comme "expired"

**Fichiers à modifier** :
- `src/app/templates/[id]/send/page.tsx` - Ajouter input date
- `src/app/api/submissions/route.ts` - Enregistrer expires_at
- `src/app/api/s/[slug]/route.ts` - Vérifier expiration

---

### 6. Rappels Automatiques 🔔

**Temps estimé** : 2-3 heures

**Deux approches** :
- **Simple** : Bouton manuel "Envoyer un rappel"
- **Avancé** : Cron job automatique (tous les 3 jours)

**Fichiers à créer** :
- `src/app/api/submissions/[id]/remind/route.ts` - Endpoint rappel
- Ajouter bouton dans `src/app/submissions/[id]/page.tsx`

---

### 7. Page de Statut Public (Sans Authentification) 🌐

**Temps estimé** : 1 heure

- Créer `/status/[slug]` pour voir l'avancement sans se connecter
- Utile pour partager avec des parties prenantes

---

## 🟢 PRIORITÉ BASSE - Améliorations & Polish

### 8. Webhooks 🔗

**Temps estimé** : 3-4 heures

- Interface pour configurer des webhooks
- Envoyer des events (signature_completed, etc.)
- Table `webhooks` déjà créée dans le schema ✅

---

### 9. Multi-langue (i18n) 🌍

**Temps estimé** : 4-6 heures

- Français, Anglais, Espagnol
- Utiliser `next-intl`
- Traduire toutes les pages et emails

---

### 10. Mode Sombre 🌙

**Temps estimé** : 2-3 heures

- Utiliser `next-themes`
- Adapter les couleurs burgundy/navy pour le dark mode
- Toggle dans le header

---

### 11. Folders pour Templates 📁

**Temps estimé** : 2-3 heures

- Table `folders` déjà créée ✅
- Interface pour créer des dossiers
- Organiser les templates dans des dossiers

---

### 12. Champs de Formulaire Personnalisés 📝

**Temps estimé** : 4-6 heures

- Ajouter texte, date, nombre, checkbox
- Pas seulement signature
- Validation des champs requis

---

### 13. API Publique 🔌

**Temps estimé** : 6-8 heures

- Documentation API (Swagger/OpenAPI)
- Authentication via API keys (table déjà créée ✅)
- Endpoints RESTful pour créer submissions via API

---

### 14. Tableau de Bord Analytique 📊

**Temps estimé** : 4-6 heures

- Graphiques de signatures dans le temps
- Taux de complétion
- Temps moyen de signature
- Utiliser `recharts` ou `chart.js`

---

### 15. Authentification à 2 Facteurs (2FA) 🔐

**Temps estimé** : 3-4 heures

- Utiliser Supabase Auth avec 2FA
- QR code TOTP
- SMS (via Twilio)

---

### 16. Templates Partagés 🤝

**Temps estimé** : 3-4 heures

- Partager des templates entre utilisateurs
- Marketplace de templates publics
- Templates d'équipe

---

### 17. Historique et Audit Log 📜

**Temps estimé** : 2-3 heures

- Table `events` déjà créée ✅
- Afficher l'historique complet d'une submission
- Qui a ouvert, quand, depuis quelle IP

---

### 18. Application Mobile 📱

**Temps estimé** : 20-40 heures

- React Native avec Expo
- Partager la logique avec le web
- Signature au doigt sur mobile

---

### 19. Mode Hors Ligne 📵

**Temps estimé** : 6-8 heures

- Service Worker
- PWA (Progressive Web App)
- Synchronisation quand la connexion revient

---

### 20. Tests Automatisés 🧪

**Temps estimé** : 8-12 heures

- Tests unitaires (Jest)
- Tests d'intégration (Playwright)
- Tests E2E du workflow complet
- CI/CD (GitHub Actions)

---

## 📊 Roadmap Suggérée

### Sprint 1 (Cette semaine - 4-6h)
- [x] Configuration Supabase
- [ ] Envoi automatique d'emails
- [ ] Génération PDF signés
- [ ] Téléchargement PDF

### Sprint 2 (Semaine prochaine - 6-8h)
- [ ] Visualiseur PDF dans éditeur
- [ ] Expiration des documents
- [ ] Rappels automatiques
- [ ] Page statut public

### Sprint 3 (Dans 2 semaines - 8-10h)
- [ ] Champs de formulaire personnalisés
- [ ] Folders pour templates
- [ ] Mode sombre
- [ ] Multi-langue

### Sprint 4 (Dans 1 mois - 10-15h)
- [ ] Webhooks
- [ ] API publique
- [ ] Analytique
- [ ] Tests automatisés

---

## 🎯 Prochaine Action Recommandée

**1. TESTER L'APPLICATION ACTUELLE** (30 min)
   - Workflow complet : signup → create template → send → sign
   - Noter les bugs éventuels
   - Vérifier l'UX

**2. CONFIGURER RESEND ET EMAILS** (45 min)
   - Impact immédiat sur l'expérience utilisateur
   - Critique pour la production

**3. GÉNÉRER LES PDF SIGNÉS** (2h)
   - Fonctionnalité attendue par les utilisateurs
   - Valeur ajoutée importante

---

## 📝 Notes

- **Priorités** : HAUTE 🔴 > MOYENNE 🟡 > BASSE 🟢
- **Dépendances** : Certaines fonctionnalités dépendent d'autres
- **Temps estimés** : Approximatifs, peuvent varier selon l'expérience
- **Ordre flexible** : Adaptez selon vos besoins business

---

**Dernière mise à jour** : 25 octobre 2025
**Version** : 0.9.0 (MVP presque complet)
**Prochaine version** : 1.0.0 (avec emails + PDF signés)
