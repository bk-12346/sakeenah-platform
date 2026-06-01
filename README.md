# Sakeenah

Sakeenah is a private, faith-native reflection web app for Muslims of all ages and genders. Users write one intentional reflection per day, optionally select emotions, receive a Gemini-generated response rooted in tawakkul, and continue a short guided conversation.

Read these files before making changes:

- `CLAUDE.md`: product, architecture, rules, and current resume point
- `AGENTS.md`: concise operating constraints for coding assistants
- `docs/sakeenah-v1-revisions.html`: styled product roadmap and next releases

## Stack

- React 18, TypeScript, and Vite
- Tailwind CSS and shadcn/ui
- Supabase Auth, Postgres, RLS, RPCs, and Edge Functions
- Gemini through Supabase Edge Functions
- GitHub and Vercel for frontend preview and production deployments

## Local Development

Install dependencies and start the Vite development server:

```powershell
npm install
npm run dev
```

Run verification before opening a pull request:

```powershell
npm run build
npm test
npx eslint <edited-files>
git diff --check
```

For Supabase Edge Function changes, also run this when Deno is available:

```powershell
deno check supabase/functions/<function-name>/index.ts
```

## Deployment

Frontend changes:

1. Push a feature branch to GitHub.
2. Validate the Vercel Preview deployment.
3. Merge the pull request into `main`.
4. Validate the Vercel production deployment.

Supabase migrations and Edge Functions are deployed separately from Vercel. Do not apply migrations or deploy services without explicit authorization.

## Current Work

Start with the `Resume Here` section in `CLAUDE.md`. The next releases are:

1. Ship the existing local journal retry state.
2. Add deterministic crisis screening before Gemini generation.
3. Add authenticated-only Memory v1 using at most the last three completed reflections.
