import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/storage";

const screens = [
  {
    lines: [
      { text: "Sakeenah.", className: "onboarding-title" },
      { text: "The stillness that settles in your heart when you truly believe Allah is in control.", className: "onboarding-body" },
      { text: "It is not something you chase. It arrives when you let go.", className: "onboarding-body-muted" },
    ],
  },
  {
    lines: [
      { text: "Most of us carry more than we let on.", className: "onboarding-heading" },
      { text: "This is your quiet space to put it down.", className: "onboarding-body" },
    ],
  },
  {
    lines: [
      { text: "A few things worth knowing.", className: "onboarding-heading" },
      { text: "Your thoughts are private and stored only on your device. We never see them. No one does.", className: "onboarding-body" },
      { text: "Sakeenah is a space for reflection, not a replacement for professional support. If you are struggling seriously, please reach out to someone you trust or a mental health professional.", className: "onboarding-body-small" },
    ],
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState(0);

  const advance = () => {
    if (screen < 2) {
      setScreen(screen + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: '#FDF6F0' }}
    >
      {/* Radial gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, rgba(193,124,116,0.18) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm text-center relative z-10"
        >
          {/* Crescent ornament on screen 1 */}
          {screen === 0 && (
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              className="mx-auto mb-5"
              style={{ opacity: 0.35 }}
            >
              <path
                d="M18 2C9.163 2 2 9.163 2 18s7.163 16 16 16c-5.523 0-10-5.373-10-12S12.477 10 18 10c2.761 0 5.373.895 7.5 2.5A15.93 15.93 0 0018 2z"
                fill="#C17C74"
              />
            </svg>
          )}

          {screens[screen].lines.map((line, i) => {
            const styleMap: Record<string, React.CSSProperties> = {
              "onboarding-title": {
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: '46px',
                color: '#2C1810',
                marginBottom: '24px',
              },
              "onboarding-heading": {
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: '28px',
                color: '#2C1810',
                marginBottom: '16px',
              },
              "onboarding-body": {
                fontFamily: "'Lora', serif",
                fontStyle: 'italic',
                fontSize: '15px',
                lineHeight: '1.9',
                color: 'rgba(44, 24, 16, 0.45)',
                marginBottom: '16px',
              },
              "onboarding-body-muted": {
                fontFamily: "'Lora', serif",
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.9',
                color: 'rgba(44, 24, 16, 0.35)',
              },
              "onboarding-body-small": {
                fontFamily: "'Lora', serif",
                fontStyle: 'italic',
                fontSize: '12px',
                lineHeight: '1.9',
                color: 'rgba(44, 24, 16, 0.35)',
              },
            };
            return (
              <p key={i} style={styleMap[line.className] || {}}>{line.text}</p>
            );
          })}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: '6px',
                  borderRadius: i === screen ? '3px' : '50%',
                  width: i === screen ? '22px' : '6px',
                  background: i === screen ? '#C17C74' : '#E8D5C8',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {screen < 2 && (
            <button
              onClick={advance}
              className="mt-4 text-sm font-body"
              style={{ color: 'rgba(44, 24, 16, 0.45)' }}
            >
              Tap to continue
            </button>
          )}

          {screen === 2 && (
            <button
              onClick={advance}
              className="mt-4 px-8 py-2.5 text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, #A85E56, #A85A38)',
                color: 'white',
                borderRadius: '100px',
                boxShadow: '0 6px 20px rgba(168, 94, 86, 0.35)',
              }}
            >
              Let go
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
