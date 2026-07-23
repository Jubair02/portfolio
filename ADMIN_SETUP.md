# Portfolio Admin Panel (CMS) — Setup

The portfolio is being converted into a database-backed CMS so all content is
editable from an admin dashboard. This document covers setup and current status.

## Stack

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL**
- **Auth.js v5** (Credentials, JWT sessions)
- **Cloudinary** for image uploads
- **React Hook Form + Zod** for forms
- shadcn-style UI primitives (`components/admin/ui/`), **sonner** toasts,
  **recharts** charts, **@dnd-kit** (drag-and-drop, later phases)

## 1. Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | What |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon / Supabase / Vercel Postgres) |
| `AUTH_SECRET` | random 32-byte base64 (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | first admin user (created by the seed) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | image uploads |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | same cloud name, exposed to the client |
| `RESEND_API_KEY` (optional) | contact-form email delivery |

`.env` is gitignored — never commit it.

## 2. Database setup

```bash
npm run db:migrate     # create tables (prisma migrate dev)
npm run db:seed        # import content/site.ts into the DB + create admin user
```

Useful commands:

```bash
npm run db:studio      # visual DB browser
npm run db:push        # push schema without a migration (quick prototyping)
npm run db:reset       # DROP + recreate + reseed (destructive)
```

## 3. Run

```bash
npm run dev
```

- Public site: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin> → redirects to `/admin/login`
- Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Architecture notes

- **Two independent root layouts** (Next.js multiple-root-layouts):
  - `app/(site)/` — the public portfolio (unchanged chrome: navbar, cursor, etc.)
  - `app/(admin)/` — the admin panel (its own minimal layout, no public chrome)
- **Auth**: `auth.config.ts` (edge-safe) + `auth.ts` (Node, Prisma+bcrypt).
  `middleware.ts` protects `/admin/*`.
- **Data layer**: `lib/data.ts` reads from the DB and **falls back to
  `content/site.ts`** if the DB is unreachable or empty, so the site always
  renders. Once seeded, DB data wins. Mutations call `revalidatePath("/")` so
  the public site updates near-instantly.
- **Images**: uploaded to Cloudinary via the `uploadImageAction` server action;
  tracked in the `MediaAsset` table.

## Status — ✅ COMPLETE

Every sidebar module is built, wired to the database, and the matching public
section reads live from the DB (with static fallback if the DB is unreachable).
`tsc`, `eslint`, and `next build` are all green.

| Module | Admin | Public wiring |
| --- | --- | --- |
| Dashboard | stats, chart, recent activity | — |
| Hero | edit form + live preview | ✅ |
| About | text + values editor | ✅ |
| Skills | category CRUD + **drag-and-drop** skill ordering | ✅ |
| Projects | full CRUD, Cloudinary cover + screenshots | ✅ |
| Experience | CRUD | ✅ (timeline) |
| Education | CRUD | ✅ (timeline) |
| Certificates | CRUD + image | ✅ |
| Services | CRUD | ✅ |
| Testimonials | CRUD + rating + photo | ✅ |
| Contact Messages | search / filter / read / reply / delete / paginate | inbound from contact form |
| Social Links | CRUD + visibility | ✅ (footer) |
| SEO Settings | title / description / keywords / OG / favicon | ✅ (`generateMetadata`) |
| Site Settings | footer / copyright / résumé / colors / siteUrl | ✅ (footer + metadataBase) |
| Media Library | upload / preview / copy URL / delete / search | Cloudinary |
| Profile | name / email / picture + change password | — |

### Patterns used

- Collection modules share a generic `EntityManager` (config-driven forms) and a
  `crud` helper (`lib/crud.ts`) → thin per-module `actions.ts`.
- Singletons (Hero, About, SEO, Site Settings, Profile) use `SettingsForm`.
- All mutations `revalidatePath("/")` so the public site updates immediately.
- Every image field uploads to Cloudinary via the `uploadImageAction` server
  action and is tracked in the `MediaAsset` table (visible in Media Library).

### Nice-to-have follow-ups (not blocking)

- Hero's big animated H1 headline is still a styled constant (the editable Hero
  fields cover name/role/rotating-roles/subtitle/CTAs/image).
- About portrait caption + résumé button still read a couple of values from
  `content/site.ts`; could be unified with Hero/Site Settings.
- `GitHubStats`, tech marquee, and Blog sections remain static (not in the CMS
  scope) — can be added as modules later.
