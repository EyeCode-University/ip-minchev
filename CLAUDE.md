# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## About

Single-page corporate B2B site for **ИП Минчев Р.М.** (custom industrial manufacturing — hydraulic cylinders, high-pressure valves, machined parts). All user-facing copy is in Russian. Apple-style light UI (white background, blue `#0071e3` accent, pill buttons, blurred sticky nav).

## Commands

```bash
npm run dev      # Next.js dev server (Turbopack)
npm run build    # Production build (Turbopack)
npm run start    # Serve production build
npm run lint     # ESLint (eslint-config-next)

# Regenerate the static dotted Russia map (see below)
node scripts/generate-russia-map.mjs
```

There is no test suite.

## Stack specifics

- **Next.js 16.2.4** with App Router + Turbopack. `reactCompiler: true` in [next.config.mjs](next.config.mjs), so avoid manual `useMemo`/`useCallback` unless profiling says otherwise.
- **React 19** — form flow uses `useActionState` + `useFormStatus`.
- **JavaScript, not TypeScript.** Keep it that way.
- **CSS Modules only** (no Tailwind, no CSS-in-JS). Design tokens live in [src/app/globals.css](src/app/globals.css) as CSS custom properties (`--accent-blue`, `--bg-secondary`, `--header-height`, `--ease-apple`, etc.) — use those, don't hardcode.
- Path alias `@/*` → `./src/*` ([jsconfig.json](jsconfig.json)).
- `motion` (the renamed `framer-motion`) for scroll/entrance animations. Shared wrapper: [src/components/FadeIn.js](src/components/FadeIn.js). Imports come from `motion/react`.

## Architecture

Single route (`/`) composed in [src/app/page.js](src/app/page.js): `Header → Hero → Capabilities → Gallery → Contacts → RequestForm → Footer`. Each section lives in its own folder under [src/components/](src/components/) with co-located `.module.css`. Navigation is anchor-based (`#hero`, `#capabilities`, …); corresponding `id`s and `scroll-margin-top` are set in the section components.

Static content — company info, nav links, equipment list, machining capabilities, gallery image list (19 items) — is centralized in [src/lib/constants.js](src/lib/constants.js). Change copy there, not in components.

### Request form (Server Action)

The form in [src/components/RequestForm/](src/components/RequestForm/) posts to [src/app/actions.js](src/app/actions.js) (`'use server'`). `submitApplication` validates required fields + file (extension in `jpg|jpeg|png|pdf|dwg`, ≤ 10 MB), then fans out in parallel to:

- [src/lib/sendEmail.js](src/lib/sendEmail.js) — Nodemailer → Gmail SMTP (`smtp.gmail.com:465`), attachment inlined.
- [src/lib/sendTelegram.js](src/lib/sendTelegram.js) — native `fetch` to Telegram Bot API (`sendMessage`, Markdown).

Env vars (required for the action to work — see [.env.local](.env.local) template): `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_TO`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. The Gmail password must be an App Password, not the account password.

Errors inside the action are caught and returned as `{ success: false, error }`; the client renders them via `useActionState`. On success, `SuccessModal` displays the 24-hour turnaround message.

### Dotted Russia map (pre-generated)

Hero contains a dotted-map of Russia. The geometry is **precomputed offline** — the client never loads world-atlas or d3-geo:

1. [scripts/generate-russia-map.mjs](scripts/generate-russia-map.mjs) reads `node_modules/world-atlas/countries-50m.json`, extracts Russia (ISO `643`), projects with `geoMercator().rotate([-100, 0]).fitSize([1000, 500], russia)`, walks a 9px grid using `geoContains` for point-in-polygon, and projects city coordinates through the same projection.
2. Output → [src/lib/russiaMapData.json](src/lib/russiaMapData.json) (outline SVG path + ~1800 dots + city screen coords).
3. [src/components/Hero/RussiaMap.js](src/components/Hero/RussiaMap.js) just renders that JSON.

If you change `MAP_CITIES` coords in [src/lib/constants.js](src/lib/constants.js) (they are `[lng, lat]`), the projection constants, or the dot spacing — **re-run the script**. The coordinates in `constants.js` are the source of truth; screen coords in the JSON are derived.

### Fonts

[src/app/layout.js](src/app/layout.js) uses `next/font/google` Inter (with `cyrillic` subset) as the SF Pro Display stand-in, exposed as `--font-sf`. `<html lang="ru">`.

## Conventions

- Gallery photos: `public/assets/slider-item (1).jpg` … `(19).jpg` — the array in `constants.js` assumes this naming and count.
- Don't introduce TypeScript, Tailwind, or a styling library — the stack was deliberately chosen.
- Respect existing CSS variables over new literals; that's how the Apple-style design tokens stay consistent.
