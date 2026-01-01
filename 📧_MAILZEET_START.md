# 📧 MAILZEET - Configuration rapide

## ✅ Mailzeet est installé !

Votre application SignOfika utilise maintenant **Mailzeet** pour envoyer des emails.

---

## 🚀 Configuration en 3 étapes

### 1️⃣ Vous avez déjà vos clés
Vous avez créé votre compte Mailzeet et obtenu :
- ✅ **ID de l'application**
- ✅ **Clé API publique**

### 2️⃣ Configurez `.env.local`

Créez un fichier `.env.local` à la racine du projet :

```bash
MAILZEET_API_KEY=votre_cle_api_publique
MAILZEET_SENDER_EMAIL=votre-email@example.com
MAILZEET_SENDER_NAME=SignOfika
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Remplacez** :
- `votre_cle_api_publique` par votre **Clé API publique** Mailzeet
- `votre-email@example.com` par votre email

### 3️⃣ Testez

```bash
npm run test:mailzeet votre-email@example.com
```

---

## ✨ Fonctionnalités disponibles

- ✅ Envoi d'emails de demande de signature
- ✅ Notifications de signature complétée
- ✅ Emails de test
- ✅ Templates React Email
- ✅ Analytics en temps réel

---

## 🔗 Liens utiles

- **Dashboard** : https://app.mailzeet.com
- **Documentation** : https://docs.mailzeet.com
- **Support** : https://support.axazara.com

---

## 🆘 Problème ?

Consultez **MAILZEET_SETUP.md** pour plus de détails.

---

**Testez maintenant** : `npm run test:mailzeet votre-email@example.com`

🎉 **Bon envoi d'emails avec Mailzeet !**
