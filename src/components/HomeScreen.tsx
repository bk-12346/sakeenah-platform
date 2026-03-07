import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveEntry, type JournalEntry } from "@/lib/storage";

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

    try {
      const userMessage = `Journal entry: ${thought.trim()}\n\nEmotion labels: ${emotions.length ? emotions.join(", ") : "None provided"}`;

      const { data, error: fnError } = await supabase.functions.invoke("sakeena-reflect", {
        body: { messages: [{ role: "user", content: userMessage }] },
      });

      if (fnError) throw fnError;

      const responseText = data?.response || data?.choices?.[0]?.message?.content || "Something went wrong. Please try again.";

      const entry: JournalEntry = {
        id: crypto.randomUUID(),
        thought: thought.trim(),
        emotions,
        response: responseText,
        createdAt: new Date().toISOString(),
      };
      saveEntry(entry);
      onResponse(entry);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_CHARS - thought.length;

  return (
    <div className="animate-fade-in relative pt-10">
      {/* Decorative Islamic geometric watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.04 }}>
          <g transform="translate(140,140)">
            {/* 8-pointed star */}
            <polygon points="0,-120 34,-34 120,0 34,34 0,120 -34,34 -120,0 -34,-34" fill="#7CA982" />
            <polygon points="0,-120 34,-34 120,0 34,34 0,120 -34,34 -120,0 -34,-34" fill="#7CA982" transform="rotate(45)" />
            {/* Inner circle */}
            <circle cx="0" cy="0" r="40" fill="none" stroke="#7CA982" strokeWidth="2" />
            {/* Crescent */}
            <path d="M-15,-80 A30,30 0 1,1 -15,-20 A22,22 0 1,0 -15,-80 Z" fill="#7CA982" transform="rotate(15)" />
          </g>
        </svg>
      </div>

      <h2 className="font-display text-2xl mb-7">What's on your mind?</h2>

      <textarea
        value={thought}
        onChange={(e) => e.target.value.length <= MAX_CHARS && setThought(e.target.value)}
        placeholder="Write your thoughts here..."
        rows={5}
        className="w-full bg-card border border-border rounded-lg p-4 text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        style={{ lineHeight: '1.8' }}
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
