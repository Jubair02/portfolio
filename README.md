# Jubair Hossain — Portfolio

Personal developer portfolio with a built-in admin CMS.

- **Public site** (`/`): Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion,
  react-three-fiber. Content is read from PostgreSQL with a static fallback in
  `content/site.ts`.
- **Admin panel** (`/admin`): Auth.js v5 (credentials, JWT), Prisma 6, Cloudinary uploads,
  React Hook Form + Zod. Manages hero, about, skills, projects, experience, education,
  certificates, services, testimonials, contact messages, social links, SEO and site settings.

## Quick start

```bash
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, Cloudinary keys
npm install               # postinstall runs `prisma generate`
npm run db:migrate        # apply migrations
npm run db:seed           # seed content + first admin user (ADMIN_* vars)
npm run dev               # http://localhost:3000 · admin at /admin
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev / production build (runs `prisma migrate deploy` first) / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate -- --name x` | Create + apply a migration locally |
| `npm run db:deploy` | Apply pending migrations (CI / production) |
| `npm run db:seed` | Seed content and admin user |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Drop, recreate and reseed (destructive) |

See [ADMIN_SETUP.md](ADMIN_SETUP.md) for environment variables, deployment to Vercel,
and architecture notes.
