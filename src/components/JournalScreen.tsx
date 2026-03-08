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
      <div className="animate-fade-in text-center py-12 pt-[36px]">
        <p className="text-sm" style={{ color: 'rgba(44, 24, 16, 0.45)' }}>Loading entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12 pt-[36px]">
        <p className="text-sm" style={{ color: 'rgba(44, 24, 16, 0.45)' }}>No entries yet. Start by writing your first thought.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3 pt-[36px]">
      {entries.map((entry) => {
        const isOpen = expanded === entry.id;
        return (
          <div
            key={entry.id}
            className="overflow-hidden"
            style={{
              background: '#FFFAF7',
              border: '1px solid #F0E0D4',
              borderRadius: '18px',
              boxShadow: '0 2px 14px rgba(44, 24, 16, 0.05)',
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full text-left flex items-start justify-between gap-3"
              style={{ padding: '20px' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-1" style={{ color: 'rgba(44, 24, 16, 0.45)' }}>
                  {format(new Date(entry.created_at), "MMM d, yyyy · h:mm a")}
                </p>
                {entry.emotion_labels && entry.emotion_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {entry.emotion_labels.map((e) => (
                      <span key={e} className="chip chip-active chip-active-rose text-[10px] px-2 py-0.5">{e}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm truncate" style={{ color: '#2C1810' }}>
                  {entry.entry_text.slice(0, 80)}{entry.entry_text.length > 80 ? "..." : ""}
                </p>
              </div>
              {isOpen
                ? <ChevronUp className="w-4 h-4 shrink-0 mt-1" style={{ color: 'rgba(44, 24, 16, 0.45)' }} />
                : <ChevronDown className="w-4 h-4 shrink-0 mt-1" style={{ color: 'rgba(44, 24, 16, 0.45)' }} />
              }
            </button>
            {isOpen && (
              <div style={{ borderTop: '1px solid #F0E0D4', padding: '20px', paddingTop: '12px' }}>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(44, 24, 16, 0.45)' }}>{entry.entry_text}</p>
                <div
                  className="prose prose-sm max-w-none leading-relaxed font-body"
                  style={{
                    color: '#2C1810',
                    borderLeft: '2px solid #C17C74',
                    paddingLeft: '14px',
                    fontSize: '15px',
                    lineHeight: '1.85',
                  }}
                >
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
