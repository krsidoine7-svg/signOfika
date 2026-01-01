# Configuration Mailjet pour SignOfika

## 📧 Configuration de l'envoi d'emails avec Mailjet

Ce guide vous explique comment configurer Mailjet pour l'envoi d'emails et de notifications dans SignOfika.

## 🔑 Obtenir vos clés API Mailjet

1. Créez un compte sur [Mailjet](https://www.mailjet.com/)
2. Allez dans **Account Settings** > **API Keys**
3. Copiez votre **API Key** et **Secret Key**

## ⚙️ Configuration des variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env.local` :

```bash
# Mailjet Configuration
MAILJET_API_KEY=your_mailjet_api_key_here
MAILJET_SECRET_KEY=your_mailjet_secret_key_here
MAILJET_SENDER_EMAIL=noreply@yourdomain.com
MAILJET_SENDER_NAME=SignOfika
```

### Variables requises :

- **MAILJET_API_KEY** : Votre clé API Mailjet
- **MAILJET_SECRET_KEY** : Votre clé secrète Mailjet
- **MAILJET_SENDER_EMAIL** : L'adresse email d'expéditeur (doit être vérifiée dans Mailjet)
- **MAILJET_SENDER_NAME** : Le nom de l'expéditeur qui apparaîtra dans les emails

## 📨 Vérification de l'email expéditeur

### Pour le mode développement (Sandbox) :
- Vous pouvez utiliser n'importe quelle adresse email
- Les emails seront envoyés uniquement aux adresses vérifiées dans votre compte Mailjet

### Pour la production :
1. Allez dans **Account Settings** > **Sender Addresses & Domains**
2. Ajoutez et vérifiez votre domaine ou adresse email
3. Suivez les instructions de vérification (email de confirmation ou DNS)

## 🧪 Tester l'envoi d'emails

Une fois configuré, vous pouvez tester l'envoi d'emails via :

1. L'API endpoint : `POST /api/send-email`
2. La page de test : `/test-email` (si disponible)

Exemple de requête :

```javascript
fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'destinataire@example.com',
    type: 'test',
  }),
})
```

## 📋 Types d'emails disponibles

### 1. Email de test
```javascript
{
  to: 'email@example.com',
  type: 'test'
}
```

### 2. Demande de signature
```javascript
{
  to: 'email@example.com',
  type: 'signature-request',
  recipientName: 'Jean Dupont',
  senderName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  signatureUrl: 'https://yourdomain.com/sign/abc123'
}
```

### 3. Notification de signature complétée
```javascript
{
  to: 'email@example.com',
  type: 'signature-completed',
  recipientName: 'Marie Martin',
  documentName: 'Contrat de prestation',
  submitterName: 'Jean Dupont',
  downloadUrl: 'https://yourdomain.com/download/abc123'
}
```

## 🔍 Surveillance et statistiques

Mailjet offre un tableau de bord complet pour :
- Suivre les emails envoyés
- Voir les taux d'ouverture et de clics
- Gérer les bounces et les désinscriptions
- Consulter les logs d'envoi

Accédez à ces statistiques sur : https://app.mailjet.com/stats

## 🚨 Limites et quotas

### Plan gratuit Mailjet :
- **6 000 emails/mois** (200 emails/jour)
- Pas de limite de contacts
- Support par email

### Plans payants :
- À partir de 15€/mois pour 15 000 emails
- Support prioritaire
- Fonctionnalités avancées (A/B testing, segmentation, etc.)

## 🔧 Dépannage

### Erreur : "Invalid API Key"
- Vérifiez que vos clés API sont correctes dans `.env.local`
- Assurez-vous qu'il n'y a pas d'espaces avant ou après les clés

### Erreur : "Sender email not verified"
- Vérifiez votre adresse email dans les paramètres Mailjet
- En mode sandbox, ajoutez le destinataire comme contact vérifié

### Les emails n'arrivent pas
- Vérifiez les spams/courriers indésirables
- Consultez les logs dans le tableau de bord Mailjet
- Vérifiez que votre domaine n'est pas blacklisté

## 📚 Ressources

- [Documentation Mailjet](https://dev.mailjet.com/)
- [Node.js Wrapper](https://github.com/mailjet/mailjet-apiv3-nodejs)
- [Templates d'emails](https://app.mailjet.com/templates)

## 🔄 Migration depuis Resend

Si vous migrez depuis Resend :
1. ✅ Le package `node-mailjet` est déjà installé
2. ✅ Le code a été mis à jour pour utiliser Mailjet
3. ⚠️ Supprimez l'ancienne variable `RESEND_API_KEY` de votre `.env.local`
4. ✅ Ajoutez les nouvelles variables Mailjet (voir ci-dessus)
5. ✅ Les templates React Email continuent de fonctionner normalement

## 💡 Conseils

- **Testez d'abord en mode sandbox** avant de passer en production
- **Configurez SPF, DKIM et DMARC** pour améliorer la délivrabilité
- **Utilisez un domaine personnalisé** pour une meilleure réputation
- **Surveillez vos statistiques** régulièrement pour optimiser vos envois
