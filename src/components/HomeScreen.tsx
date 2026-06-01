import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type JournalEntry } from "@/lib/storage";

const EMOTION_ROWS = [
  ["Anxious", "Worried", "Overwhelmed", "Burnt Out"],
  ["Stressed", "Drained", "Sad", "Lonely"],
  ["Angry", "Guilty", "Lost", "Confused"],
  ["Hopeful", "Grateful", "Peaceful", "Content"],
];

const TERRACOTTA_EMOTIONS = ["Worried", "Angry", "Stressed", "Confused"];

const MAX_CHARS = 250;

interface Props {
  onResponse: (entry: JournalEntry) => void;
}

async function getRateLimitMessage(error: unknown): Promise<string | null> {
  if (!error || typeof error !== "object" || !("context" in error)) return null;

  const { context } = error as { context?: unknown };
  if (!(context instanceof Response) || context.status !== 429) return null;

  try {
    const body = await context.clone().json() as { error?: unknown };
    return typeof body.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

export default function HomeScreen({ onResponse }: Props) {
  const [thought, setThought] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [safetyResponse, setSafetyResponse] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const toggleEmotion = (e: string) => {
    setEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  };

  const submit = async () => {
    if (!thought.trim() || loading) return;
    setLoading(true);
    setError("");
    setSafetyResponse("");

    try {
      const userMessage = `Journal entry: ${thought.trim()}\n\nEmotion labels: ${emotions.length ? emotions.join(", ") : "None provided"}`;

      const initialMessages = [{ role: "user" as const, content: userMessage }];

      const { data, error: fnError } = await supabase.functions.invoke("sakeena-reflect-v2", {
        body: {
          messages: initialMessages,
          turnNumber: 1,
          entryText: thought.trim(),
          emotionLabels: emotions,
        },
      });

      if (fnError) {
        const rateLimitMessage = await getRateLimitMessage(fnError);
        if (rateLimitMessage) {
          setError(rateLimitMessage);
          return;
        }

        throw fnError;
      }

      const responseText = data?.response || data?.choices?.[0]?.message?.content || "Something went wrong. Please try again.";

      if (data?.safetyOnly) {
        setSafetyResponse(responseText);
        return;
      }

      if (!data?.entryId) throw new Error("Missing entry ID");

      const messagesWithResponse = [
        ...initialMessages,
        { role: "assistant" as const, content: responseText },
      ];

      const entry: JournalEntry = {
        id: data.entryId,
        thought: thought.trim(),
        emotions,
        response: responseText,
        messages: messagesWithResponse,
        turnCount: 1,
        status: "active",
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

      <h2 className="font-display mb-7 text-[28px] min-[420px]:text-[36px]" style={{ fontWeight: 300, fontStyle: 'italic', color: '#2C1810' }}>What's on your mind?</h2>

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

      <p className="font-body text-xs mt-7" style={{ color: 'rgba(44, 24, 16, 0.45)' }}>
        What feels closest right now?
      </p>

      <div className="flex flex-wrap justify-center gap-x-2 gap-y-3 mt-2">
        {EMOTION_ROWS.map((row) =>
          row.map((e) => {
            const isActive = emotions.includes(e);
            const isTerracotta = TERRACOTTA_EMOTIONS.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleEmotion(e)}
                className={`chip min-w-[104px] px-3 text-center whitespace-nowrap ${isActive ? `chip-active ${isTerracotta ? 'chip-active-terracotta' : 'chip-active-rose'}` : ""}`}
              >
                {e}
              </button>
            );
          })
        )}
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
      {safetyResponse && (
        <div
          className="font-body mt-4"
          style={{
            background: '#FFFAF7',
            border: '1px solid #E8D5C8',
            borderLeft: '3px solid #A85E56',
            borderRadius: '12px',
            color: '#2C1810',
            fontSize: '13px',
            lineHeight: '1.75',
            padding: '16px',
          }}
        >
          {safetyResponse}
        </div>
      )}
    </div>
  );
}
