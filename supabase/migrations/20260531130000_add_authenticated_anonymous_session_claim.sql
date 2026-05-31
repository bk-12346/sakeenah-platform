-- Claim one anonymous browser session after the user authenticates.
CREATE OR REPLACE FUNCTION public.claim_anonymous_session(
  p_session_id text
)
RETURNS TABLE (
  entries_claimed integer,
  usage_claimed integer,
  turns_claimed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_request_session_id text;
BEGIN
  IF NULLIF(trim(p_session_id), '') IS NULL THEN
    RAISE EXCEPTION 'Missing session_id';
  END IF;

  v_request_session_id :=
    NULLIF(current_setting('request.headers', true), '')::jsonb->>'x-session-id';
  IF v_request_session_id IS DISTINCT FROM p_session_id THEN
    RAISE EXCEPTION 'Session header mismatch';
  END IF;

  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.entries
  SET
    user_id = v_user_id,
    session_id = NULL
  WHERE user_id IS NULL
    AND session_id = p_session_id;
  GET DIAGNOSTICS entries_claimed = ROW_COUNT;

  UPDATE public.usage_log
  SET
    user_id = v_user_id,
    session_id = NULL
  WHERE user_id IS NULL
    AND session_id = p_session_id;
  GET DIAGNOSTICS usage_claimed = ROW_COUNT;

  UPDATE public.conversation_turns
  SET
    user_id = v_user_id,
    session_id = NULL
  WHERE user_id IS NULL
    AND session_id = p_session_id;
  GET DIAGNOSTICS turns_claimed = ROW_COUNT;

  RETURN NEXT;
END;
$$;

-- Remove broad direct-update paths. Claims now flow through the authenticated
-- RPC above, which scopes every update to the supplied anonymous session.
DROP POLICY IF EXISTS "Auth users can claim anonymous entries"
ON public.entries;

DROP POLICY IF EXISTS "Auth users can claim anonymous usage"
ON public.usage_log;

REVOKE ALL ON FUNCTION public.claim_anonymous_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_anonymous_session(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_session(text) TO authenticated;
