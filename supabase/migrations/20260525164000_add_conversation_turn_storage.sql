-- Add conversation state to journal entries.
ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS turn_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Store each user/assistant message as its own row.
CREATE TABLE IF NOT EXISTS public.conversation_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  CHECK (
    (user_id IS NOT NULL)
    OR (user_id IS NULL AND session_id IS NOT NULL)
    ),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  turn_number integer NOT NULL CHECK (turn_number >= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_turns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversation_turns'
      AND policyname = 'Authenticated users can view own conversation turns'
  ) THEN
    CREATE POLICY "Authenticated users can view own conversation turns"
    ON public.conversation_turns
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'conversation_turns'
      AND policyname = 'Authenticated users can insert own conversation turns'
  ) THEN
    CREATE POLICY "Authenticated users can insert own conversation turns"
    ON public.conversation_turns
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

END $$;

DROP POLICY IF EXISTS "Anonymous users can view conversation turns"
ON public.conversation_turns;

DROP POLICY IF EXISTS "Anonymous users can insert conversation turns"
ON public.conversation_turns;

CREATE POLICY "Anonymous users can view own session conversation turns"
ON public.conversation_turns
FOR SELECT
TO anon
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

CREATE POLICY "Anonymous users can insert own session conversation turns"
ON public.conversation_turns
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

CREATE INDEX IF NOT EXISTS conversation_turns_entry_id_idx
  ON public.conversation_turns (entry_id);

CREATE INDEX IF NOT EXISTS conversation_turns_user_id_created_at_idx
  ON public.conversation_turns (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS conversation_turns_session_id_created_at_idx
  ON public.conversation_turns (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS entries_user_id_created_at_idx
  ON public.entries (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS entries_session_id_created_at_idx
  ON public.entries (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS entries_status_idx
  ON public.entries (status);

CREATE OR REPLACE FUNCTION public.set_request_session(session_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('session_id', session_id)::text,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
