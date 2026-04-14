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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Check daily usage limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      let usageQuery = externalSupabase
        .from("usage_log")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      if (user) {
        usageQuery = usageQuery.eq("user_id", user.id);
      } else {
        usageQuery = usageQuery.eq("session_id", sessionId);
      }

      const { count, error: sessionErr } = await usageQuery;

      if (sessionErr) throw sessionErr;

      if ((count ?? 0) >= 1) {
        setError("You have already reflected today. Come back tomorrow — rest is part of tawakkul.");
        setLoading(false);
        return;
      }

      const userMessage = `Journal entry: ${thought.trim()}\n\nEmotion labels: ${emotions.length ? emotions.join(", ") : "None provided"}`;

      const initialMessages = [{ role: "user" as const, content: userMessage }];

      const { data, error: fnError } = await supabase.functions.invoke("sakeena-reflect", {
        body: { messages: initialMessages, turnNumber: 1 },
      });

      if (fnError) throw fnError;

      const responseText = data?.response || data?.choices?.[0]?.message?.content || "Something went wrong. Please try again.";

      // Insert entry with user_id or session_id based on auth state
      const entryInsert: Record<string, unknown> = {
        entry_text: thought.trim(),
        emotion_labels: emotions,
        ai_response: responseText,
        messages: [...initialMessages, { role: "assistant", content: responseText }],
        turn_count: 1,
        status: "active",
      };

      if (user) {
        entryInsert.user_id = user.id;
        entryInsert.session_id = null;
      } else {
        entryInsert.user_id = null;
        entryInsert.session_id = sessionId;
      }

      const { data: insertedEntry, error: insertErr } = await externalSupabase
        .from("entries")
        .insert(entryInsert)
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      // Insert usage log
      const usageInsert: Record<string, unknown> = {};
      if (user) {
        usageInsert.user_id = user.id;
        usageInsert.session_id = null;
      } else {
        usageInsert.user_id = null;
        usageInsert.session_id = sessionId;
      }

      await externalSupabase.from("usage_log").insert(usageInsert);

      const messagesWithResponse = [
        ...initialMessages,
        { role: "assistant" as const, content: responseText },
      ];

      const entry: JournalEntry = {
        id: insertedEntry?.id || crypto.randomUUID(),
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
