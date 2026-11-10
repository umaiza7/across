# ACROSS

Gentle, joyful lessons that help older adults and anyone with limited digital confidence use phones and the internet. Every small win is celebrated, every mistake feels safe, and nobody is left behind.

## What's inside

- **Five lessons on one learning journey:** Smartphone basics, Sending a message, Video calling family, Spotting scams, and Searching and maps.
- **The ACROSS Guide:** a soft line-drawn companion that welcomes learners, offers a hint when they seem stuck, and celebrates with them.
- **Celebrations:** a sparkle burst and a gentle bounce on a correct answer, plus confetti in the brand palette and badge reveals when a lesson is finished.
- **Friendly mistakes:** a warm shake, the Guide thinking, a hint, a "Try again" button and "Read the hint aloud". There is no red and no alarm.
- **Six badges** that unlock from real progress: First Steps, Communication Star, Digital Explorer, Safety Champion, Confidence Builder and Learning Champion. There are no leaderboards and no streaks.
- **Five languages:** English, Español, Français, العربية and اردو. Arabic and Urdu use right-to-left layouts.
- **Accessibility:**
  - Calm mode turns off decorative motion, confetti and sound in one switch, and the system's reduced-motion setting does the same.
  - Sounds are off by default.
  - Body text is 19px and touch targets are 56px.
  - Lessons and hints can be read aloud with the device's own voices.
  - Focus moves to the next useful control after each step.

## Run it

```bash
npm install
npm run dev
```

With no Supabase keys the app runs in **Demo mode**: accounts and progress are stored in this browser only, and passwords are never stored.

## Real accounts with Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor**, paste in [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the progress table with row-level security, so each learner can only see their own row.
3. Copy `.env.example` to `.env.local` and paste your **Project URL** and **anon public key** (Project Settings → API).
4. Restart `npm run dev`.

If email confirmation is turned on in Supabase, new learners see "Open the email we sent you to confirm, then sign in."

## Deploy to Vercel

Import the repository in Vercel and add the two `VITE_SUPABASE_*` variables in Project Settings → Environment Variables. `vercel.json` already routes every page to the app.

## Check it

```bash
npm test        # unit tests: badges, progress, lesson flow, messages, settings, demo accounts
npm run build   # type-check and production build
```

## Where things live

| Folder | What it holds |
| --- | --- |
| `src/content/` | Lesson structure and the five language packs |
| `src/lib/` | Progress, badge rules, lesson state machine, message rotation, settings, device helpers (voice, sound, confetti) |
| `src/lib/backend/` | Supabase and Demo mode accounts behind one interface |
| `src/components/` | Reusable doodles, the Guide, badge medals, journey, progress bar, sparkle burst |
| `src/pages/` | Welcome, sign-in, journey, lesson, badges and settings screens |
| `src/styles/` | Brand tokens (Merino, Kangaroo, Oyster, Rifle Green, Cedar), base styles and motion rules |

The design uses the brand palette, the Sulphur Point typeface and Simple Line Icons. Doodles are drawn in the icon set's line style.
