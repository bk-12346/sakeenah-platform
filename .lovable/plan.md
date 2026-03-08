

## Fix: Make entire onboarding screen tappable

**Problem:** The "Tap to continue" is a small, muted button. Users tap anywhere on the screen expecting it to advance, but only the tiny text is clickable.

**Solution (Onboarding.tsx only):**
- Add `onClick={advance}` and `cursor: pointer` to the outer full-screen `div` container for screens 0 and 1
- Keep the "Tap to continue" text as a visual hint (not the sole click target)
- On screen 2, don't make the background clickable — only the "Let go" button should work

**Change:** Line 41-43 of `Onboarding.tsx` — add `onClick={screen < 2 ? advance : undefined}` and `cursor: screen < 2 ? 'pointer' : 'default'` to the outer div.

No other files changed. No functionality or styling changes.

