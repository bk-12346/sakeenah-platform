

## Three fixes

### 1. Invert button colours on dark auth screens

**Files:** `src/components/SignUpPrompt.tsx`, `src/components/SignInScreen.tsx`

Change the primary button style on both screens:
- Background: `#2C1810` → `#FDF6F0`
- Text colour: `#FDF6F0` → `#2C1810`
- Loading state background: `rgba(253, 246, 240, 0.5)` instead of `rgba(44, 24, 16, 0.5)`

### 2. Responsive heading size on HomeScreen

**File:** `src/components/HomeScreen.tsx`

Replace the inline `fontSize: '36px'` on the "What's on your mind?" heading with a responsive approach — use a CSS class or media query so it's `28px` below 420px and `36px` above. Since the app uses Tailwind, the cleanest approach is to use Tailwind's `text-[28px] sm:text-[36px]` and remove the inline fontSize.

### 3. Verify sign-up flow triggers after 4-exchange conversation

**File:** `src/pages/Index.tsx` — the logic at lines 98–102 already triggers sign-up after `entry.status === "complete"` with a 2-second delay. This is correct. I'll test this end-to-end using the browser after making the above changes.

### No other changes
All three fixes are small and targeted — no structural changes needed.

