ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS messages jsonb;
