-- Correction des politiques RLS de la table 'events' (Journal d'Audit)

-- 1. Permettre aux utilisateurs authentifiés et anonymes d'insérer des événements via l'API
CREATE POLICY "Anyone can insert events" ON public.events FOR INSERT WITH CHECK (true);

-- 2. Permettre au créateur de la soumission de lire les logs d'audit associés à son document
CREATE POLICY "Submission owner can view events" ON public.events FOR SELECT USING (
  user_id = auth.uid() OR
  submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid()) OR
  submitter_id IN (SELECT id FROM public.submitters WHERE submission_id IN (SELECT id FROM public.submissions WHERE user_id = auth.uid()))
);
