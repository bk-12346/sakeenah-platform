-- Return bounded reflection history for authenticated Memory v1 context.
CREATE OR REPLACE FUNCTION public.get_recent_completed_reflections(
  p_limit integer DEFAULT 3
)
RETURNS TABLE (
  entry_text text,
  emotion_labels text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_limit integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 3), 1), 3);

  RETURN QUERY
  SELECT
    entries.entry_text,
    entries.emotion_labels,
    entries.created_at
  FROM public.entries
  WHERE entries.user_id = v_user_id
    AND entries.status = 'completed'
  ORDER BY entries.created_at DESC
  LIMIT v_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_recent_completed_reflections(integer)
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_recent_completed_reflections(integer)
FROM anon;
GRANT EXECUTE ON FUNCTION public.get_recent_completed_reflections(integer)
TO authenticated;
