# Guide de test - SignOfika

Ce guide vous explique comment tester toutes les fonctionnalités de l'application SignOfika.

## Prérequis

1. ✅ Base de données Supabase configurée (voir `DATABASE_SETUP.md`)
2. ✅ Variables d'environnement configurées dans `.env.local`
3. ✅ Dépendances installées (`npm install`)
4. ✅ Serveur de développement démarré (`npm run dev`)

## Configuration de test

### 1. Resend (envoi d'emails)

```env
RESEND_API_KEY=re_votre_cle_api
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note importante** : Avec un compte Resend gratuit, vous ne pouvez envoyer des emails qu'à votre propre adresse email. Pour tester avec plusieurs destinataires, vous devez vérifier un domaine.

### 2. Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

## Scénarios de test

### Test 1 : Authentification

#### 1.1 Inscription
1. Accédez à `http://localhost:3001/signup`
2. Remplissez le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `Test123456!`
3. Cliquez sur "Créer un compte"
4. Vérifiez votre email pour confirmer l'inscription
5. ✅ Vous devriez être redirigé vers `/documents`

#### 1.2 Connexion
1. Accédez à `http://localhost:3001/login`
2. Entrez vos identifiants
3. Cliquez sur "Se connecter"
4. ✅ Vous devriez être redirigé vers `/documents`

#### 1.3 Déconnexion
1. Cliquez sur le bouton "Déconnexion" dans le header
2. ✅ Vous devriez être redirigé vers `/login`

### Test 2 : Envoi d'emails

#### 2.1 Email de test
1. Accédez à `http://localhost:3001/test-email`
2. Vérifiez que votre email est pré-rempli
3. Cliquez sur "Envoyer un email de test"
4. ✅ Vous devriez recevoir un email dans quelques secondes
5. ✅ Un message de succès devrait apparaître

**Vérifications** :
- Email reçu avec le bon template
- Liens fonctionnels dans l'email
- Pas d'erreurs dans la console

### Test 3 : Gestion des documents

#### 3.1 Téléversement d'un document
1. Connectez-vous à l'application
2. Accédez à `http://localhost:3001/documents`
3. Cliquez sur "Nouveau document"
4. Sélectionnez un fichier PDF (max 10MB)
5. Entrez un nom : "Contrat de test"
6. Cliquez sur "Créer le document"
7. ✅ Vous devriez être redirigé vers la page du document
8. ✅ Le document devrait s'afficher dans le viewer

**Vérifications** :
- Document visible dans la liste
- Statut : "pending"
- Date de création correcte
- Prévisualisation PDF fonctionnelle

#### 3.2 Visualisation d'un document
1. Dans la liste des documents, cliquez sur un document
2. ✅ Le PDF devrait s'afficher
3. Testez la navigation entre les pages (si plusieurs pages)
4. ✅ Les détails du document sont affichés (date, statut)

#### 3.3 Suppression d'un document
1. Sur la page d'un document, cherchez le bouton de suppression
2. Confirmez la suppression
3. ✅ Le document devrait être supprimé
4. ✅ Le fichier devrait être supprimé du stockage Supabase

### Test 4 : Demande de signature

#### 4.1 Envoyer une demande de signature
1. Ouvrez un document
2. Allez dans l'onglet "Signataires" > "Demander"
3. Remplissez le formulaire :
   - Nom du signataire : "Jean Dupont"
   - Email : Votre email (à cause des limitations Resend)
   - Message : "Merci de signer ce document"
4. Cliquez sur "Envoyer la demande de signature"
5. ✅ Un message de succès devrait apparaître
6. ✅ Vous devriez recevoir un email avec :
   - Nom de l'expéditeur
   - Nom du document
   - Bouton "Signer le document"

**Vérifications** :
- Email reçu avec template correct
- Lien de signature fonctionnel
- Pas d'erreurs dans la console

### Test 5 : Signature d'un document

#### 5.1 Signer un document
1. Cliquez sur le lien dans l'email de demande de signature
2. Ou accédez directement à : `http://localhost:3001/sign/[document-id]?token=unique-token`
3. Le document devrait s'afficher
4. Remplissez le formulaire :
   - Nom complet : "Jean Dupont"
   - Email : "jean.dupont@example.com"
