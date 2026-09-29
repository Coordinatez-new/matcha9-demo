# Matcha 9 · Website demo

A premium, calm website concept for **Matcha 9**, the ceremonial-grade matcha bar inside Taco Maya in Logan Square, Chicago. It's built as a static site and deployed to GitHub Pages.

> Client demo. It's set to `noindex, nofollow`, so search engines won't list it.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static export) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com). Design tokens live in `src/app/globals.css`
- `next/font`: Cormorant Garamond (display), Inter (text), Pinyon Script (signature accents)
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
- For plain URLs to files in `public/` (videos, downloads) use `asset("/path")` from `src/lib/asset.ts`.

## Project structure

```
src/
  app/            routes, root layout, global styles, icons
  assets/brand/   logo (full colour + cream for dark backgrounds)
  lib/site.ts     verified business facts (address, phone, links)
  lib/asset.ts    base-path helper for /public URLs
public/           static files served as-is
```

## Content

All copy, menu data and photography come from the client's own material (brand-story card, menu, photos, Instagram, and the Toast ordering menu). That research is kept **outside this repository** in the local `resources/` folder. Only optimised, web-ready assets are copied into this project.
