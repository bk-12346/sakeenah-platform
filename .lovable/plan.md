

## Update edge function prompts and turn logic

Two small changes in `supabase/functions/sakeena-reflect/index.ts`:

1. **CLOSING_PROMPT (line 67):** Change "Acknowledge what they said" to "Acknowledge what they just said" — this is the only difference from the current text.

2. **Prompt selection logic (line 84):** Change `turnNumber <= 3` to `turnNumber <= 3` (already correct) and change `else` (line 86) to `else if (turnNumber === 4)` with a fallback. Actually, the current logic already maps turns 2-3 to CONVERSATIONAL and 4+ to CLOSING, which matches the request.

**Wait** — re-reading more carefully: the CONVERSATIONAL_PROMPT is already identical to what's requested. The CLOSING_PROMPT differs only on line 67: "Acknowledge what they said" → "Acknowledge what they just said". The turn logic is already correct (`turnNumber === 1` → SYSTEM, `turnNumber <= 3` → CONVERSATIONAL, else → CLOSING which covers turnNumber 4).

### Changes
- **Line 67**: Change `"Acknowledge what they said in 1 sentence"` to `"Acknowledge what they just said in 1 sentence"`
- **Lines 84-88**: Update logic to explicitly use `turnNumber === 2 || turnNumber === 3` and `turnNumber === 4` (functionally equivalent but more explicit per request)

No other files changed. Edge function will be redeployed.

