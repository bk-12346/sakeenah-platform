import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/lib/supabase-external";
import { getSessionId } from "@/lib/session";
import { type JournalEntry } from "@/lib/storage";

const EMOTIONS = [
  "Anxious", "Worried", "Happy", "Grateful", "Sad",
  "Angry", "Confused", "Hopeful", "Stressed", "Peaceful",
];

const TERRACOTTA_EMOTIONS = ["Worried", "Angry", "Stressed", "Confused"];

const MAX_CHARS = 250;

interface Props {
  onResponse: (entry: JournalEntry) => void;
}

export default function HomeScreen({ onResponse }: Props) {
  const [thought, setThought] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const toggleEmotion = (e: string) => {
    setEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  const submit = async () => {
    if (!thought.trim() || loading) return;
    setLoading(true);
    setError("");

    const sessionId = getSessionId();

    try {
      const { data: globalUsage, error: globalErr } = await externalSupabase
        .from("daily_global_usage")
        .select("total_calls")
        .single();

      if (globalErr && globalErr.code !== "PGRST116") throw globalErr;

      if (globalUsage && globalUsage.total_calls >= 200) {
        setError("Sakeenah is resting for today. Come back tomorrow — rest is part of tawakkul.");
        setLoading(false);
        return;
      }

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

      const userMessage = `Journal entry: ${thought.trim()}\n\nEmotion labels: ${emotions.length ? emotions.join(", ") : "None provided"}`;

      const { data, error: fnError } = await supabase.functions.invoke("sakeena-reflect", {
        body: { messages: [{ role: "user", content: userMessage }] },
      });

      if (fnError) throw fnError;

      const responseText = data?.response || data?.choices?.[0]?.message?.content || "Something went wrong. Please try again.";

      const { error: insertErr } = await externalSupabase.from("entries").insert({
        session_id: sessionId,
        entry_text: thought.trim(),
        emotion_labels: emotions,
        ai_response: responseText,
      });

      if (insertErr) throw insertErr;

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
  const hasContent = thought.trim().length > 0;

  return (
    <div className="animate-fade-in pt-[36px]">

      <h2 className="font-display mb-7" style={{ fontSize: '36px', fontWeight: 300, fontStyle: 'italic', color: '#2C1810' }}>What's on your mind?</h2>

      <textarea
        value={thought}
        onChange={(e) => e.target.value.length <= MAX_CHARS && setThought(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="What is on your heart today..."
        rows={5}
        className="w-full resize-none focus:outline-none font-body"
        style={{
          lineHeight: '1.85',
          fontSize: '15px',
          background: '#FFFFFF',
          border: `1px solid ${isFocused || hasContent ? '#C17C74' : '#E8D5C8'}`,
          borderRadius: '12px',
          padding: '16px 18px',
          minHeight: '164px',
          color: '#2C1810',
          boxShadow: isFocused || hasContent ? '0 0 0 3px rgba(193, 124, 116, 0.15)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          fontStyle: !hasContent ? 'italic' : 'normal',
        }}
      />
      <p className="text-xs mt-1 text-right" style={{ color: remaining < 30 ? '#A85E56' : 'rgba(44, 24, 16, 0.45)' }}>
        {remaining} characters remaining
      </p>

      <div className="flex flex-wrap gap-2 mt-7">
        {EMOTIONS.map((e) => {
          const isActive = emotions.includes(e);
          const isTerracotta = TERRACOTTA_EMOTIONS.includes(e);
          return (
            <button
              key={e}
              onClick={() => toggleEmotion(e)}
              className={`chip ${isActive ? `chip-active ${isTerracotta ? 'chip-active-terracotta' : 'chip-active-rose'}` : ""}`}
            >
              {e}
            </button>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={!thought.trim() || loading}
        className="w-full mt-7 py-3 rounded-full text-sm font-medium transition-all"
        style={
          !thought.trim() || loading
            ? { background: 'rgba(44, 24, 16, 0.3)', color: 'rgba(253, 246, 240, 0.65)', borderRadius: '100px' }
            : { background: '#2C1810', color: '#FDF6F0', borderRadius: '100px' }
        }
      >
        {loading ? (
          <span className="animate-pulse-soft">Reflecting...</span>
        ) : (
          "Submit"
        )}
      </button>

      {error && <p className="text-xs mt-2 text-center" style={{ color: '#A85E56' }}>{error}</p>}
    </div>
  );
}