5. Dessinez votre signature dans le cadre
6. Cliquez sur "Signer le document"
7. ✅ Un message de succès devrait apparaître
8. ✅ Le propriétaire du document devrait recevoir un email de notification

**Vérifications** :
- Signature enregistrée dans la base de données
- Fichier de signature uploadé dans le bucket `signatures`
- Statut du document mis à jour : "signed"
- Email de notification reçu par le propriétaire

#### 5.2 Visualiser les signatures
1. Retournez sur la page du document (en tant que propriétaire)
2. Allez dans l'onglet "Signataires" > "Statut"
3. ✅ La signature devrait apparaître avec :
   - Nom du signataire
   - Email du signataire
   - Date et heure de signature
   - Lien vers la signature

### Test 6 : Scénarios d'erreur

#### 6.1 Document non trouvé
1. Accédez à `http://localhost:3001/documents/id-inexistant`
2. ✅ Une page 404 devrait s'afficher

#### 6.2 Fichier invalide
1. Essayez de téléverser un fichier qui n'est pas un PDF
2. ✅ Un message d'erreur devrait apparaître

#### 6.3 Fichier trop volumineux
1. Essayez de téléverser un fichier > 10MB
2. ✅ Un message d'erreur devrait apparaître

#### 6.4 Signature déjà effectuée
1. Essayez de signer deux fois le même document avec le même email
2. ✅ Un message d'erreur "Vous avez déjà signé ce document" devrait apparaître

#### 6.5 Champs manquants
1. Essayez de soumettre un formulaire sans remplir tous les champs
2. ✅ Des messages d'erreur devraient apparaître

### Test 7 : Navigation et UX

#### 7.1 Navigation
1. Testez tous les liens du header
2. ✅ Tous les liens devraient fonctionner
3. ✅ Le logo devrait rediriger vers la page d'accueil

#### 7.2 Responsive
1. Testez l'application sur mobile (DevTools > Toggle device toolbar)
2. ✅ L'interface devrait être responsive
3. ✅ Les composants devraient s'adapter à la taille de l'écran

#### 7.3 Notifications
1. Testez différentes actions (upload, signature, etc.)
2. ✅ Des notifications toast devraient apparaître
3. ✅ Les notifications devraient se fermer automatiquement

## Checklist de test complète

### Authentification
- [ ] Inscription avec email valide
- [ ] Confirmation d'email
- [ ] Connexion avec email/mot de passe
- [ ] Déconnexion
- [ ] Redirection automatique quand connecté

### Documents
- [ ] Téléversement d'un PDF
- [ ] Visualisation d'un document
- [ ] Liste des documents
- [ ] Suppression d'un document
- [ ] Téléchargement d'un document

### Signatures
- [ ] Envoi d'une demande de signature
- [ ] Réception de l'email de demande
- [ ] Signature d'un document
- [ ] Visualisation des signatures
- [ ] Réception de l'email de confirmation

### Emails
- [ ] Email de test
- [ ] Email de demande de signature
- [ ] Email de signature complétée
- [ ] Templates corrects
- [ ] Liens fonctionnels

### Sécurité
- [ ] RLS activé sur les tables
- [ ] Accès restreint aux documents du propriétaire
- [ ] Validation des entrées utilisateur
- [ ] Gestion des erreurs

### Performance
- [ ] Chargement rapide des pages
- [ ] Pas de fuites mémoire
- [ ] Images/PDF optimisés
- [ ] Pas de requêtes inutiles

## Bugs connus

1. **Limitation Resend** : En mode test, les emails ne peuvent être envoyés qu'à votre propre adresse
   - Solution : Vérifier un domaine sur Resend pour lever cette limitation

2. **PDF Worker** : Si le PDF ne s'affiche pas, vérifiez que le worker PDF.js est correctement chargé
   - Solution : Vérifier les logs de la console

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de la console (F12)
2. Vérifiez les logs Supabase
3. Consultez la documentation :
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Resend](https://resend.com/docs)
4. Ouvrez une issue sur GitHub
