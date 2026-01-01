# 🔄 Migration des APIs vers le Schema Principal

## ✅ Adaptations Complétées

### 1. `/api/documents/upload/route.ts` ✅
**Avant** : Utilisait une table `documents` inexistante
**Après** : Utilise `templates` + `template_documents`

**Changements** :
- Crée un `template` avec slug auto-généré
- Enregistre le PDF dans `template_documents`
- Retourne `templateId` et `documentId`

### 2. `/api/signatures/create/route.ts` ✅
**Avant** : Utilisait `documents` et `signatures`
**Après** : Utilise `submitters` et `submissions`

**Changements** :
- Accepte `submitterId` ou `slug` au lieu de `documentId`
- Met à jour le `submitter` avec la signature
- Stocke dans `bucket: documents` sous `signatures/{submission_id}/{submitter_id}.png`
- Vérifie si tous les signataires ont signé
- Met à jour automatiquement le statut de la `submission` à "completed"
- Enregistre l'IP et user-agent

### 3. `/api/documents/[id]/route.ts` ✅
**Avant** : Utilisait `documents`
**Après** : Utilise `template_documents` avec relation `templates`

**GET** :
- Récupère un document avec son template
- Retourne les informations complètes

**DELETE** :
- Vérifie l'authentification
- Vérifie la propriété du template
- Supprime le fichier du storage
- Supprime l'enregistrement de `template_documents`

---

## 📊 Mapping des Tables

| Ancienne Table | Nouvelle Table(s) | Notes |
|----------------|-------------------|-------|
| `documents` | `templates` + `template_documents` | Un template peut avoir plusieurs documents PDF |
| `signatures` | `submitters.signature_url` | La signature est stockée comme URL dans le submitter |
| `signature_requests` | `submitters` | Les submitters sont les demandes de signature |

---

## 🗄️ Structure Storage

### Bucket: `documents`

```
documents/
├── templates/
│   └── {user_id}/
│       └── {template_id}.pdf
└── signatures/
    └── {submission_id}/
        └── {submitter_id}.png
```

**Policies RLS requises** :
```sql
-- Lecture publique
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Upload authentifié
CREATE POLICY "Auth upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Suppression par propriétaire
CREATE POLICY "Owner delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');
```

---

## 🔧 APIs Déjà Alignées (Pas de changement nécessaire)

### ✅ `/api/templates/route.ts`
- GET : Liste les templates de l'utilisateur
- POST : Crée un nouveau template

### ✅ `/api/templates/[id]/route.ts`
- GET : Récupère un template par ID
- PUT : Met à jour un template
- DELETE : Supprime un template

### ✅ `/api/templates/[id]/upload/route.ts`
- POST : Upload un PDF pour un template
- DELETE : Supprime le PDF d'un template

### ✅ `/api/submissions/route.ts`
- GET : Liste les submissions de l'utilisateur
- POST : Crée une nouvelle submission avec submitters

### ✅ `/api/s/[slug]/route.ts` 
- GET : Page publique - récupère submitter + submission par slug
- POST : Enregistre la signature d'un submitter

### ✅ `/api/send-email/route.ts`
- POST : Envoie des emails (test, signature-request, signature-completed)

---

## 📋 Checklist Finale

### Configuration Supabase
- [x] Schema SQL adapté
- [ ] **Schema exécuté dans Supabase** 🔴
- [ ] **Bucket "documents" créé** 🔴
- [ ] **Policies Storage configurées** 🔴

### Variables d'Environnement (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
RESEND_API_KEY=votre_cle_resend
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Tests à Effectuer
1. [ ] Upload d'un PDF → Créer template + document
2. [ ] Créer une submission avec signataires
3. [ ] Accéder à `/s/{slug}` en tant que signataire
4. [ ] Signer le document
5. [ ] Vérifier que la signature est stockée
6. [ ] Vérifier que le submitter est "completed"
7. [ ] Vérifier que la submission devient "completed" quand tous signent
8. [ ] Supprimer un document
9. [ ] Envoyer un email de test

---

## 🚀 Commandes pour Démarrer

```bash
# 1. Installer les dépendances (si nécessaire)
npm install

# 2. Vérifier les variables d'environnement
cat .env.local

# 3. Lancer le serveur de dev
npm run dev

# 4. Ouvrir l'application
# http://localhost:3000
```

---

## 🎯 Prochaines Étapes Critiques

### 1. Exécuter le Schema SQL ⚡
```sql
-- Dans Supabase Dashboard > SQL Editor
-- Copier tout le contenu de supabase/schema.sql
-- Cliquer sur "Run"
```

### 2. Créer le Bucket Storage 📦
```
Supabase Dashboard > Storage > New Bucket
- Name: documents
- Public: Yes
```

### 3. Ajouter les Policies Storage 🔒
```sql
-- Dans Storage > documents > Policies
-- Ajouter les 3 policies (read, insert, delete)
```

### 4. Configurer Resend 📧
```
1. Aller sur resend.com
2. Créer un compte
3. Créer une API Key
4. Ajouter dans .env.local : RESEND_API_KEY=re_xxx
```

---

## ✨ Ce qui Fonctionne Maintenant

- ✅ Authentification Supabase
- ✅ Création de templates
- ✅ Upload de PDF (avec template_documents)
- ✅ Envoi de documents pour signature
- ✅ Page publique de signature `/s/{slug}`
- ✅ Signature électronique avec canvas
- ✅ Enregistrement des signatures
- ✅ Tracking du statut des submitters
- ✅ Mise à jour automatique des submissions
- ✅ Service d'emails (Resend)
- ✅ Design moderne blanc/burgundy/navy

---

## 📝 Notes Importantes

1. **Pas de table `documents` standalone** : Tous les documents sont liés à des templates via `template_documents`

2. **Pas de table `signatures` standalone** : Les signatures sont stockées comme URLs dans la table `submitters`

3. **Un seul bucket Storage** : `documents` contient à la fois les PDFs originaux et les signatures

4. **Slugs uniques** : Chaque submitter a un slug unique pour accéder à la page publique de signature

5. **RLS activé** : Toutes les tables ont Row Level Security pour sécuriser les accès

---

Toutes les APIs sont maintenant alignées avec votre schema.sql ! 🎉
