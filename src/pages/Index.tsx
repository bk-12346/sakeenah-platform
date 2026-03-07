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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">Sakeena</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">A quiet space for your thoughts.</p>
            </div>
            <nav className="flex gap-4 text-xs font-medium">
              <button
                onClick={() => setScreen("home")}
                className={`transition-colors ${screen === "home" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Home
              </button>
              <button
                onClick={() => setScreen("journal")}
                className={`transition-colors ${screen === "journal" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Journal
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[420px] mx-auto px-5 py-7">
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
