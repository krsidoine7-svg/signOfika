# 📧 Configuration Mailzeet pour SignOfika

## ✅ Mailzeet est maintenant configuré !

Mailzeet est un service d'envoi d'emails transactionnels développé par **Axazara** (entreprise française 🇫🇷).

---

## 🔑 Configuration de vos clés API

### 1. Récupérer vos clés depuis votre compte Mailzeet

Vous avez déjà créé votre compte et obtenu :
- **ID de l'application** (Application ID)
- **Clé API publique** (API Key)

### 2. Configurer `.env.local`

Créez ou modifiez le fichier `.env.local` à la racine de votre projet :

```bash
# Mailzeet Configuration
MAILZEET_API_KEY=votre_cle_api_ici
MAILZEET_SENDER_EMAIL=votre-email@example.com
MAILZEET_SENDER_NAME=SignOfika

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important** : Remplacez :
- `votre_cle_api_ici` par votre **Clé API publique** Mailzeet
- `votre-email@example.com` par votre adresse email vérifiée

---

## 🧪 Tester votre configuration

Une fois le fichier `.env.local` configuré :

```bash
npm run test:mailzeet votre-email@example.com
```

Vous devriez recevoir un email de test ! 🎉

---

## 📧 Utilisation dans votre code

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

### Envoyer une notification de signature complétée

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

## 🌐 API Endpoint

L'endpoint `/api/send-email` fonctionne de la même manière :

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

---

## 🔍 Où trouver vos clés Mailzeet

1. Connectez-vous à **https://app.mailzeet.com/**
2. Allez dans **Settings** (Paramètres)
3. Cliquez sur **Access Keys** ou **API Keys**
4. Copiez votre **API Key**

---

## 📊 Fonctionnalités Mailzeet

- ✅ **Emails transactionnels** - Parfait pour SignOfika
- ✅ **Analytics en temps réel** - Tracking des opens/clicks
- ✅ **Templates pré-designés** - +30 templates disponibles
- ✅ **Collaboration d'équipe** - Rôles et permissions
- ✅ **Infrastructure évolutive** - Délivrabilité éprouvée
- ✅ **Service français** - Axazara (RGPD compliant)

---

## 🆘 Dépannage

### ❌ "Invalid API Key" ou 401
→ Vérifiez que votre clé API est correcte dans `.env.local`
→ Assurez-vous qu'il n'y a pas d'espaces avant/après la clé

### ❌ "Sender email not verified" ou 400
→ Vérifiez votre email expéditeur dans Mailzeet
→ L'email doit être vérifié dans votre compte Mailzeet

### ❌ Les emails n'arrivent pas
→ Vérifiez vos spams/courriers indésirables
→ Consultez les logs dans votre dashboard Mailzeet
→ Testez avec `npm run test:mailzeet`

### ❌ Erreur de connexion
→ Vérifiez votre connexion internet
→ Vérifiez que l'API Mailzeet est accessible : https://status.axazara.com/

---

## 📚 Ressources

- **Site web** : https://mailzeet.com
- **Documentation** : https://docs.mailzeet.com
- **Dashboard** : https://app.mailzeet.com
- **Support** : https://support.axazara.com
- **Status** : https://status.axazara.com

---

## ✨ Avantages de Mailzeet

### 🇫🇷 Service français
- Développé par Axazara
- Infrastructure européenne
- Conformité RGPD

### 📊 Analytics avancés
- Taux d'ouverture
- Taux de clics
- Tracking en temps réel

### 🎨 Templates professionnels
- +30 templates pré-designés
- Éditeur drag-and-drop
- Responsive design

### 👥 Collaboration
- Gestion d'équipe
- Rôles et permissions
- Activités trackées

---

## 🎉 C'est prêt !

Votre application SignOfika peut maintenant envoyer des emails professionnels via Mailzeet !

**Première chose à faire** : Testez avec votre email
```bash
npm run test:mailzeet votre-email@example.com
```

---

*Service d'emails transactionnels par Axazara*
