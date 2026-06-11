# Injury Recovery

A modern, mobile-first injury recovery platform built with Next.js, Supabase, and an evidence-driven rehab plan engine.

## What is included

- Supabase authentication and saved progress.
- Dashboard after assessment with current injury, grade, return range, progress, and today’s session.
- Modern iOS-like glass UI with soft colors, shadows, separators, and mobile optimization.
- Assessment for injury area, exact muscle/tendon area, grade, mechanism, symptoms, sport demands, equipment, pain, and red flags.
- Placeholder BodyPictogram component ready for replacement with an accurate anatomy SVG later.
- Progressive phase → week → day → exercise plan structure.
- Exercise cards with sets/reps, equipment, intensity, cues, video placeholders, and easier alternatives.
- Active recovery and full rest days.
- Check-ins and coach-style pushback logic.

## Deploy on Vercel

Upload these files/folders to the root of your GitHub repo:

```text
app/
data/
lib/
README.md
next.config.mjs
package.json
supabase.sql
```

In Vercel, set these environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your publishable anon key
```

Then redeploy.

## Supabase setup

Open Supabase SQL Editor, paste the contents of `supabase.sql`, and run it once.

Use the publishable key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never use the secret key in public frontend variables.
