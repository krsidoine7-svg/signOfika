# 📧 Mailjet - Configuration Email pour SignOfika

## ✅ Installation terminée

Mailjet a été installé et configuré avec succès dans votre application SignOfika !

## 📦 Ce qui a été fait

### 1. Installation du package
- ✅ `node-mailjet` v6.0.11 installé
- ✅ `dotenv` installé pour les tests
- ✅ Package `resend` remplacé par `node-mailjet`

### 2. Fichiers modifiés
- ✅ `src/lib/email.ts` - Service d'envoi d'emails mis à jour pour Mailjet
- ✅ `package.json` - Dépendances et scripts mis à jour

### 3. Fichiers créés
- ✅ `MAILJET_SETUP.md` - Documentation complète
- ✅ `QUICKSTART_MAILJET.md` - Guide de démarrage rapide
- ✅ `env.template` - Template des variables d'environnement
- ✅ `test-mailjet.js` - Script de test de configuration
- ✅ `MAILJET_README.md` - Ce fichier

## 🚀 Prochaines étapes

### 1. Configurer vos clés API

Créez ou modifiez votre fichier `.env.local` :

```bash
# Mailjet Configuration
MAILJET_API_KEY=votre_api_key_mailjet
MAILJET_SECRET_KEY=votre_secret_key_mailjet
MAILJET_SENDER_EMAIL=noreply@yourdomain.com
MAILJET_SENDER_NAME=SignOfika
```

**Comment obtenir vos clés ?**
1. Créez un compte sur [mailjet.com](https://www.mailjet.com/) (gratuit)
2. Allez dans **Account Settings** → **API Keys**
3. Copiez votre **API Key** et **Secret Key**

### 2. Tester la configuration

```bash
# Tester avec votre email
npm run test:mailjet votre-email@example.com
```

### 3. Vérifier votre email expéditeur

**Mode développement** : Pas besoin de vérification, mais les emails ne seront envoyés qu'aux adresses vérifiées dans Mailjet.

**Mode production** : Vérifiez votre domaine ou email dans Mailjet :
- Allez dans **Sender Addresses & Domains**
- Ajoutez et vérifiez votre email/domaine

## 📚 Documentation

- **[QUICKSTART_MAILJET.md](./QUICKSTART_MAILJET.md)** - Démarrage en 5 minutes
- **[MAILJET_SETUP.md](./MAILJET_SETUP.md)** - Documentation complète
- **[env.template](./env.template)** - Template des variables d'environnement

## 🔧 Utilisation dans le code

### Envoyer un email de test

```javascript
import { EmailService } from '@/lib/email-service'

await EmailService.sendTestEmail('destinataire@example.com')
```

### Envoyer une demande de signature

```javascript
await EmailService.sendSignatureRequest({
  to: 'client@example.com',
  recipientName: 'Jean Dupont',
  senderName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  signatureUrl: 'https://yourdomain.com/sign/abc123'
})
```

### Envoyer une notification de signature complétée

```javascript
await EmailService.sendSignatureCompleted({
  to: 'client@example.com',
  recipientName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  submitterName: 'Jean Dupont',
  downloadUrl: 'https://yourdomain.com/download/abc123'
})
```

## 🌐 API Endpoint

L'endpoint `/api/send-email` est déjà configuré et prêt à l'emploi :

```bash
# Email de test
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "test"
  }'

# Demande de signature
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "client@example.com",
    "type": "signature-request",
    "recipientName": "Jean Dupont",
    "senderName": "Marie Martin",
    "documentName": "Contrat",
    "signatureUrl": "https://app.com/sign/123"
  }'
```

## 📊 Limites Mailjet

### Plan gratuit
- **6 000 emails/mois** (200/jour)
- Support par email
- Statistiques de base

### Plans payants
- À partir de **15€/mois** pour 15 000 emails
- Support prioritaire
- Fonctionnalités avancées

## 🔍 Surveillance

Consultez vos statistiques d'envoi sur :
👉 https://app.mailjet.com/stats

## 🆘 Support

- **Documentation Mailjet** : https://dev.mailjet.com/
- **Support Mailjet** : https://www.mailjet.com/support/
- **Wrapper Node.js** : https://github.com/mailjet/mailjet-apiv3-nodejs

## ⚠️ Notes importantes

1. **Mode Sandbox** : En développement, les emails ne sont envoyés qu'aux adresses vérifiées dans votre compte Mailjet
2. **Vérification du domaine** : Pour la production, vérifiez votre domaine pour améliorer la délivrabilité
3. **SPF/DKIM** : Configurez ces enregistrements DNS pour éviter que vos emails soient marqués comme spam
4. **Templates React Email** : Vos templates existants continuent de fonctionner normalement

## ✨ Fonctionnalités

- ✅ Envoi d'emails transactionnels
- ✅ Templates React Email
- ✅ Notifications de signature
- ✅ Emails de test
- ✅ Statistiques et tracking
- ✅ Support HTML et texte brut
- ✅ Gestion des erreurs

---

**Besoin d'aide ?** Consultez [MAILJET_SETUP.md](./MAILJET_SETUP.md) pour plus de détails.
