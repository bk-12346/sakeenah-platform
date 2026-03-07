import { type JournalEntry } from "@/lib/storage";
import ReactMarkdown from "react-markdown";

interface Props {
  entry: JournalEntry;
  onNewEntry: () => void;
  onViewJournal: () => void;
}

export default function ResponseScreen({ entry, onNewEntry, onViewJournal }: Props) {
  return (
    <div className="animate-fade-in">
      <div className="bg-card rounded-lg p-5 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{entry.thought}</p>
        {entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.emotions.map((e) => (
              <span key={e} className="chip chip-active text-[10px] px-2 py-1">{e}</span>
            ))}
          </div>
        )}
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          <ReactMarkdown>{entry.response}</ReactMarkdown>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onNewEntry}
          className="w-full py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Log another thought
        </button>
        <button
          onClick={onViewJournal}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View journal
        </button>
      </div>
    </div>
  );
}
