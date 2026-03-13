-- =============================================
-- SCHEMA SUPABASE — Miss & Master IAI Mbalmayo
-- Colle ce code dans Supabase > SQL Editor > New Query
-- =============================================

-- Table des candidats
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  photo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('miss', 'master')),
  promotion TEXT DEFAULT '',
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, candidate_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(category);

-- =============================================
-- FONCTIONS RPC
-- =============================================

-- Incrémenter le compteur de votes
CREATE OR REPLACE FUNCTION increment_vote(p_candidate_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE candidates SET vote_count = vote_count + 1 WHERE id = p_candidate_id;
END;
$$;

-- Vérifier si un utilisateur a déjà voté dans une catégorie
CREATE OR REPLACE FUNCTION has_voted_in_category(p_user_id UUID, p_category TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM votes v
  JOIN candidates c ON c.id = v.candidate_id
  WHERE v.user_id = p_user_id AND c.category = p_category;
  RETURN v_count > 0;
END;
$$;

-- =============================================
-- POLITIQUES RLS (Row Level Security)
-- =============================================

-- Activer RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Candidats : tout le monde peut lire
CREATE POLICY "Candidats lisibles par tous" ON candidates
  FOR SELECT USING (true);

-- Candidats : seulement l'admin peut modifier
-- (La protection est gérée côté API avec isAdmin())
CREATE POLICY "Candidats modifiables par admin" ON candidates
  FOR ALL USING (auth.role() = 'authenticated');

-- Votes : un utilisateur voit seulement ses votes
CREATE POLICY "Votes lisibles par le propriétaire" ON votes
  FOR SELECT USING (auth.uid() = user_id);

-- Votes : un utilisateur peut insérer ses propres votes
CREATE POLICY "Votes inserables par utilisateur connecté" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET pour les photos
-- =============================================

-- Créer le bucket photos (faire ça dans Supabase > Storage > New Bucket)
-- Nom : photos
-- Public : OUI (cocher "Public bucket")

-- Politique storage : tout le monde peut voir les photos
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Photos publiques',
  '{"name":"Photos publiques","id":"public-read","action":"SELECT","principal":"*"}',
  'photos'
) ON CONFLICT DO NOTHING;

-- =============================================
-- DONNÉES DE TEST (optionnel - à supprimer en prod)
-- =============================================

/*
INSERT INTO candidates (name, description, category, promotion, vote_count) VALUES
('Marie Chantal Abomo', 'Étudiante passionnée de développement web et intelligence artificielle. Représente l''excellence académique de l''IAI.', 'miss', 'Licence 3 — Génie Logiciel', 0),
('Fatima Bello', 'Leader naturelle, impliquée dans la vie étudiante. Ambassadrice du campus IAI Mbalmayo.', 'miss', 'Master 1 — Réseaux & Télécoms', 0),
('Jean-Baptiste Nkomo', 'Passionné d''informatique et d''entrepreneuriat numérique. Champion des hackathons IAI.', 'master', 'Licence 3 — Systèmes d''Information', 0),
('Kevin Essomba', 'Développeur Full Stack, mentor des étudiants juniors. Représentant idéal de l''IAI.', 'master', 'Master 2 — Intelligence Artificielle', 0);
*/
