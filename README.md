# Matcha 9 · Website and ordering demo

A premium, calm website for **Matcha 9**, the ceremonial-grade matcha bar inside Taco Maya in Logan Square, Chicago. Guests browse the menu, **order ahead and pick up at the counter**. The owner runs everything, including the menu, orders and opening hours, from a **dashboard** without touching code.

**Design preview:** https://coordinatez-new.github.io/matcha9-demo/ (dashboard at `/admin`, sign in with any email and password).

> Client demo. The site is set to `noindex, nofollow`, so search engines won't list it.

## One codebase, two builds

|                    | The site (`npm run build`)                                                    | The design preview (`npm run build:pages`)                                                       |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Hosting            | A Node.js server (Railway, Vercel, any VPS)                                   | Static files on GitHub Pages, deployed on every push to `main`                                   |
| Menu, orders, data | Postgres, shared by every visitor                                             | A demo store in each visitor's browser (localStorage), starting from the same real menu          |
| Dashboard          | Owner sign-in; every change goes live for everyone                            | Any email and password; changes show on the site in that browser, across tabs                    |
| Ordering           | Orders reach the dashboard (and Toast, once connected); guests pay at the bar | The whole flow works, marked as a preview; orders stay in the browser and aren't sent to the bar |

Both builds render the same screens. Route files ending in `.server.tsx` belong to the site, files ending in `.static.tsx` to the preview (they wrap the same views around the demo store in `src/demo/`), and plain `page.tsx` files are shared. See `next.config.ts`.

## What's in it

### For guests

