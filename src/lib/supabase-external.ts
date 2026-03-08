import { createClient } from "@supabase/supabase-js";

const EXTERNAL_SUPABASE_URL = "https://lzdoyibrwiidbwglmanp.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZG95aWJyd2lpZGJ3Z2xtYW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTQwNTMsImV4cCI6MjA4ODUzMDA1M30.045GJvT6hCpVQ2-h5DlyD7Rrzr0c9roY1c4my3JGKms";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
