import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/lib/supabase-external";
import { getSessionId } from "@/lib/session";
import { type JournalEntry } from "@/lib/storage";

const EMOTIONS = [
  "Anxious", "Worried", "Happy", "Grateful", "Sad",
  "Angry", "Confused", "Hopeful", "Stressed", "Peaceful",
];
const MAX_CHARS = 250;

interface Props {
  onResponse: (entry: JournalEntry) => void;
}

export default function HomeScreen({ onResponse }: Props) {
  const [thought, setThought] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleEmotion = (e: string) => {
    setEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  const submit = async () => {
    if (!thought.trim() || loading) return;
    setLoading(true);
    setError("");

    const sessionId = getSessionId();

    try {
      // Check global daily usage
      const { data: globalUsage, error: globalErr } = await externalSupabase
        .from("daily_global_usage")
        .select("total_calls")
        .single();

      if (globalErr && globalErr.code !== "PGRST116") throw globalErr;

      if (globalUsage && globalUsage.total_calls >= 200) {
        setError("Sakeena is resting for today. Come back tomorrow — rest is part of tawakkul.");
        setLoading(false);
        return;
      }

      // Check per-session daily usage
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count, error: sessionErr } = await externalSupabase
        .from("usage_log")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .gte("created_at", todayStart.toISOString());

      if (sessionErr) throw sessionErr;

      if ((count ?? 0) >= 10) {
        setError("You have reached today's reflection limit. Come back tomorrow — rest is part of tawakkul.");
        setLoading(false);
        return;
      }

      // Make AI call
      const userMessage = `Journal entry: ${thought.trim()}\n\nEmotion labels: ${emotions.length ? emotions.join(", ") : "None provided"}`;

      const { data, error: fnError } = await supabase.functions.invoke("sakeena-reflect", {
        body: { messages: [{ role: "user", content: userMessage }] },
      });

      if (fnError) throw fnError;

      const responseText = data?.response || data?.choices?.[0]?.message?.content || "Something went wrong. Please try again.";

      // Save entry to external Supabase
      const { error: insertErr } = await externalSupabase.from("entries").insert({
        session_id: sessionId,
        entry_text: thought.trim(),
        emotion_labels: emotions,
        ai_response: responseText,
      });

      if (insertErr) throw insertErr;

      // Log usage
      await externalSupabase.from("usage_log").insert({ session_id: sessionId });

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        thought: thought.trim(),
        emotions,
        response: responseText,
        createdAt: new Date().toISOString(),
      };

      onResponse(entry);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_CHARS - thought.length;

  return (
    <div className="animate-fade-in pt-10">

      <h2 className="font-display text-[32px] mb-7">What's on your mind?</h2>

      <textarea
        value={thought}
        onChange={(e) => e.target.value.length <= MAX_CHARS && setThought(e.target.value)}
        placeholder="What is on your heart today..."
        rows={5}
        className="w-full rounded-lg p-4 text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        style={{ lineHeight: '1.8', background: '#FFFFFF', border: '1px solid #E8E3DC', minHeight: '160px' }}
      />
      <p className={`text-xs mt-1 text-right ${remaining < 30 ? "text-destructive" : "text-muted-foreground"}`}>
        {remaining} characters remaining
      </p>

      <div className="flex flex-wrap gap-2 mt-7">
        {EMOTIONS.map((e) => (
          <button
            key={e}
            onClick={() => toggleEmotion(e)}
            className={`chip ${emotions.includes(e) ? "chip-active" : ""}`}
          >
            {e}
          </button>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={!thought.trim() || loading}
        className="w-full mt-7 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        style={(!thought.trim() || loading) ? {} : { backgroundColor: '#6B9970' }}
      >
        {loading ? (
          <span className="animate-pulse-soft">Reflecting...</span>
        ) : (
          "Submit"
        )}
      </button>

      {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
