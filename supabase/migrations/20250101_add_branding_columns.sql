-- Migration: Add branding and webhook columns to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_color TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;

-- Recharger le cache du schéma pour l'API PostgREST
NOTIFY pgrst, 'reload schema';
