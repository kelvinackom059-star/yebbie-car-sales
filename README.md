# Yebbie Car Sales

Website for **Yebbie**, a car dealership in Ghana. Customers browse cars for sale and contact the team by phone,
WhatsApp or an enquiry form. A single admin logs in to manage inventory, photos and videos, and customer enquiries.

The site is **sales only** — the rental/booking feature has been removed.

## Features

**Public**
- Home page with the latest featured cars
- Car listing with search, body type / fuel / transmission / price filters, sorting and pagination
- Car detail page with photo + video gallery, specs, price and call/WhatsApp buttons
- Enquiry form on each car: purchase, test drive, or general question

**Admin** (`/login`)
- Secure cookie session; every admin action re-checks the database role
- Dashboard with car and new-enquiry counts
- Add, edit and delete cars
- Upload photos and short videos to Cloudinary; add walk-around videos by YouTube link
- Choose the cover photo, delete media
- Enquiries inbox with `New → Contacted → Closed` tracking

## Tech stack

- Next.js 16 (App Router, server actions) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma 7 + MySQL/MariaDB (`@prisma/adapter-mariadb`)
- Auth: signed JWT cookie (`jose`) + `bcryptjs`
- Media: Cloudinary (photos/short video) and YouTube embeds (long video)

## Getting started

Prerequisites: Node **20.9+**, a MySQL or MariaDB database, and a Cloudinary account.

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Create your env file and fill in the values
cp .env.example .env

# 3. Apply database migrations
npm run db:migrate        # production-style: applies existing migrations
# or, while developing the schema:
# npx prisma migrate dev

# 4. (Optional) add sample cars
npm run db:seed

# 5. Create the admin account (prompts for details)
npm run create-admin

# 6. Start the dev server
npm run dev
```

Open http://localhost:3000. Admin login is at http://localhost:3000/login.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL/MariaDB connection string (`mysql://user:pass@host:3306/db`). Hosted DBs usually need `?sslaccept=strict`. |
| `SESSION_SECRET` | Yes | At least 32 characters. Signs the login cookie. |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary dashboard → Product Environment. |
| `CLOUDINARY_API_KEY` | Yes | Same place. |
| `CLOUDINARY_API_SECRET` | Yes | Same place. Server-only — never expose it. |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations to the database (`prisma migrate deploy`) |
| `npm run db:seed` | Insert the sample cars |
| `npm run db:studio` | Open Prisma Studio |
| `npm run create-admin` | Create or promote an admin account |

## Deployment

This is a **Node.js/Next.js** app, so it cannot run on shared PHP-only hosting (for example, cPanel/PHP packages).
Use a Node host plus a MySQL/MariaDB database. Your local XAMPP database is only reachable from your computer.

### Recommended: Railway (app + MySQL in one place)

1. Push this project to GitHub. Do **not** commit `.env`.
2. Sign up at [Railway](https://railway.com) with GitHub, then **New Project → Deploy from repo**.
3. Set the service build command to `npm run build` and start command to `npm start`.
4. In the same Railway project, **Add service → MySQL** and copy its connection string.
5. On the web service, add these variables:
   - `DATABASE_URL` = the MySQL connection string
   - `SESSION_SECRET` = a fresh 32+ character secret
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` = your Cloudinary values
6. Apply migrations against the hosted database from your machine:

   ```bash
   DATABASE_URL="mysql://...prod..." npm run db:migrate
   ```

   Windows PowerShell:

   ```powershell
   $env:DATABASE_URL="mysql://...prod..."
   npm run db:migrate
   ```

7. Create the admin against the same database:

   ```bash
   DATABASE_URL="mysql://...prod..." npm run create-admin
   ```

8. Open the public Railway URL, then add your custom domain in **Settings → Domains** if you have one.

> Local cars/photos do **not** copy automatically. Run `db:migrate`, `create-admin` and re-upload media against the
> hosted database.

### Alternative: Vercel + hosted MySQL

1. Create an empty MySQL/MariaDB database with a hosted provider and copy the connection string.
2. Import the repository into [Vercel](https://vercel.com) — the default Next.js build works as-is
   (`postinstall` runs `prisma generate`).
3. Add `DATABASE_URL`, `SESSION_SECRET` and the three `CLOUDINARY_*` variables in Vercel.
4. Run `npm run db:migrate` and `npm run create-admin` against the hosted database, as above.
5. Add your custom domain in Vercel.

### Rough monthly costs (USD, check current pricing before paying)

| Option | Cost | Notes |
| --- | --- | --- |
| Railway Hobby | from ~$5/month | Easiest: app + managed MySQL in one place. |
| Vercel Hobby | $0 | For testing/non-commercial use only. |
| Vercel Pro + Aiven MySQL | ~$25/month total | Vercel Pro ~$20 + Aiven paid DB from ~$5. |
| Aiven MySQL Free | $0 | Good for experimenting; no region selection. |
| PlanetScale | from ~$30/month | Managed MySQL, usually more than needed here. |

## Media cost note

Cloudinary's free plan gives **25 credits/month** shared across storage, transformations and bandwidth. Video
delivery is the expensive part, so:

- Add long walk-around videos as **YouTube links** (admin → car → Photos and videos). YouTube pays the bandwidth.
- Upload only short clips to Cloudinary (max 100 MB in the admin UI).
- Photos are cheap and fine to upload normally.

## Project structure

```
prisma/
  schema.prisma          User, Car, CarMedia, Inquiry + enums
  migrations/            database history
  seed.ts                sample cars
scripts/create-admin.ts  interactive admin creator
src/
  app/
    page.tsx             home + featured cars
    cars/                listing, detail, enquiry action
    contact/             contact details
    (auth)/login/        admin login
    admin/               dashboard, cars, media, enquiries
  components/            Navbar, Footer, Logo, CarCard, CarGallery, forms
  lib/                   auth, session, prisma, cloudinary, media-url,
                         money, car-form, car-filters, site config
  generated/prisma/      generated Prisma client (rebuilt on install)
```

## Notes

- The database uses **MySQL/MariaDB**; the old PostgreSQL migrations were replaced with a single fresh init migration, so point `DATABASE_URL` at an empty database.
- All money is stored in **pesewas** (GH₵ 1.00 = 100) and formatted with the helpers in `src/lib/money.ts`.
- Customers only see cars that are `AVAILABLE` **and** have at least one photo.
- Business details (phones, email, WhatsApp, address, socials) live in `src/lib/site.ts`.
