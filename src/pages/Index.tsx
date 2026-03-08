import { useState } from "react";
import { isOnboardingDone, type JournalEntry } from "@/lib/storage";
import Onboarding from "@/components/Onboarding";
import HomeScreen from "@/components/HomeScreen";
import ResponseScreen from "@/components/ResponseScreen";
import JournalScreen from "@/components/JournalScreen";

type Screen = "home" | "response" | "journal";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone());
  const [screen, setScreen] = useState<Screen>("home");
  const [lastEntry, setLastEntry] = useState<JournalEntry | null>(null);

  const handleResponse = (entry: JournalEntry) => {
    setLastEntry(entry);
    setScreen("response");
  };

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#FDF6F0' }}>
      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur-sm" style={{ background: '#FDF6F0', borderBottom: '1px solid #F0E0D4' }}>
        <div className="max-w-[420px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display leading-none" style={{ fontSize: '23px', fontStyle: 'italic', color: '#2C1810' }}>Sakeenah</h1>
              <p className="mt-0.5 font-body" style={{ fontSize: '10.5px', color: 'rgba(44, 24, 16, 0.45)' }}>A quiet space for your thoughts.</p>
            </div>
            <nav className="flex gap-4 text-xs font-medium">
              <button
                onClick={() => setScreen("home")}
                className="transition-colors"
                style={{ color: screen === "home" ? '#2C1810' : 'rgba(44, 24, 16, 0.45)' }}
              >
                Home
              </button>
              <button
                onClick={() => setScreen("journal")}
                className="transition-colors"
                style={{ color: screen === "journal" ? '#2C1810' : 'rgba(44, 24, 16, 0.45)' }}
              >
                Journal
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[420px] mx-auto px-6 pt-9 pb-7">
        {screen === "home" && <HomeScreen onResponse={handleResponse} />}
        {screen === "response" && lastEntry && (
          <ResponseScreen
            entry={lastEntry}
            onNewEntry={() => setScreen("home")}
            onViewJournal={() => setScreen("journal")}
          />
        )}
        {screen === "journal" && <JournalScreen />}
      </main>
    </div>
  );
};

export default Index;
