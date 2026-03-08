import { type JournalEntry } from "@/lib/storage";
import ReactMarkdown from "react-markdown";

interface Props {
  entry: JournalEntry;
  onNewEntry: () => void;
  onViewJournal: () => void;
}

export default function ResponseScreen({ entry, onNewEntry, onViewJournal }: Props) {
  return (
    <div className="animate-fade-in pt-[36px]">
      <div
        style={{
          background: '#FFFAF7',
          borderRadius: '20px',
          borderLeft: '3px solid #C17C74',
          padding: '24px 22px 24px 26px',
          boxShadow: '0 4px 28px rgba(44, 24, 16, 0.07)',
        }}
      >
        <p className="text-xs mb-2 font-body" style={{ lineHeight: '1.85', color: 'rgba(44, 24, 16, 0.45)' }}>{entry.thought}</p>
        {entry.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entry.emotions.map((e) => (
              <span key={e} className="chip chip-active chip-active-rose text-[10px] px-2 py-1">{e}</span>
            ))}
          </div>
        )}
        <div className="prose prose-sm max-w-none font-body" style={{ lineHeight: '1.85', color: '#2C1810', fontSize: '15px' }}>
          <ReactMarkdown>{entry.response}</ReactMarkdown>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onNewEntry}
          className="w-full py-3 text-sm font-medium transition-all text-center"
          style={{
            background: 'linear-gradient(135deg, #A85E56, #A85A38)',
            color: 'white',
            borderRadius: '100px',
            boxShadow: '0 6px 20px rgba(168, 94, 86, 0.35)',
          }}
        >
          Log another thought
        </button>
        <button
          onClick={onViewJournal}
          className="w-full text-sm transition-colors text-center"
          style={{ color: 'rgba(44, 24, 16, 0.45)' }}
        >
          View journal
        </button>
      </div>
    </div>
  );
}
