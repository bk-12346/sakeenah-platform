import { type JournalEntry } from "@/lib/storage";
import ReactMarkdown from "react-markdown";

interface Props {
  entry: JournalEntry;
  onNewEntry: () => void;
  onViewJournal: () => void;
}

function splitResponseAndQuestion(response: string): { mainResponse: string; question: string | null } {
  // Find the last sentence ending with a question mark
  const sentences = response.split(/(?<=[.!?])\s+/);

  // Look for the last question from the end
  let questionIndex = -1;
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (sentences[i].trim().endsWith('?')) {
      questionIndex = i;
      break;
    }
  }

  if (questionIndex === -1) {
    return { mainResponse: response, question: null };
  }

  const mainResponse = sentences.slice(0, questionIndex).join(' ').trim();
  const question = sentences.slice(questionIndex).join(' ').trim();

  return { mainResponse, question };
}

export default function ResponseScreen({ entry, onNewEntry, onViewJournal }: Props) {
  const { mainResponse, question } = splitResponseAndQuestion(entry.response);

  return (
    <div className="animate-fade-in" style={{ padding: '24px 20px 0 20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. USER JOURNAL ENTRY - Right-aligned chat bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              maxWidth: '80%',
              background: '#A85E56',
              borderRadius: '18px 18px 4px 18px',
              padding: '14px 18px',
            }}
          >
            {entry.emotions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end', marginBottom: '10px' }}>
                {entry.emotions.map((e) => (
                  <span
                    key={e}
                    className="font-body"
                    style={{
                      background: 'rgba(255, 255, 255, 0.22)',
                      color: 'white',
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
            <p
              className="font-body"
              style={{
                fontSize: '13.5px',
                color: '#FFFFFF',
                lineHeight: '1.7',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {entry.thought}
            </p>
          </div>
        </div>

        {/* 2. INITIAL AI RESPONSE - Full width card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '0.5px solid #E8D5C8',
            borderRadius: '12px',
            padding: '16px 18px',
          }}
        >
          {/* Label with rose dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <div
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#C17C74',
              }}
            />
            <span
              className="font-body"
              style={{
                fontSize: '10px',
                color: 'rgba(44, 24, 16, 0.45)',
              }}
            >
              A reflection for you
            </span>
          </div>

          {/* Inner text container with left border */}
          <div
            style={{
              borderLeft: '1.5px solid #E2CFC5',
              paddingLeft: '14px',
            }}
          >
            <div
              className="prose prose-sm max-w-none font-body"
              style={{
                fontSize: '13px',
                color: '#2C1810',
                lineHeight: '1.75',
              }}
            >
              <ReactMarkdown>{mainResponse || entry.response}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* 3. SAKEENAH ASKS - Left-aligned chat bubble (only if question exists) */}
        {question && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span
              className="font-body"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#C17C74',
                marginBottom: '6px',
              }}
            >
              Sakeenah asks
            </span>
            <div
              style={{
                maxWidth: '80%',
                background: '#C17C74',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
              }}
            >
              <p
                className="font-body"
                style={{
                  fontSize: '13.5px',
                  color: '#FFFFFF',
                  lineHeight: '1.7',
                  margin: 0,
                }}
              >
                {question}
              </p>
            </div>
          </div>
        )}

        {/* 4. BOTTOM ACTIONS */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onNewEntry}
            className="w-full py-3 font-body font-medium transition-all text-center"
            style={{
              background: '#2C1810',
              color: '#FDF6F0',
              borderRadius: '100px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Log another thought
          </button>
          <button
            onClick={onViewJournal}
            className="w-full font-body transition-colors text-center"
            style={{
              color: 'rgba(44, 24, 16, 0.45)',
              fontSize: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            View journal
          </button>
        </div>
      </div>
    </div>
  );
}
