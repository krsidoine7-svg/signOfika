# Fonctionnalités de Signature Électronique - SignOfika

## ✅ Fonctionnalités Implémentées

### 1. Canvas de Signature Électronique
**Composant** : `src/components/signature-canvas.tsx`

**Caractéristiques** :
- ✅ Dessin de signature à la souris ou au tactile
- ✅ Effacement et recommencement
- ✅ Validation et sauvegarde en format PNG (base64)
- ✅ Interface intuitive avec boutons d'action
- ✅ Design cohérent (blanc/burgundy/navy)
- ✅ Support mobile et desktop

**Utilisation** :
```tsx
<SignatureCanvas 
  onSave={(dataUrl) => handleSignature(dataUrl)}
  onCancel={() => setShowCanvas(false)}
/>
```

---

### 2. Formulaire Public pour les Signataires
**Page** : `src/app/s/[slug]/page.tsx`

**Caractéristiques** :
- ✅ Page publique accessible sans authentification
- ✅ Lien unique par signataire via slug
- ✅ Affichage des informations du document
- ✅ Canvas de signature intégré
- ✅ Prévisualisation de la signature avant validation
- ✅ Modification possible de la signature
- ✅ Confirmation de signature avec valeur légale
- ✅ Page de succès après signature
- ✅ Vérification d'expiration du document

**URL Format** : `https://votreapp.com/s/{slug-unique-du-signataire}`

**API** : `src/app/api/s/[slug]/route.ts`
- **GET** : Récupère les informations du document à signer
- **POST** : Enregistre la signature et met à jour le statut

---

### 3. Gestion des Fichiers PDF
**Composant** : `src/components/pdf-upload.tsx`

**Caractéristiques** :
- ✅ Drag & drop de fichiers PDF
- ✅ Sélection par clic
- ✅ Validation du type (PDF uniquement)
- ✅ Limite de taille (10MB)
- ✅ Indicateur de progression
- ✅ Prévisualisation du fichier uploadé
- ✅ Suppression possible

**API** : `src/app/api/templates/[id]/upload/route.ts`
- **POST** : Upload du PDF vers Supabase Storage
- **DELETE** : Suppression du PDF

**Stockage** :
- Bucket Supabase : `documents`
- Chemin : `templates/{user_id}/{template_id}.pdf`

---

### 4. Page de Détails de Soumission
**Page** : `src/app/submissions/[id]/page.tsx`

**Caractéristiques** :
- ✅ Vue d'ensemble de la soumission
- ✅ Barre de progression (X sur Y signataires)
- ✅ Liste des signataires avec statuts
- ✅ Icônes de statut colorées (vert/jaune/rouge)
- ✅ Bouton "Copier le lien" pour chaque signataire
- ✅ Lien vers les signatures complétées
- ✅ Dates de signature
- ✅ Design moderne et responsive

**Statuts possibles** :
- 🟡 **pending** : En attente de signature
- 🔵 **opened** : Document ouvert par le signataire
- 🟢 **completed** : Signé
- 🔴 **declined** : Refusé

---

## 📋 Workflow Complet

### A. Création d'un Document à Signer

1. **Créer un template**
   - Aller sur `/templates/new`
   - Remplir le nom et la description
   - (Optionnel) Uploader un PDF

2. **Éditer le template**
   - Aller sur `/templates/{id}/edit`
   - Placer les champs de signature sur le document
   - Enregistrer

3. **Envoyer pour signature**
   - Aller sur `/templates/{id}/send`
   - Ajouter les signataires (nom + email)
   - Ajouter un message personnalisé
   - Cliquer sur "Envoyer"

### B. Signature du Document

1. **Signataire reçoit le lien** : `/s/{slug-unique}`
2. **Ouverture de la page publique**
   - Voir les informations du document
   - Dessiner la signature sur le canvas
   - Valider la signature
3. **Confirmation**
   - Page de succès
   - Email de confirmation (à implémenter)

### C. Suivi des Signatures

1. **Liste des soumissions** : `/submissions`
   - Voir toutes les soumissions
   - Filtrer par statut

2. **Détails d'une soumission** : `/submissions/{id}`
   - Progression en temps réel
   - Statut de chaque signataire
   - Copier les liens de signature
   - Télécharger les signatures

---

## 🗄️ Structure de la Base de Données

### Table : `submitters`
```sql
- id (uuid)
- submission_id (uuid) -> submissions.id
- email (text)
- name (text)
- slug (text, unique) -- Pour l'URL publique
- status (text) -- pending, opened, completed, declined
- signature_url (text) -- URL de l'image de signature
- values (jsonb) -- Valeurs des champs remplis
- completed_at (timestamptz)
- position (integer) -- Ordre de signature
```

### Bucket Storage : `documents`
```
documents/
  ├── templates/{user_id}/{template_id}.pdf
  └── signatures/{submission_id}/{submitter_id}.png
```

