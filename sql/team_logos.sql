-- Migration: Criar tabela team_logos e bucket storage
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)

-- 1. Tabela de logos
CREATE TABLE IF NOT EXISTS team_logos (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT UNIQUE NOT NULL,
  logo_url TEXT NOT NULL,
  storage_path TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_team_logos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_logos_updated_at ON team_logos;
CREATE TRIGGER trg_team_logos_updated_at
  BEFORE UPDATE ON team_logos
  FOR EACH ROW
  EXECUTE FUNCTION update_team_logos_updated_at();

-- 3. Bucket storage para imagens dos escudos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Política de leitura pública para o bucket
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
CREATE POLICY "Public Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-logos');

-- 5. Política de escrita autenticada (admin)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'team-logos'
    AND auth.role() = 'authenticated'
  );

-- 6. Política de deleção autenticada
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'team-logos'
    AND auth.role() = 'authenticated'
  );

-- 7. RLS na tabela team_logos
ALTER TABLE team_logos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read team_logos" ON team_logos;
CREATE POLICY "Public Read team_logos"
  ON team_logos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated Insert team_logos" ON team_logos;
CREATE POLICY "Authenticated Insert team_logos"
  ON team_logos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update team_logos" ON team_logos;
CREATE POLICY "Authenticated Update team_logos"
  ON team_logos FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete team_logos" ON team_logos;
CREATE POLICY "Authenticated Delete team_logos"
  ON team_logos FOR DELETE
  USING (auth.role() = 'authenticated');
