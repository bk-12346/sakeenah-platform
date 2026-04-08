# Sakeenah — Project Intelligence

## What this product is

Sakeenah is an Islamic wellness journalling app grounded in tawakkul (trust in Allah). Users write journal entries, select their emotional state, and receive a warm AI-generated reflection rooted in Quranic verses, the Names of Allah, and authenticated Hadith. After the initial response, users can continue a short conversation — capped at 3 to 4 exchanges — before the session closes. The product is built for Muslims of all ages and genders globally, with English as the primary language.

This is a startup. Every build decision should prioritise user trust, privacy, emotional safety, and retention.

---

## Tech stack

- **Framework:** React 18 with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **Backend:** Supabase (auth, database, edge functions)
- **AI:** Anthropic Claude via Supabase edge function (`supabase/functions/sakeena-reflect/index.ts`)
- **Routing:** Single page app — screen state managed in `src/pages/Index.tsx`
- **Storage:** Supabase database (migrating from localStorage)
- **Fonts:** Cormorant Garamond (display, italic) and Lora (body) from Google Fonts

---

## Project structure

```
src/
  components/
    HomeScreen.tsx        — journal entry input and emotion selection
    ResponseScreen.tsx    — AI response display and conversational follow-up
    JournalScreen.tsx     — journal history list
    Onboarding.tsx        — 3-slide onboarding flow
    NavLink.tsx           — navigation component
    ui/                   — shadcn/ui base components (do not modify these)
  pages/
    Index.tsx             — root component, screen state management
    NotFound.tsx
  lib/
    storage.ts            — localStorage helpers (being replaced by Supabase)
    session.ts            — session management
    supabase-external.ts  — Supabase client helpers
    utils.ts              — shared utilities
  integrations/
    supabase/
      client.ts           — Supabase client initialisation
      types.ts            — generated Supabase types
supabase/
  functions/
    sakeena-reflect/
      index.ts            — AI edge function (Deno runtime)
```

---

## Design system

### Colours

```
Background:     #FDF6F0   (warm cream — page background)
Surface:        #FFFAF7   (slightly lighter — cards and inputs)
Navy:           #2C1810   (primary text and dark buttons)
Muted:          rgba(44, 24, 16, 0.45)  (secondary text)
Border:         #E8D5C8   (default borders)
Border light:   #EAD9CE   (subtle borders)
Rose:           #C17C74   (primary accent — active states, dots, tags)
Rose deep:      #A85E56   (text on rose backgrounds)
Rose bg:        #F5E0DC   (rose tag background)
Button dark:    #2C1810   (primary CTA background)
Button text:    #FDF6F0   (text on dark buttons)
Input bg:       #FFFFFF   (white input fields)
Highlight bg:   #FAF3EE   (soft highlight — AI question cards)
```

### Typography

```
Display font:   'Cormorant Garamond', serif — italic, weight 300 or 400
                Used for: app name, screen headings, Quranic Arabic text
Body font:      'Lora', serif — weight 400 or 500
                Used for: all body text, labels, buttons, tags
```

Never use system fonts or sans-serif fonts anywhere in the UI. Every text element uses either Cormorant Garamond or Lora.

### Spacing and layout

- Max content width: 420px centred
- Page padding: 24px horizontal
- Border radius on cards: 12px
- Border radius on buttons: 100px (pill shape)
- Border radius on emotion tags: 100px (pill shape)
- Border radius on input fields: 12px
- All borders: 0.5px or 1px solid, never thicker
- Inputs have a white background with a subtle rose-tinted border on focus

### Component conventions