---

## 🎨 Design System

### Couleurs
- **Primary** : Burgundy (#8B0000) - Boutons principaux
- **Secondary** : Navy (#1a1a3e) - Titres
- **Background** : White (#ffffff) et Gray-50 (#f9fafb)
- **Text** : Navy-900 pour titres, Gray-600 pour contenu

### Composants
- **Signature Canvas** : Bordure dashed gray-300, fond blanc
- **Boutons** : 
  - Primary : bg-burgundy-600 hover:bg-burgundy-700
  - Outline : border-gray-300 hover:bg-gray-100
- **Cards** : bg-white border-gray-200 shadow-sm

---

## 🔐 Sécurité

### Implémenté
- ✅ Authentification Supabase pour les créateurs
- ✅ Accès public sécurisé par slug unique
- ✅ Vérification de propriété des templates
- ✅ Vérification d'expiration des documents
- ✅ Validation du statut avant signature

### À Implémenter
- 🔲 Hash des slugs pour plus de sécurité
- 🔲 Rate limiting sur les endpoints publics
- 🔲 Logs d'audit pour les signatures
- 🔲 Certificats de signature électronique

---

## 📧 Notifications (À Implémenter)

### Emails à Envoyer
1. **Invitation à signer**
   - À : Signataire
   - Contenu : Lien vers `/s/{slug}`, message personnalisé
   
2. **Rappel de signature**
   - À : Signataires en attente
   - Fréquence : Configurable

3. **Document complété**
   - À : Créateur + Tous les signataires
   - Contenu : Lien de téléchargement du PDF signé

---

## 📄 Génération de PDF Signés (À Implémenter)

### Librairie Recommandée
- **pdf-lib** : Manipulation de PDF en JavaScript
- **jsPDF** : Génération de PDF

### Workflow
1. Récupérer le PDF original (si uploadé)
2. Ajouter les signatures aux positions définies
3. Ajouter un certificat de signature
4. Sauvegarder dans Storage
5. Envoyer par email

### Code Exemple
```typescript
import { PDFDocument } from 'pdf-lib'

async function generateSignedPDF(submission) {
  // Charger le PDF original
  const pdfBytes = await fetch(submission.template.document_url).then(r => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(pdfBytes)
  
  // Pour chaque signataire
  for (const submitter of submission.submitters) {
    if (submitter.signature_url) {
      const signatureBytes = await fetch(submitter.signature_url).then(r => r.arrayBuffer())
      const signatureImage = await pdfDoc.embedPng(signatureBytes)
      
      // Placer la signature
      const page = pdfDoc.getPage(0)
      page.drawImage(signatureImage, {
        x: submitter.position_x,
        y: submitter.position_y,
        width: 100,
        height: 50,
      })
    }
  }
  
  // Sauvegarder
  const signedPdfBytes = await pdfDoc.save()
  return signedPdfBytes
}
```

---

## 🚀 Prochaines Étapes

### Prioritaires
1. ✅ Canvas de signature ✓
2. ✅ Page publique de signature ✓
3. ✅ Upload de fichiers PDF ✓
4. ✅ Gestion des signataires ✓
5. 🔲 Envoi d'emails (Resend ou SendGrid)
6. 🔲 Génération de PDF signés
7. 🔲 Téléchargement des documents

### Améliorations Futures
- Signature au clavier (typing)
- Signature uploadée (image)
- Champs de formulaire personnalisés
- Templates partagés entre utilisateurs
- Dossiers pour organiser les templates
- Webhooks pour intégrations
- API publique
- Authentification à 2 facteurs
- Mode hors ligne
- Application mobile

---

## 📱 Pages et Routes

| Route | Type | Description |
|-------|------|-------------|
| `/templates` | Privé | Liste des templates |
| `/templates/new` | Privé | Créer un template |
| `/templates/{id}/edit` | Privé | Éditeur de template |
| `/templates/{id}/send` | Privé | Envoyer pour signature |
| `/submissions` | Privé | Liste des soumissions |
| `/submissions/{id}` | Privé | Détails d'une soumission |
| `/s/{slug}` | **Public** | Page de signature |

---

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : TailwindCSS, shadcn/ui
- **Backend** : Next.js API Routes
- **Database** : Supabase (PostgreSQL)
- **Storage** : Supabase Storage
- **Auth** : Supabase Auth

---

## 📝 Notes Importantes

1. **Slugs uniques** : Générés via `generateSlug()` dans `lib/utils.ts`
2. **Signatures** : Stockées en PNG (base64 → Blob → Storage)
3. **RLS Policies** : À configurer dans Supabase pour sécuriser l'accès
4. **CORS** : Configurer pour les uploads de fichiers
5. **Rate Limiting** : À implémenter pour les endpoints publics

---

Toutes les fonctionnalités de signature électronique sont maintenant en place ! 🎉
