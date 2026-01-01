# Configuration de la base de données SignOfika

Ce guide vous explique comment configurer la base de données Supabase pour SignOfika.

## Prérequis

- Un compte Supabase (https://supabase.com)
- Un projet Supabase créé

## Étapes de configuration

### 1. Accéder à l'éditeur SQL de Supabase

1. Allez sur https://supabase.com
2. Ouvrez votre projet SignOfika
3. Dans le menu latéral, cliquez sur **SQL Editor**

### 2. Exécuter le script de migration

1. Cliquez sur **New query**
2. Copiez tout le contenu du fichier `supabase/migrations/create_tables.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

Le script va créer :
- ✅ Table `documents` : Pour stocker les informations des documents
- ✅ Table `signatures` : Pour stocker les signatures
- ✅ Table `signature_requests` : Pour gérer les demandes de signature
- ✅ Buckets de stockage `documents` et `signatures`
- ✅ Politiques de sécurité (Row Level Security)
- ✅ Index pour optimiser les performances

### 3. Vérifier la création des tables

1. Dans le menu latéral, cliquez sur **Table Editor**
2. Vous devriez voir les tables suivantes :
   - `documents`
   - `signatures`
   - `signature_requests`

### 4. Vérifier les buckets de stockage

1. Dans le menu latéral, cliquez sur **Storage**
2. Vous devriez voir les buckets :
   - `documents` (public)
   - `signatures` (public)

### 5. Configurer les variables d'environnement

Dans votre fichier `.env.local`, assurez-vous d'avoir :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon

# Resend
RESEND_API_KEY=re_votre_cle_api
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Structure des tables

### Table `documents`

| Colonne       | Type        | Description                      |
|---------------|-------------|----------------------------------|
| id            | UUID        | Identifiant unique              |
| name          | TEXT        | Nom du document                 |
| file_name     | TEXT        | Nom du fichier original         |
| file_path     | TEXT        | Chemin dans le stockage         |
| file_url      | TEXT        | URL publique du fichier         |
| file_size     | BIGINT      | Taille du fichier en octets     |
| file_type     | TEXT        | Type MIME du fichier            |
| status        | TEXT        | Statut (pending, signed, etc.)  |
| owner_id      | UUID        | ID de l'utilisateur propriétaire|
| owner_email   | TEXT        | Email du propriétaire           |
| created_at    | TIMESTAMPTZ | Date de création                |
| updated_at    | TIMESTAMPTZ | Date de mise à jour             |

### Table `signatures`

| Colonne        | Type        | Description                      |
|----------------|-------------|----------------------------------|
| id             | UUID        | Identifiant unique              |
| document_id    | UUID        | Référence au document           |
| signer_name    | TEXT        | Nom du signataire               |
| signer_email   | TEXT        | Email du signataire             |
| signature_url  | TEXT        | URL de la signature             |
| signature_path | TEXT        | Chemin dans le stockage         |
| signed_at      | TIMESTAMPTZ | Date de signature               |
| created_at     | TIMESTAMPTZ | Date de création                |

### Table `signature_requests`

| Colonne         | Type        | Description                      |
|-----------------|-------------|----------------------------------|
| id              | UUID        | Identifiant unique              |
| document_id     | UUID        | Référence au document           |
| recipient_email | TEXT        | Email du destinataire           |
| recipient_name  | TEXT        | Nom du destinataire             |
| token           | TEXT        | Token unique pour la signature  |
| status          | TEXT        | Statut (pending, signed, etc.)  |
| sent_at         | TIMESTAMPTZ | Date d'envoi                    |
| expires_at      | TIMESTAMPTZ | Date d'expiration               |
| created_at      | TIMESTAMPTZ | Date de création                |

## Dépannage

### Erreur : "relation already exists"

Si vous voyez cette erreur, cela signifie que les tables existent déjà. Vous pouvez :
- Ignorer l'erreur (les tables sont déjà créées)
- Ou supprimer les tables existantes avant de réexécuter le script

### Erreur : "permission denied"

Assurez-vous d'être connecté avec un compte ayant les droits d'administration sur le projet Supabase.

### Les politiques RLS ne fonctionnent pas

1. Vérifiez que RLS est activé sur les tables
2. Vérifiez que vous êtes authentifié lors de l'accès aux données
3. Consultez les logs Supabase pour plus de détails

## Support

Pour plus d'informations sur Supabase :
- Documentation : https://supabase.com/docs
- Forum : https://github.com/supabase/supabase/discussions
