import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/storage";
import { ChevronRight } from "lucide-react";

const screens = [
  {
    lines: [
      { text: "Sakeena.", className: "text-3xl font-display font-semibold mb-6" },
      { text: "The stillness that settles in your heart when you truly believe Allah is in control.", className: "text-base leading-relaxed mb-4" },
      { text: "It is not something you chase. It arrives when you let go.", className: "text-sm text-muted-foreground italic" },
    ],
  },
  {
    lines: [
      { text: "Most of us carry more than we let on.", className: "text-xl font-display mb-4" },
      { text: "This is your quiet space to put it down.", className: "text-base text-muted-foreground leading-relaxed" },
    ],
  },
  {
    lines: [
      { text: "A few things worth knowing.", className: "text-xl font-display mb-6" },
      { text: "Your thoughts are private and stored only on your device. We never see them. No one does.", className: "text-sm leading-relaxed mb-4" },
      { text: "Sakeena is a space for reflection, not a replacement for professional support. If you are struggling seriously, please reach out to someone you trust or a mental health professional.", className: "text-xs text-muted-foreground leading-relaxed" },
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

  // Auto-advance on tap for screens 0 and 1
  useEffect(() => {
    if (screen < 2) {
      const handler = () => {
        setTimeout(advance, 100);
      };
      window.addEventListener("click", handler);
      return () => window.removeEventListener("click", handler);
    }
  }, [screen]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm text-center"
        >
          {screens[screen].lines.map((line, i) => (
            <p key={i} className={line.className}>{line.text}</p>
          ))}

          {screen < 2 && (
            <button onClick={advance} className="mt-8 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          )}

          {screen === 2 && (
            <button
              onClick={advance}
              className="mt-8 px-8 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Let go
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
