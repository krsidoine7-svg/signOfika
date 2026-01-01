# Guide de configuration SignOfika

## Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- npm ou yarn

## Étape 1: Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et votre **anon public key**

### 1.2 Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez tout le contenu du fichier `supabase/schema.sql`
3. Collez-le dans l'éditeur SQL et exécutez-le
4. Cela créera toutes les tables nécessaires

### 1.3 Configurer le stockage (Storage)

1. Allez dans **Storage** dans Supabase
2. Créez les buckets suivants :
   - `templates` (public)
   - `submissions` (private)
   - `attachments` (private)
   - `signatures` (private)

3. Pour chaque bucket, configurez les politiques RLS appropriées

## Étape 2: Configuration de l'application

### 2.1 Variables d'environnement

Le fichier `.env.local` est déjà configuré avec :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

### 2.2 Installer les dépendances

```bash
npm install
```

## Étape 3: Démarrer l'application

### Mode développement

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

### Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
signofika/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── login/             # Connexion
│   │   ├── signup/            # Inscription
│   │   ├── dashboard/         # Tableau de bord
│   │   ├── templates/         # Gestion des templates
│   │   ├── submissions/       # Gestion des soumissions
│   │   └── api/               # API Routes
│   ├── components/            # Composants React réutilisables
│   │   └── ui/               # Composants UI de base
│   ├── lib/                   # Utilitaires et configurations
│   │   ├── supabase/         # Configuration Supabase
│   │   └── utils.ts          # Fonctions utilitaires
│   └── types/                # Types TypeScript
│       └── database.ts       # Types de la base de données
├── supabase/
│   └── schema.sql            # Schéma de la base de données
└── public/                   # Fichiers statiques
```

## Fonctionnalités principales

### ✅ Implémentées

- **Authentification**
  - Inscription / Connexion
  - Session persistante
  - Déconnexion

- **Templates**
  - Création de templates
  - Liste des templates
  - Gestion des dossiers

- **Soumissions**
  - Création de soumissions
  - Liste des soumissions
  - Suivi des statuts

- **Dashboard**
  - Vue d'ensemble des statistiques
  - Actions rapides

### 🚧 À implémenter

- **Éditeur de templates**
  - Ajout de champs (signature, texte, date, etc.)
  - Positionnement sur le PDF
  - Prévisualisation

- **Formulaire de signature**
  - Interface de signature pour les destinataires
  - Canvas de signature
  - Validation des champs

- **Gestion des fichiers**
  - Upload de PDF
  - Génération de PDF signés
  - Stockage Supabase

- **Notifications**
  - Emails automatiques
  - Rappels
  - Webhooks

- **API complète**
  - Endpoints REST
  - Documentation API
  - Authentification par clé API

## Utilisation

### 1. Créer un compte

1. Allez sur http://localhost:3000
2. Cliquez sur "Commencer" ou "S'inscrire"
3. Remplissez le formulaire d'inscription

### 2. Créer un template

1. Connectez-vous à votre compte
2. Allez dans "Templates"
3. Cliquez sur "Nouveau template"
4. Remplissez les informations

### 3. Envoyer un document

1. Sélectionnez un template
2. Cliquez sur "Envoyer"
3. Ajoutez les destinataires
4. Envoyez le document

## Dépannage

### Erreur de connexion à Supabase

- Vérifiez que vos variables d'environnement dans `.env.local` sont correctes
- Assurez-vous que le schéma SQL a été exécuté dans Supabase

### Erreur 401 Unauthorized

- Vérifiez que vous êtes bien connecté
- Essayez de vous déconnecter et reconnecter

### Les pages ne se chargent pas

- Vérifiez que le serveur de développement est bien démarré
- Regardez les logs dans la console

## Technologies utilisées

- **Framework**: Next.js 15 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage
- **UI**: TailwindCSS + Radix UI
- **Langage**: TypeScript
- **Icônes**: Lucide React

## Prochaines étapes

1. Implémenter l'éditeur de templates PDF
2. Ajouter le composant de signature électronique
3. Créer les formulaires publics de signature
4. Configurer l'envoi d'emails
5. Ajouter les webhooks
6. Créer l'API REST complète
7. Ajouter les tests

## Support

Pour toute question ou problème, consultez :
- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
- Documentation TailwindCSS : https://tailwindcss.com/docs
