# Amour Amer — Event Registration Platform

A simple, self-hosted event registration platform built for wine tasting events. Guests can register for events, join a waitlist when full, and receive email notifications. Admins can manage events, track registrations, and share product lists after each tasting.

## Features

- **Event listing & registration** — guests sign up with name, email, and number of guests
- **Waitlist** — when an event is full, new guests are automatically waitlisted. If a spot opens up (cancellation or guest count reduction), the first person on the waitlist is auto-registered and notified by email
- **Email notifications** — confirmation, waitlist, promotion, reminders (2 days before + day of), and post-event product recap
- **Admin dashboard** — create/edit events, view registrations & waitlist, manage product lists
- **Data anonymization** — personal data is automatically anonymized 3 days after an event ends (GDPR-friendly)
- **Cron jobs** — automated reminders and post-event emails via scheduled API calls

## Tech Stack

| Technology | Role | Why |
|---|---|---|
| **[Next.js](https://nextjs.org/) 16** | Full-stack framework (React + API routes) | Single codebase for frontend and backend, server-side rendering, simple deployment |
| **[Prisma](https://www.prisma.io/) 7** | ORM / database access | Type-safe database queries, easy schema management |
| **[Supabase](https://supabase.com/)** | PostgreSQL database (hosted) | Free tier generous enough for small projects, managed Postgres with connection pooling |
| **[Resend](https://resend.com/)** | Transactional email | Simple API, free tier (100 emails/day), great deliverability |
| **[Vercel](https://vercel.com/)** | Hosting & deployment | Zero-config deployment for Next.js, automatic SSL, cron jobs support |
| **[OVH](https://www.ovh.com/)** | Domain name | Affordable domains, DNS management |
| **[Tailwind CSS](https://tailwindcss.com/) 4** | Styling | Utility-first CSS, fast to build consistent UIs |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Home — event listing
│   ├── events/[id]/page.tsx              # Event detail & registration form
│   ├── registration/[token]/page.tsx     # Edit/cancel registration (or waitlist)
│   ├── admin/
│   │   ├── page.tsx                      # Admin login
│   │   ├── events/page.tsx               # Admin event list
│   │   └── events/[id]/page.tsx          # Admin event detail (registrations, waitlist, products)
│   └── api/
│       ├── events/                       # Public event endpoints
│       ├── registrations/                # Registration & waitlist endpoints
│       ├── admin/events/                 # Admin CRUD + product management
│       └── cron/reminders/               # Cron: reminders, post-event emails, anonymization
├── lib/
│   ├── prisma.ts                         # Prisma client
│   ├── email.ts                          # All email templates (Resend)
│   └── auth.ts                           # Admin auth
└── generated/prisma/                     # Generated Prisma client
prisma/
└── schema.prisma                         # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- A Resend account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/your-username/amour-amer.git
cd amour-amer
npm install
```

### 2. Environment variables

Create a `.env` file at the root of the project:

```env
# Database — use the Supabase "Transaction mode" connection string (pooler, port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Resend API key — get it from https://resend.com/api-keys
RESEND_API_KEY="re_..."

# Admin password — used to access the /admin dashboard
ADMIN_PASSWORD="choose-a-strong-password"

# Cron secret — protects the /api/cron/reminders endpoint
CRON_SECRET="generate-a-random-string"

# Public app URL — used in email links
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up the database

Push the Prisma schema to your Supabase database:

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add all environment variables in Vercel project settings (set `NEXT_PUBLIC_APP_URL` to your production URL, e.g. `https://event.yourdomain.com`)
4. Deploy — Vercel handles the build automatically

### Custom domain

To use a custom domain like `event.yourdomain.com`:

1. Add the domain in **Vercel > Settings > Domains**
2. Add the CNAME record Vercel gives you in your DNS provider
3. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

### Email setup (Resend + custom domain)

By default, Resend's sandbox (`onboarding@resend.dev`) can only deliver to the email address linked to your Resend account. To send to anyone:

1. Add your domain in [Resend > Domains](https://resend.com/domains)
2. Add the DNS records Resend provides (DKIM, SPF, DMARC) to your DNS provider
3. Wait for domain verification in Resend
4. Update the `from` address in `src/lib/email.ts` to use your domain (e.g. `no-reply@yourdomain.com`)

### Cron jobs

The app has a cron endpoint at `/api/cron/reminders` that handles:
- Sending reminders 2 days before and on the day of an event
- Sending post-event product recap emails
- Anonymizing personal data 3 days after an event

Set up a daily cron job via [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) or any external scheduler:

```
GET /api/cron/reminders
Authorization: Bearer YOUR_CRON_SECRET
```

## License

MIT
