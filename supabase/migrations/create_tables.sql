-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  status TEXT DEFAULT 'pending',
  owner_id UUID REFERENCES auth.users(id),
  owner_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des signatures
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  signature_path TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des demandes de signature
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, signed, expired
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;

-- Politiques pour documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = owner_id);

-- Politiques pour signatures
CREATE POLICY "Anyone can view signatures"
  ON signatures FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert signatures"
  ON signatures FOR INSERT
  WITH CHECK (true);

-- Politiques pour signature_requests
CREATE POLICY "Users can view their document signature requests"
  ON signature_requests FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert signature requests for their documents"
  ON signature_requests FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE owner_id = auth.uid()
    )
  );

-- Créer les buckets de stockage si nécessaire
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('documents', 'documents', true),
  ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour documents
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'documents');

CREATE POLICY "Users can delete their documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- Politiques de stockage pour signatures
CREATE POLICY "Anyone can upload signatures"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Anyone can view signatures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'signatures');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS documents_owner_id_idx ON documents(owner_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON documents(status);
CREATE INDEX IF NOT EXISTS signatures_document_id_idx ON signatures(document_id);
CREATE INDEX IF NOT EXISTS signatures_signer_email_idx ON signatures(signer_email);
CREATE INDEX IF NOT EXISTS signature_requests_document_id_idx ON signature_requests(document_id);
CREATE INDEX IF NOT EXISTS signature_requests_token_idx ON signature_requests(token);
