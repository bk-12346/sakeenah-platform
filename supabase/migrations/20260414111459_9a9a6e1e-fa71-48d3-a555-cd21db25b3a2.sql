
-- Allow authenticated users to claim anonymous entries (for migration)
CREATE POLICY "Auth users can claim anonymous entries"
ON public.entries
FOR UPDATE
TO authenticated
USING (user_id IS NULL AND session_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to claim anonymous usage_log rows (for migration)
CREATE POLICY "Auth users can claim anonymous usage"
ON public.usage_log
FOR UPDATE
TO authenticated
USING (user_id IS NULL AND session_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id);
