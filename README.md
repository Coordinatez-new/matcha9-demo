# Matcha 9 · Website demo

A premium, calm website concept for **Matcha 9**, the ceremonial-grade matcha bar inside Taco Maya in Logan Square, Chicago. It's built as a static site and deployed to GitHub Pages.

> Client demo. It's set to `noindex, nofollow`, so search engines won't list it.

## What's in the demo

| Route            | Page                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/`              | Home: hero, the standard, menu carousel, wellness blends, the ritual, founder story, Matcha Club events, visit, shop teaser, Instagram |
| `/menu/`         | The nine signature drinks with category filters                                                                                        |
| `/menu/[drink]/` | One page per drink: studio and bar photos, price, what's in the glass, order link, full ingredient lists for the wellness blends       |
| `/story/`        | The founder's letter from the brand-story card, in full, with a timeline                                                               |
| `/matcha/`       | Quality standards, "About matcha" FAQ, the tools of the ritual, the wellness blends                                                    |
| `/community/`    | The Matcha Club: past events and an Instagram gallery                                                                                  |
| `/visit/`        | Address, hours, phone, map, and good-to-know answers                                                                                   |

All content is the client's own: the printed brand-story card and menu, the live Toast menu (names, prices, order links), the QR ingredient pages, their Instagram posts and their photography.

**Still to confirm with the client:** opening hours (the site uses the "Daily, 9 am – 2 pm" from their own draft site), the grams of matcha per drink (their pages say both 3 g and 4 g, so no figure is shown), and permission to link the Toast ordering page.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static export) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com). Design tokens are in `src/app/globals.css`
- `next/font`: Cormorant Garamond (display), Inter (text), Pinyon Script (signature accents)
- No UI or animation libraries. The scroll reveals, carousel, filters and gallery are small client components
- ESLint and Prettier (with Tailwind class sorting)
- GitHub Actions to deploy to GitHub Pages

## Getting started

Requires Node.js 20.9 or newer (CI uses Node 24, see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                            | What it does                       |
| --------------------------------- | ---------------------------------- |
| `npm run dev`                     | Start the dev server               |
| `npm run build`                   | Build the static site into `out/`  |
| `npm run preview`                 | Serve `out/` locally               |
| `npm run lint`                    | ESLint                             |
| `npm run typecheck`               | Generate route types and run `tsc` |
| `npm run format` / `format:check` | Prettier                           |

## Deployment (GitHub Pages)

1. In the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` lints, builds and publishes `out/`.
3. The site goes live at `https://<user>.github.io/<repo>/`.

The base path (`/<repo>`) is detected by the workflow, so renaming the repository or moving to a custom domain needs no code changes. In code:

- `next/link` and statically imported images (`import img from "@/assets/..."`) get the base path automatically.
- For plain URLs to files in `public/` use `asset("/path")` from `src/lib/asset.ts`.

## Project structure

```
src/
  app/                 routes, root layout, global styles, icons, share image
  assets/              web-optimised images (brand, drinks, place, craft, community, features)
  components/
    home/              homepage sections
    layout/            header, footer, announcement bar
    menu/              drink card, carousel, filterable grid, gallery
    ui/                buttons, reveal, accordion, marquee, seal, section headers
    seo/               schema.org data for the café
  content/             drinks, brand story, matcha FAQ, community events and gallery
  lib/                 site facts, metadata helper, base-path helper
```

## Content and images

The research behind this demo (scraped website, Instagram, Toast menu, the client's photos) is kept **outside this repository** in the local `resources/` folder. Only optimised, web-ready copies of the images are committed here:

- `assets/drinks/product/`: the Toast product shots, backgrounds normalised to pure white so they blend into the cards
- `assets/drinks/bar/`: the client's real bar photos, cropped (and in three cases retouched) to remove the name labels from their Instagram stories
- `assets/brand/`: the real logo cut out to transparent WebP, in full colour and cream
