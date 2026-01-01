# 🔄 Migration de Resend vers Mailjet

## Pourquoi Mailjet ?

Mailjet offre plusieurs avantages :
- ✅ **Plan gratuit généreux** : 6 000 emails/mois vs 100/jour pour Resend
- ✅ **Statistiques détaillées** : Taux d'ouverture, clics, bounces
- ✅ **Support multilingue** : Interface en français
- ✅ **Infrastructure européenne** : Conformité RGPD
- ✅ **Templates avancés** : Éditeur WYSIWYG intégré

## Changements effectués

### 1. Package npm
```diff
- "resend": "^6.2.2"
+ "node-mailjet": "^6.0.11"
```

### 2. Variables d'environnement

**Avant (Resend)** :
```bash
RESEND_API_KEY=re_xxxxx
```

**Après (Mailjet)** :
```bash
MAILJET_API_KEY=xxxxx
MAILJET_SECRET_KEY=xxxxx
MAILJET_SENDER_EMAIL=noreply@yourdomain.com
MAILJET_SENDER_NAME=SignOfika
```

### 3. Code d'initialisation

**Avant** :
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

**Après** :
```typescript
import Mailjet from 'node-mailjet'
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_SECRET_KEY || ''
)
```

### 4. Fonction d'envoi d'email

**Avant (Resend)** :
```typescript
const { data, error } = await resend.emails.send({
  from: 'SignOfika <onboarding@resend.dev>',
  to: [to],
  subject,
  react,
})
```

**Après (Mailjet)** :
```typescript
const htmlContent = render(react)

const request = mailjet.post('send', { version: 'v3.1' }).request({
  Messages: [
    {
      From: {
        Email: process.env.MAILJET_SENDER_EMAIL,
        Name: process.env.MAILJET_SENDER_NAME,
      },
      To: [{ Email: to }],
      Subject: subject,
      HTMLPart: htmlContent,
    },
  ],
})

const result = await request
```

## Compatibilité

### ✅ Ce qui reste identique

- **Templates React Email** : Aucun changement nécessaire
- **API endpoints** : `/api/send-email` fonctionne de la même manière
- **EmailService** : Les méthodes restent identiques
- **Types d'emails** : test, signature-request, signature-completed

### ⚠️ Ce qui change

1. **Configuration** : Nouvelles variables d'environnement
2. **Format de réponse** : Structure légèrement différente
3. **Gestion des erreurs** : Codes d'erreur Mailjet

## Checklist de migration

- [ ] Créer un compte Mailjet
- [ ] Obtenir les clés API et Secret Key
- [ ] Mettre à jour `.env.local` avec les nouvelles variables
- [ ] Supprimer l'ancienne variable `RESEND_API_KEY`
- [ ] Vérifier l'email expéditeur dans Mailjet
- [ ] Tester l'envoi avec `npm run test:mailjet votre-email@example.com`
- [ ] Vérifier que les emails arrivent bien
- [ ] Tester les différents types d'emails (test, signature-request, signature-completed)
- [ ] Configurer SPF/DKIM pour la production (optionnel mais recommandé)

## Comparaison des fonctionnalités

| Fonctionnalité | Resend | Mailjet |
|----------------|--------|---------|
| **Plan gratuit** | 100 emails/jour | 6 000 emails/mois |
| **Prix départ** | $20/mois (50k emails) | 15€/mois (15k emails) |
| **Templates React** | ✅ Natif | ✅ Via render() |
| **Statistiques** | ⚠️ Basiques | ✅ Avancées |
| **A/B Testing** | ❌ | ✅ (payant) |
| **WYSIWYG Editor** | ❌ | ✅ |
| **API REST** | ✅ | ✅ |
| **Webhooks** | ✅ | ✅ |
| **Support** | Email | Email + Chat |
| **RGPD** | ✅ | ✅ |

## Rollback (retour à Resend)

Si vous souhaitez revenir à Resend :

1. Réinstaller Resend :
```bash
npm install resend
```

2. Restaurer le code dans `src/lib/email.ts` :
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, react }: EmailOptions) {
  const { data, error } = await resend.emails.send({
    from: 'SignOfika <onboarding@resend.dev>',
    to: [to],
    subject,
    react,
  })
  
  if (error) {
    return { success: false, error }
  }
  
  return { success: true, data }
}
```

3. Mettre à jour `.env.local` :
```bash
RESEND_API_KEY=re_xxxxx
```

## Support

- **Mailjet** : https://www.mailjet.com/support/
- **Documentation** : https://dev.mailjet.com/
- **Status page** : https://status.mailjet.com/

## Ressources

- [Documentation Mailjet](https://dev.mailjet.com/)
- [Node.js Wrapper](https://github.com/mailjet/mailjet-apiv3-nodejs)
- [React Email](https://react.email/)
- [Mailjet vs Resend](https://www.mailjet.com/compare/)

---

**Questions ?** Consultez [MAILJET_SETUP.md](./MAILJET_SETUP.md) pour plus de détails.
