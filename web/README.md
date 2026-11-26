# web — Next.js + shadcn app

The portfolio at the repo root is plain HTML/CSS/JS and stays as it is.
This folder is a separate Next.js app with TypeScript, Tailwind CSS v4 and
shadcn/ui, for React components such as the sign-in card.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also type-checks)
```

## How it was set up

```bash
npx create-next-app@latest web --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd web
npx shadcn@latest init -d        # writes components.json, lib/utils.ts, theme tokens in app/globals.css
npm install framer-motion        # used by the sign-in card (lucide-react comes with shadcn)
```

## Where things go

| What | Path |
| --- | --- |
| UI components | `components/ui/` (alias `@/components/ui`) |
| `cn()` helper | `lib/utils.ts` (alias `@/lib/utils`) |
| Global styles / theme tokens | `app/globals.css` |
| shadcn config | `components.json` |

Keep components in `components/ui`. `npx shadcn add <name>` writes there
(set by `aliases.ui` in `components.json`), and components copied from shadcn
or 21st.dev import each other as `@/components/ui/...`. If they live
anywhere else, those imports break.

## Sign-in card

- Component: `components/ui/sign-in-card-2.tsx` (exports `Component`)
- Shown on `/` by `app/page.tsx`
- The form doesn't sign anyone in yet: submit only shows a 2-second spinner.
  To make it real, connect it to an auth provider (for example Supabase Auth,
  which the portfolio's `config.js` already plans for).
- It links to `/forgot-password` and `/signup`. Those pages don't exist yet.

## Deploy

On Vercel, import the repo and set **Root Directory** to `web`.
