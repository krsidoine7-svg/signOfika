# 📧 Mailjet - Guide Simple en Français

## 🎯 Qu'est-ce qui a été fait ?

J'ai installé et configuré **Mailjet** dans votre application SignOfika pour envoyer des emails et des notifications.

---

## ✅ Ce qui fonctionne maintenant

Votre application peut envoyer :
- ✉️ Des **demandes de signature** par email
- ✅ Des **notifications** quand un document est signé
- 🧪 Des **emails de test** pour vérifier que tout marche

---

## 🚀 Comment démarrer (3 étapes simples)

### Étape 1 : Créer un compte Mailjet (gratuit)
1. Allez sur **https://www.mailjet.com/**
2. Créez un compte gratuit (6 000 emails/mois offerts)
3. Confirmez votre email

### Étape 2 : Récupérer vos clés
1. Connectez-vous à Mailjet
2. Cliquez sur votre nom en haut à droite
3. Allez dans **Account Settings** (Paramètres du compte)
4. Cliquez sur **API Keys** dans le menu
5. Copiez votre **API Key** et **Secret Key**

### Étape 3 : Configurer votre application
1. Ouvrez (ou créez) le fichier `.env.local` à la racine de votre projet
2. Ajoutez ces lignes (remplacez par vos vraies clés) :

```bash
MAILJET_API_KEY=votre_api_key_ici
MAILJET_SECRET_KEY=votre_secret_key_ici
MAILJET_SENDER_EMAIL=votre-email@example.com
MAILJET_SENDER_NAME=SignOfika
```

**Important** : Remplacez `votre-email@example.com` par votre vraie adresse email !

---

## 🧪 Tester que ça marche

Ouvrez un terminal dans votre projet et tapez :

```bash
npm run test:mailjet votre-email@example.com
```

(Remplacez `votre-email@example.com` par votre vraie adresse)

Vous devriez recevoir un email de test ! 🎉

---

## 📧 Vérifier votre email d'expéditeur

### Pour tester (mode développement)
- Pas besoin de vérification spéciale
- Mais vous devez ajouter votre email dans Mailjet :
  1. Allez dans **Contacts** dans Mailjet
  2. Ajoutez votre email
  3. Confirmez-le

### Pour la production (vrais clients)
1. Dans Mailjet, allez dans **Sender Addresses & Domains**
2. Cliquez sur **Add a Sender Address**
3. Entrez votre email professionnel
4. Cliquez sur le lien de vérification reçu par email

---

## 💰 C'est gratuit ?

**Oui !** Le plan gratuit de Mailjet offre :
- ✅ **6 000 emails par mois** (200 par jour)
- ✅ Statistiques de base
- ✅ Support par email
- ✅ Toutes les fonctionnalités de base

**Plans payants** (si vous avez besoin de plus) :
- À partir de **15€/mois** pour 15 000 emails
- Support prioritaire
- Fonctionnalités avancées

---

## 🔍 Voir vos statistiques

Vous pouvez voir combien d'emails ont été envoyés, ouverts, etc. :

👉 **https://app.mailjet.com/stats**

---

## 📚 Documentation disponible

J'ai créé plusieurs guides pour vous aider :

| Fichier | C'est pour quoi ? |
|---------|-------------------|
| **LISEZMOI_MAILJET.md** | Ce fichier - Guide simple |
| **QUICKSTART_MAILJET.md** | Démarrage rapide (5 min) |
| **MAILJET_SETUP.md** | Guide complet et détaillé |
| **MAILJET_EXAMPLES.md** | Exemples de code |
| **MAILJET_README.md** | Vue d'ensemble technique |

---

## 🆘 Problèmes courants

### ❌ "Invalid API Key" (Clé API invalide)
**Solution** : Vérifiez que vous avez bien copié vos clés dans `.env.local`

### ❌ "Sender email not verified" (Email non vérifié)
**Solution** : Vérifiez votre email dans Mailjet (voir section ci-dessus)

### ❌ Je ne reçois pas les emails
**Solutions** :
1. Vérifiez vos **spams/courriers indésirables**
2. En mode test, ajoutez votre email dans Mailjet
3. Consultez les logs : https://app.mailjet.com/stats

### ❌ L'email arrive mais il est moche
**Solution** : C'est normal en mode test. Les vrais templates sont beaux !

---

## 🎨 Comment utiliser dans votre code

### Envoyer un email de test
```typescript
import { EmailService } from '@/lib/email-service'

await EmailService.sendTestEmail('destinataire@example.com')
```

### Envoyer une demande de signature
```typescript
await EmailService.sendSignatureRequest({
  to: 'client@example.com',
  recipientName: 'Jean Dupont',
  senderName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  signatureUrl: 'https://votre-site.com/sign/abc123'
})
```

### Envoyer une notification de signature
```typescript
await EmailService.sendSignatureCompleted({
  to: 'expediteur@example.com',
  recipientName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  submitterName: 'Jean Dupont',
  downloadUrl: 'https://votre-site.com/download/abc123'
})
```

---

## 🔐 Sécurité

**Important** :
- ❌ Ne partagez **JAMAIS** vos clés API publiquement
- ❌ Ne les mettez **JAMAIS** sur GitHub
- ✅ Gardez-les dans `.env.local` (ce fichier est ignoré par Git)
- ✅ Utilisez des clés différentes pour le développement et la production

---

## 📞 Besoin d'aide ?

### Documentation Mailjet
- Site officiel : https://www.mailjet.com/
- Documentation : https://dev.mailjet.com/
- Support : https://www.mailjet.com/support/

### Vos fichiers d'aide
- **QUICKSTART_MAILJET.md** - Démarrage rapide
- **MAILJET_SETUP.md** - Guide complet
- **MAILJET_EXAMPLES.md** - Exemples de code

---

## ✨ Prochaines étapes

1. ✅ Créer votre compte Mailjet
2. ✅ Configurer vos clés dans `.env.local`
3. ✅ Tester avec `npm run test:mailjet`
4. ✅ Vérifier votre email d'expéditeur
5. 🎉 Commencer à envoyer des emails !

---

## 🎉 C'est tout !

Votre application est prête à envoyer des emails professionnels.

**Première chose à faire** : Testez avec votre email
```bash
npm run test:mailjet votre-email@example.com
```

---

*Créé avec ❤️ pour SignOfika*