- Primary CTA buttons: dark navy background (#2C1810), cream text (#FDF6F0), pill shape, full width
- Emotion tags: white background, navy border (0.5px), navy text when unselected; rose background (#C17C74), white text when selected
- AI response: displayed with a left border accent (1.5px, #E2CFC5), Lora body text at 13px, line height 1.75
- Quranic Arabic text: Cormorant Garamond italic, slightly larger than body text, muted navy colour
- Follow-up question from AI: displayed in a soft highlight card (#FAF3EE), with a small label "Sakeenah asks" above it
- Conversation turn counter: small Lora text, centred, muted — "1 of 4 reflections remaining"

---

## Product rules — never violate these

- The conversational follow-up after an initial journal response is capped at **3 to 4 exchanges maximum**. Do not make this unlimited or configurable beyond this range.
- The AI must never claim to be a therapist, counsellor, or medical professional.
- The AI must never fabricate Quranic verses or Hadith.
- If a user's entry suggests self-harm or crisis, the edge function returns a crisis resource message only — no standard reflection.
- Journal entries and all user data are private. Row-level security must be enabled on all Supabase tables. No user can access another user's data.
- The onboarding privacy slide must accurately reflect how data is stored. Currently: "Your thoughts are encrypted and stored securely. They are never read, shared, or sold — not by us, not by anyone."
- Do not add any gamification elements (points, streaks with penalties, leaderboards). Gentle progress indicators are acceptable but must never create anxiety about missing a day.

---

## Database schema

### Current tables (Supabase)

**entries**
- `id` uuid (primary key)
- `session_id` text (anonymous session identifier — being replaced by user_id)
- `entry_text` text
- `emotion_labels` text[]
- `ai_response` text
- `created_at` timestamptz

**usage_log**
- `id` uuid (primary key)
- `session_id` text
- `created_at` timestamptz

### Planned additions (do not build yet, just be aware)

- `user_id` uuid references auth.users — to be added to both tables when auth is implemented
- `profiles` table — for storing display name, onboarding completion, subscription status
- `conversation_turns` table — for storing the 3 to 4 follow-up exchanges per session

---

## AI edge function

**Location:** `supabase/functions/sakeena-reflect/index.ts`

**Runtime:** Deno

**Current model:** Being migrated from Lovable's AI gateway (Gemini) to Anthropic's API directly. When updating this function, use the Anthropic Messages API with `claude-sonnet-4-5` as the model. Use `ANTHROPIC_API_KEY` as the environment variable name.

**System prompt:** The system prompt is long and carefully crafted — do not rewrite or summarise it. Only edit the specific parts requested. It includes emotional state guidance, strict Islamic content rules, crisis detection logic, and response structure requirements.

**Response length:** The AI response must be 100 to 150 words. This is a product requirement, not a suggestion.

---

## Current build priorities (in order)

1. UI redesign — HomeScreen, ResponseScreen, JournalScreen, Onboarding (polish only)
2. Streamed AI responses in ResponseScreen
3. Empty state for JournalScreen and reflections counter on HomeScreen
4. Supabase auth — email and password sign up and sign in
5. Migrate storage from localStorage to Supabase database
6. Switch AI edge function from Lovable gateway to Anthropic API directly
7. Conversational follow-up — 3 to 4 exchanges, saved as one complete session

---

## Coding conventions

- Use TypeScript strictly — no `any` types
- Use functional React components only — no class components
- Use Tailwind utility classes for layout and spacing
- Use inline styles only for brand colours and custom values not available in Tailwind
- Do not install new npm packages without explaining why they are needed and getting approval
- Do not modify files in `src/components/ui/` — these are shadcn/ui base components
- Do not rewrite working code that is not related to the current task
- Always consider mobile first — the app is designed for 420px max width
- When editing a component, read the full file before making changes
- Commit-ready code only — no console.log statements left in production code

---

## Key product context for AI prompting

When writing prompts for Claude Code or Cursor, always reference this file. The model should understand:

- This is an emotionally sensitive product for people processing anxiety, grief, stress, and spiritual struggle
- Every UI decision should feel calm, intentional, and trustworthy
- The typography and colour palette are non-negotiable — they are part of the product identity
- The Islamic content must be authentic, never decorative
- Privacy is a core feature, not a legal checkbox
