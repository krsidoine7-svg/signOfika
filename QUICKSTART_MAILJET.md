# 🚀 Démarrage rapide - Mailjet

## Configuration en 5 minutes

### 1️⃣ Créer un compte Mailjet
- Allez sur [mailjet.com](https://www.mailjet.com/)
- Créez un compte gratuit (6 000 emails/mois)

### 2️⃣ Obtenir vos clés API
1. Connectez-vous à Mailjet
2. Allez dans **Account Settings** → **API Keys** (Master & Sub-account)
3. Copiez votre **API Key** et **Secret Key**

### 3️⃣ Configurer les variables d'environnement
Créez ou modifiez votre fichier `.env.local` :

```bash
MAILJET_API_KEY=votre_api_key_ici
MAILJET_SECRET_KEY=votre_secret_key_ici
MAILJET_SENDER_EMAIL=votre-email@example.com
MAILJET_SENDER_NAME=SignOfika
```

### 4️⃣ Vérifier votre email expéditeur

**Mode développement (Sandbox)** :
- Pas besoin de vérification
- Les emails seront envoyés uniquement aux adresses que vous ajoutez dans Mailjet

**Mode production** :
1. Dans Mailjet, allez dans **Sender Addresses & Domains**
2. Cliquez sur **Add a Sender Address**
3. Entrez votre email et validez via le lien reçu

### 5️⃣ Tester l'envoi

Démarrez votre application :
```bash
npm run dev
```

Testez l'API d'envoi d'email :
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "votre-email@example.com",
    "type": "test"
  }'
```

## ✅ C'est prêt !

Votre application peut maintenant envoyer :
- 📧 Des demandes de signature
- ✅ Des notifications de signature complétée
- 📨 Des emails personnalisés

## 📖 Documentation complète

Pour plus de détails, consultez [MAILJET_SETUP.md](./MAILJET_SETUP.md)

## 🆘 Besoin d'aide ?

**Problème courant** : Les emails n'arrivent pas
- ✅ Vérifiez vos clés API dans `.env.local`
- ✅ Vérifiez les spams
- ✅ En mode sandbox, ajoutez le destinataire dans Mailjet
- ✅ Consultez les logs : https://app.mailjet.com/stats

**Support Mailjet** : https://www.mailjet.com/support/
