import { createClient } from "@supabase/supabase-js";
import { getSessionId } from "@/lib/session";

const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sessionId = getSessionId();

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  global: {
    headers: {
      "x-session-id": sessionId,
    },
  },
});
