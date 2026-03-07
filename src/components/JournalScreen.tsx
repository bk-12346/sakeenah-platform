import { useState } from "react";
import { getEntries, type JournalEntry } from "@/lib/storage";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export default function JournalScreen() {
  const entries = getEntries();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-foreground text-sm">No entries yet. Start by writing your first thought.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      {entries.map((entry: JournalEntry) => {
        const isOpen = expanded === entry.id;
        return (
          <div key={entry.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full p-4 text-left flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(entry.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
                {entry.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {entry.emotions.map((e) => (
                      <span key={e} className="chip chip-active text-[10px] px-2 py-0.5">{e}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm truncate">{entry.thought.slice(0, 80)}{entry.thought.length > 80 ? "..." : ""}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{entry.thought}</p>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  <ReactMarkdown>{entry.response}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
