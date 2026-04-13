export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JournalEntry {
  id: string;
  thought: string;
  emotions: string[];
  response: string;
  messages: ConversationMessage[];
  turnCount: number;
  status: "active" | "complete";
  createdAt: string;
}

const ENTRIES_KEY = "sakeena_entries";
const ONBOARDING_KEY = "sakeena_onboarding_done";

export function getEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: JournalEntry) {
  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}