| Route           | Page                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/`             | Home: hero, the standard, menu carousel, wellness blends, the ritual, founder story, Matcha Club, visit, Instagram                    |
| `/menu`         | Every drink on the menu, with category filters and a one-tap **+** to add to the bag                                                  |
| `/menu/[drink]` | Photos, price, what's in the glass, **options** (e.g. Serve: Iced / Hot), quantity and **Add to bag**                                 |
| `/checkout`     | Pickup time (as soon as possible, or a scheduled slot), name and phone, notes; pay at the counter                                     |
| `/order/[id]`   | The guest's order page: live status (received → whisking → ready → picked up), pickup time and place. The preview uses `/order/?id=…` |
| `/story`        | The founder's letter from the brand-story card, in full, with a timeline                                                              |
| `/matcha`       | Quality standards, the way of tea (和敬清寂), "About matcha" FAQ, the tools of the ritual, the wellness blends                        |
| `/community`    | The Matcha Club: past events and an Instagram gallery                                                                                 |
| `/visit`        | Address, hours, phone, map and good-to-know answers                                                                                   |

The header keeps to **Menu**, **Visit** and **Order pickup**. That button opens the bag, a slide-over with the order, pickup status ("Open now · ready in about 10 minutes" or "Closed right now. Order ahead for tomorrow at 9 am") and checkout. Delivery goes through the Toast ordering page, linked from the bag.

On computers with a mouse, the pointer becomes a small **3D bamboo matcha whisk** (Three.js). It trails the pointer on a spring, leans into the direction of travel, and whisks when it passes over a drink. A dot marks the exact click point. Touch screens, visitors who prefer reduced motion and browsers without WebGL keep their normal cursor.

**Japanese touches**, kept quiet: bilingual section labels (献立, 点前, 茶会…), a vertical line of Japanese beside the hero and on page intros, a vermilion hanko seal (九, "nine") in the footer and on order pages, the four principles of the tea ceremony on the matcha page, the Japanese names of the tea tools, a faint washi paper grain and seigaiha waves on the dark bands. The Japanese font is a small subset of Shippori Mincho holding only the characters the site uses; after changing any Japanese text, rebuild it with `node scripts/subset-japanese-font.mjs`.

### For the owner: the dashboard at `/admin`

| Page           | What it does                                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**   | Today's orders and sales, online ordering switch (taking orders / paused / hand off to Toast), Toast connection, one-tap "sold out" switches, latest orders    |
| **Orders**     | Live board (New → Preparing → Ready) that refreshes every few seconds, with an optional chime. One tap moves an order on and the guest's page updates          |
| **Menu**       | Show or hide drinks, mark them sold out, reorder them, and add, edit or delete them                                                                            |
| Drink editor   | Name, web address, price, category, badge, copy, "in the glass" parts, studio and bar photos (upload or pick), options with prices, ingredient list, Toast IDs |
| **Categories** | The menu page's filters: rename, reorder, add, delete                                                                                                          |
| **Settings**   | Ordering (mode, prep time, pickup-slot spacing, how far ahead), opening hours per day, the announcement bar, the Toast ordering link                           |

Every change is live on the website as soon as it's saved.

## How ordering works, and where Toast fits

Toast is the bar's point of sale and delivery partner. The site is built around it:

1. The guest checks out on the website. The server re-prices the bag from the live menu (prices in the browser are never trusted), checks the pickup time against the opening hours in Chicago time, and saves the order.
2. The order appears on the dashboard's **Orders** board. Staff move it along, and the guest's order page follows.
3. **With Toast API access**, each saved order is also sent to Toast (Orders API), so it prints on the bar like any other ticket. Orders are always saved first, so nothing is lost if Toast is unreachable, and the dashboard can retry. Each drink's Toast item ID is already filled in from the live Toast menu.
4. **Delivery**, and the whole ordering flow if the owner prefers, stays on the Toast-hosted ordering page. In the dashboard, _Hand off to Toast_ turns every order button into a link to Toast.

The site runs without Toast credentials ("demo mode"): orders live in the dashboard only. The Toast request code in `src/server/toast.ts` follows Toast's Orders API but **hasn't been run against Toast yet**. It needs a Toast integration with order-write access; test it against Toast's sandbox before switching it on. Its settings are in `.env.example`.

Payment is taken at the counter. Online card payment would come from the Toast integration (or a payment provider) and isn't part of the demo.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, server components, server actions, `proxy.ts`), React 19, TypeScript
- **Postgres**, through `pg` when `DATABASE_URL` is set, or an embedded [PGlite](https://pglite.dev) database in `.data/` when it isn't. Plain SQL with a small migration runner; the starting menu loads on first run
- Photos uploaded in the dashboard are resized with `sharp`, stored in the database and served from `/media/…`
- Dashboard sign-in: owner email and password from the environment, sessions stored hashed in the database (HttpOnly cookie)
- Validation with Zod, shared by the server and the preview (`src/lib/forms.ts`); Tailwind CSS v4 (design tokens in `src/app/globals.css`); Three.js for the cursor
- ESLint, Prettier, GitHub Actions: CI for the site (lint, typecheck, build) and the Pages deploy for the preview

## Getting started

Requires Node.js 20.9 or newer (CI uses Node 24, see `.nvmrc`).

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Website: http://localhost:3000
- Dashboard: http://localhost:3000/admin. Sign in with the demo login in `.env.example`. A production server refuses that example password, so a deployed site always needs its own `ADMIN_PASSWORD`.

With no `DATABASE_URL`, the first start creates an embedded database in `.data/` and loads the menu. `npm run db:reset` deletes it to start fresh.

| Script                            | What it does                                    |
| --------------------------------- | ----------------------------------------------- |
| `npm run dev`                     | Start the dev server (the site)                 |
| `npm run build` / `npm start`     | Production build and server (the site)          |
| `npm run dev:pages`               | Dev server for the design preview               |
| `npm run build:pages`             | Static export of the design preview into `out/` |
| `npm run preview:pages`           | Serve `out/` locally                            |
| `npm run lint`                    | ESLint                                          |
| `npm run typecheck`               | Generate route types and run `tsc`              |
| `npm run format` / `format:check` | Prettier                                        |
| `npm run db:reset`                | Delete the local embedded database (`.data/`)   |

## Deploying

**The design preview** deploys itself: every push to `main` builds it and publishes it to GitHub Pages (`.github/workflows/pages.yml`). The base path (`/<repo>`) is detected, so renaming the repository or adding a custom domain needs no code changes.

**The site** needs a Node.js server. Set these on the host: `ADMIN_EMAIL`, `ADMIN_PASSWORD` and, unless the host has a persistent disk, `DATABASE_URL`. The database tables are created on first start.

- **Railway**: create a service from the repository and either add a Postgres database (sets `DATABASE_URL`) or attach a volume and set `PGLITE_DIR` to a folder on it. Add the admin variables.
- **Vercel**: import the repository, add a Postgres database from the Vercel Marketplace (Neon, for example; it sets `DATABASE_URL`), add the two admin variables, deploy. The site address is detected automatically.
- **Any Node host or VPS**: `npm ci && npm run build && npm start`, with `DATABASE_URL`, or `PGLITE_DIR` on persistent storage. Run one instance when using the embedded database.

Set `NEXT_PUBLIC_SITE_URL` to the public address if it isn't detected (it's used for share images).

## Project structure

```
src/
  app/
    (site)/              storefront routes: page.server.tsx (site) and page.static.tsx (preview)
    admin/               dashboard routes and server actions
    media/[file]/        uploaded photos (site only)
  components/
    views/               storefront pages as views, shared by both builds
    admin/               dashboard UI; admin/views/ holds the dashboard pages as views
    cursor/              the 3D whisk cursor
    order/               bag store, bag drawer, add-to-bag, checkout form, pickup button, status
    home/ layout/ menu/ ui/ seo/
  content/               the starting menu, brand story, matcha FAQ, community events
  demo/                  the preview's browser store, its versions of the actions, page wrappers
  lib/                   shared types and rules: menu and pricing, pickup times, forms, orders
  server/                database, migrations, auth, menu, orders, media, Toast (site only)
  proxy.server.ts        sends signed-out visitors from /admin to the sign-in page
public/images/drinks/    the drink photography the starting menu uses
scripts/                 subset-japanese-font.mjs
```

## Content and images

All content is the client's own: the printed brand-story card and menu, the live Toast menu (names, prices, item IDs), the QR ingredient pages, their Instagram posts and their photography. The research behind it is kept **outside this repository** in the local `resources/` folder.

- `public/images/drinks/product/`: the Toast product shots, backgrounds normalised to pure white so they blend into the cards
- `public/images/drinks/bar/`: the client's real bar photos, cropped (and in three cases retouched) to remove the name labels from their Instagram stories
- `src/assets/`: brand, place, craft and community photos, the logo cut out to transparent WebP, and the Japanese font subset (SIL Open Font License, see `src/assets/fonts/OFL.txt`)

**Still to confirm with the client:** opening hours (the site starts with "Daily, 9 am – 2 pm" from their draft site; editable in Settings), drink options beyond the published "hot or iced · milk or water" (editable per drink), the grams of matcha per drink (their pages say both 3 g and 4 g, so no figure is shown), and Toast API access for sending orders to the POS.
