import { useState, useEffect } from "react";
import { externalSupabase } from "@/lib/supabase-external";
import { getSessionId } from "@/lib/session";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

interface EntryRow {
  id: string;
  session_id: string;
  entry_text: string;
  emotion_labels: string[];
  ai_response: string;
  created_at: string;
}

export default function JournalScreen() {
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const sessionId = getSessionId();
      const { data, error } = await externalSupabase
        .from("entries")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setEntries(data as EntryRow[]);
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-foreground text-sm">Loading entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-foreground text-sm">No entries yet. Start by writing your first thought.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      {entries.map((entry) => {
        const isOpen = expanded === entry.id;
        return (
          <div key={entry.id} className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E3DC' }}>
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full text-left flex items-start justify-between gap-3" style={{ padding: '20px' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
                </p>
                {entry.emotion_labels && entry.emotion_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {entry.emotion_labels.map((e) => (
                      <span key={e} className="chip chip-active text-[10px] px-2 py-0.5">{e}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm truncate">{entry.entry_text.slice(0, 80)}{entry.entry_text.length > 80 ? "..." : ""}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{entry.entry_text}</p>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  <ReactMarkdown>{entry.ai_response}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
