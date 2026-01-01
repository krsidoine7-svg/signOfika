# SignOfika

**Plateforme de signature électronique de documents** construite avec Next.js et Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)](https://tailwindcss.com/)

## 📋 Description

SignOfika est une application open source inspirée de DocuSeal qui permet de :
- ✍️ Créer des templates de documents avec des champs personnalisables
- 📝 Envoyer des documents à signer électroniquement
- 🔐 Gérer les signatures avec authentification sécurisée
- 📊 Suivre l'état des soumissions en temps réel
- 🎯 Gérer plusieurs signataires par document

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Un compte Supabase (gratuit)

### Installation

1. **Cloner le projet** (si depuis un repo Git)
   ```bash
   git clone [url-du-repo]
   cd signofika
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   - Créez un projet sur [supabase.com](https://supabase.com)
   - Exécutez le script `supabase/schema.sql` dans l'éditeur SQL
   - Copiez vos credentials dans `.env.local`

4. **Démarrer l'application**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 📚 Documentation complète

- 📖 [SETUP.md](./SETUP.md) - Instructions détaillées de configuration
- 🗄️ [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Configuration de la base de données Supabase
- 🧪 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guide de test complet de toutes les fonctionnalités

## 🎯 Fonctionnalités

### Actuellement implémentées

- ✅ Authentification (inscription/connexion avec Supabase Auth)
- ✅ Dashboard avec statistiques
- ✅ Gestion des documents (upload, visualisation, suppression)
- ✅ Visualiseur PDF intégré
- ✅ Composant de signature électronique avec canvas
- ✅ Demandes de signature par email
- ✅ Envoi d'emails automatiques (Resend + React Email)
- ✅ Suivi des signatures avec statuts
- ✅ Interface responsive avec Tailwind CSS
- ✅ Base de données complète avec RLS
- ✅ Stockage sécurisé des documents et signatures

### En développement

- 🚧 Éditeur de templates PDF avancé
- 🚧 Signatures multi-parties
- 🚧 Webhooks pour intégrations externes
- 🚧 Export des documents signés avec certificats
- 🚧 Historique complet des actions
- 🚧 Notifications en temps réel

## 🛠️ Technologies

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage
- **Emails**: Resend + React Email
- **PDF**: react-pdf (PDF.js)
- **Signature**: react-signature-canvas
- **Styling**: TailwindCSS + Shadcn UI
- **UI Components**: Radix UI
- **Notifications**: Sonner
- **Icônes**: Lucide React

## 📁 Structure du projet

```
signofika/
├── src/
│   ├── app/              # Pages et routes Next.js
│   ├── components/       # Composants React réutilisables
│   ├── lib/             # Utilitaires et configurations
│   └── types/           # Types TypeScript
├── supabase/
│   └── schema.sql       # Schéma de base de données
└── public/              # Fichiers statiques
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 Licence

Ce projet est open source.

## 🙏 Remerciements

Inspiré par [DocuSeal](https://github.com/docusealco/docuseal)
