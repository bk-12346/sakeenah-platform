

## Onboarding Dark Aesthetic Redesign

Matching the reference image: immersive dark brown background with warm, muted typography.

### Changes (Onboarding.tsx only)

**Background & atmosphere:**
- Full-screen background: deep brown `#1A0F0A` (or similar dark warm brown)
- Radial gradient wash: subtle warm rose glow `rgba(193,124,116,0.10)` centered top, blending into the dark

**Typography — inverted for dark background:**
- Title "Sakeenah.": Cormorant Garamond italic 300, 46px, color `rgba(255, 248, 242, 0.9)` (warm off-white)
- Body text: Lora italic 15px, color `rgba(255, 248, 242, 0.40)` (muted warm cream)
- Body muted / small: `rgba(255, 248, 242, 0.30)`
- Headings on screens 2-3: Cormorant Garamond 300, 28px, `rgba(255, 248, 242, 0.85)`

**Crescent ornament:** Keep SVG, fill `#C17C74` at ~25% opacity (subtle against dark)

**Progress dots:**
- Inactive: `rgba(255, 248, 242, 0.15)`
- Active: `#C17C74`, same pill shape

**"Tap to continue" text:** `rgba(255, 248, 242, 0.35)`

**"Let go" button:** Keep existing gradient (`#A85E56` → `#A85A38`), white text — already contrasts well against dark

**No other files touched.** Functionality, text content ("Sakeenah" spelling), and all logic remain identical.

