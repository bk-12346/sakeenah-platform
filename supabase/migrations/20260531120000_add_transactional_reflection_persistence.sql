-- Preserve existing JWT claims while adding anonymous session context.
CREATE OR REPLACE FUNCTION public.set_request_session(session_id text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    (
      COALESCE(
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb,
        '{}'::jsonb
      )
      || jsonb_build_object('session_id', session_id)
    )::text,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow RPC-backed anonymous entry updates while preserving strict isolation.
DROP POLICY IF EXISTS "Anonymous users can update own session entries"
ON public.entries;

CREATE POLICY "Anonymous users can update own session entries"
ON public.entries
FOR UPDATE
TO anon
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
)
WITH CHECK (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

-- Check whether an owner can begin a reflection today. Persistence performs
-- the same check under a transaction lock and remains authoritative.
CREATE OR REPLACE FUNCTION public.can_start_daily_reflection(
  p_session_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_day_start timestamptz;
BEGIN
  IF NULLIF(trim(p_session_id), '') IS NULL THEN
    RAISE EXCEPTION 'Missing session_id';
  END IF;

  PERFORM public.set_request_session(p_session_id);
  v_user_id := auth.uid();
  v_day_start := date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.usage_log
    WHERE created_at >= v_day_start
      AND (
        (v_user_id IS NOT NULL AND user_id = v_user_id)
        OR (
          v_user_id IS NULL
          AND user_id IS NULL
          AND session_id = p_session_id
        )
      )
  );
END;
$$;

-- Return journal entries for the authenticated user or current anonymous
-- session while establishing session context inside the same transaction.
CREATE OR REPLACE FUNCTION public.get_session_entries(
  p_session_id text
)
RETURNS SETOF public.entries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NULLIF(trim(p_session_id), '') IS NULL THEN
    RAISE EXCEPTION 'Missing session_id';
  END IF;

  PERFORM public.set_request_session(p_session_id);
  v_user_id := auth.uid();

  RETURN QUERY
  SELECT entries.*
  FROM public.entries
  WHERE (
    v_user_id IS NOT NULL
    AND entries.user_id = v_user_id
  )
  OR (
    v_user_id IS NULL
    AND entries.user_id IS NULL
    AND entries.session_id = p_session_id
  )
  ORDER BY entries.created_at DESC;
END;
$$;

-- Persist one complete reflection exchange atomically.
CREATE OR REPLACE FUNCTION public.persist_reflection_exchange(
  p_session_id text,
  p_entry_id uuid,
  p_entry_text text,
  p_emotion_labels text[],
  p_ai_response text,
  p_messages jsonb,
  p_turn_number integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_entry_id uuid;
  v_user_id uuid;
  v_entry_user_id uuid;
  v_entry_session_id text;
  v_current_turn integer;
  v_status text;
  v_owner_key text;
  v_day_start timestamptz;
BEGIN
  IF NULLIF(trim(p_session_id), '') IS NULL THEN
    RAISE EXCEPTION 'Missing session_id';
  END IF;

  IF p_turn_number IS NULL OR p_turn_number < 1 OR p_turn_number > 4 THEN
    RAISE EXCEPTION 'Invalid turn number';
  END IF;

  IF NULLIF(trim(p_entry_text), '') IS NULL THEN
    RAISE EXCEPTION 'Missing entry text';
  END IF;

  IF NULLIF(trim(p_ai_response), '') IS NULL THEN
    RAISE EXCEPTION 'Missing AI response';
  END IF;

  IF p_messages IS NULL OR jsonb_typeof(p_messages) <> 'array' THEN
    RAISE EXCEPTION 'Messages must be an array';
  END IF;

  PERFORM public.set_request_session(p_session_id);
  v_user_id := auth.uid();

  IF p_entry_id IS NULL THEN
    IF p_turn_number <> 1 THEN
      RAISE EXCEPTION 'Initial exchange must be turn 1';
    END IF;

    v_day_start := date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
    v_owner_key := COALESCE(v_user_id::text, p_session_id) || ':' || v_day_start::text;
    PERFORM pg_advisory_xact_lock(hashtextextended(v_owner_key, 0));

    IF EXISTS (
      SELECT 1
      FROM public.usage_log
      WHERE created_at >= v_day_start
        AND (
          (v_user_id IS NOT NULL AND user_id = v_user_id)
          OR (
            v_user_id IS NULL
            AND user_id IS NULL
            AND session_id = p_session_id
          )
        )
    ) THEN
      RAISE EXCEPTION 'Daily reflection limit reached';
    END IF;

    INSERT INTO public.entries (
      user_id,
      session_id,
      entry_text,
      emotion_labels,
      ai_response,
      messages,
      turn_count,
      status
    )
    VALUES (
      v_user_id,
      CASE WHEN v_user_id IS NULL THEN p_session_id ELSE NULL END,
      p_entry_text,
      COALESCE(p_emotion_labels, '{}'::text[]),
      p_ai_response,
      p_messages,
      0,
      'active'
    )
    RETURNING id INTO v_entry_id;

    INSERT INTO public.usage_log (
      user_id,
      session_id
    )
    VALUES (
      v_user_id,
      CASE WHEN v_user_id IS NULL THEN p_session_id ELSE NULL END
    );
  ELSE
    SELECT
      id,
      user_id,
      session_id,
      turn_count,
      status
    INTO
      v_entry_id,
      v_entry_user_id,
      v_entry_session_id,
      v_current_turn,
      v_status
    FROM public.entries
    WHERE id = p_entry_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Entry not found';
    END IF;

    IF v_user_id IS NULL THEN
      IF v_entry_user_id IS NOT NULL
        OR v_entry_session_id IS DISTINCT FROM p_session_id
      THEN
        RAISE EXCEPTION 'Entry does not belong to this session';
      END IF;
    ELSE
      IF v_entry_user_id IS DISTINCT FROM v_user_id THEN
        RAISE EXCEPTION 'Entry does not belong to this user';
      END IF;
    END IF;

    IF v_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'Conversation is already completed';
    END IF;

    IF p_turn_number <> v_current_turn + 1 THEN
      RAISE EXCEPTION 'Invalid turn number';
    END IF;
  END IF;

  INSERT INTO public.conversation_turns (
    entry_id,
    user_id,
    session_id,
    role,
    content,
    turn_number
  )
  VALUES
    (
      v_entry_id,
      v_user_id,
      CASE WHEN v_user_id IS NULL THEN p_session_id ELSE NULL END,
      'user',
      p_entry_text,
      p_turn_number
    ),
    (
      v_entry_id,
      v_user_id,
      CASE WHEN v_user_id IS NULL THEN p_session_id ELSE NULL END,
      'assistant',
      p_ai_response,
      p_turn_number
    );

  UPDATE public.entries
  SET
    messages = p_messages,
    turn_count = p_turn_number,
    status = CASE
      WHEN p_turn_number = 4 THEN 'completed'
      ELSE 'active'
    END,
    completed_at = CASE
      WHEN p_turn_number = 4 THEN now()
      ELSE NULL
    END
  WHERE id = v_entry_id;

  RETURN v_entry_id;
END;
$$;

REVOKE ALL ON FUNCTION public.can_start_daily_reflection(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_start_daily_reflection(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_session_entries(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_session_entries(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.persist_reflection_exchange(
  text,
  uuid,
  text,
  text[],
  text,
  jsonb,
  integer
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.persist_reflection_exchange(
  text,
  uuid,
  text,
  text[],
  text,
  jsonb,
  integer
) TO anon, authenticated;
