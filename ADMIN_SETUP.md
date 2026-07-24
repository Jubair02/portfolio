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

## Deploying to Vercel (production migrations)

Migrations are tracked in `prisma/migrations/` (baselined as `0_init`). The
production database is kept in sync automatically on every deploy.

### 1. Environment variables (Vercel → Project → Settings → Environment Variables)

Add these for **Production** (and Preview, if used):

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | **Pooled** Neon URL (`...-pooler...`). Used by the app at runtime. |
| `DIRECT_URL` | **Direct/non-pooled** Neon URL (no `-pooler`). Used by `migrate deploy`. **Required** — the build fails without it. |
| `AUTH_SECRET` | 32-byte base64 secret. |
| `AUTH_TRUST_HOST` | `true` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same cloud name (client-exposed). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Only needed if you run `db:seed` against prod. |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Optional email delivery. |

### 2. Build & install commands

No Vercel overrides needed — the defaults pick these up from `package.json`:

- `postinstall`: `prisma generate` — regenerates the client after Vercel installs deps.
- `build`: `prisma migrate deploy && next build` — **applies any pending migrations to the production DB, then builds.** If a migration fails, the deploy fails (so you never ship against an unmigrated schema).

### 3. First production deploy

1. Push the repo to GitHub and import it into Vercel.
2. Add the env vars above.
3. Deploy. `migrate deploy` applies `0_init` (already applied on the current
   Neon DB, so it's a no-op there; on a fresh prod DB it creates all tables).
4. Seed the initial content/admin **once** against the prod DB (from your
   machine with the prod `DATABASE_URL`/`DIRECT_URL` in `.env`, or a one-off):
   `npm run db:seed`.

### 4. Making schema changes going forward

```bash
# 1. Edit prisma/schema.prisma, then create a migration locally:
npm run db:migrate -- --name add_something
# 2. Commit prisma/migrations/** and push.
# 3. Vercel runs `prisma migrate deploy` during the next build automatically.
```

> **Neon shadow DB:** `migrate dev` needs a temporary shadow database. If Neon
> rejects it, add a second Neon DB URL as `SHADOW_DATABASE_URL` and reference it
> via `shadowDatabaseUrl` in the datasource, or author migrations locally against
> a throwaway Postgres. `migrate deploy` (production) never needs a shadow DB.

> **Windows note:** `prisma generate` can throw `EPERM: ... rename query_engine`
> if OneDrive/an editor locks `node_modules`. It's harmless (the client is still
> generated) and never happens on Vercel's Linux builders. If it blocks you
> locally, pause OneDrive sync or close the process holding the file.

> **Don't use `prisma db push` anymore** — now that migrations exist, mixing
> `db push` with migrations causes schema drift. Use `db:migrate` / `db:deploy`.

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
