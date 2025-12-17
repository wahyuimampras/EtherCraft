# Copilot instructions — EtherCraft

Purpose: give AI coding agents the exact, discoverable patterns and commands
to be immediately productive in this repo.

Big picture
- **Static site with Vite**: entry HTML pages are [index.html](index.html), [products.html](products.html), and [about.html](about.html). Vite multi-page inputs are defined in [vite.config.js](vite.config.js).
- **Client-side app + Supabase**: database access happens from the browser via `@supabase/supabase-js` (see [main.js](main.js)). The app queries the `products` table (`supabase.from('products')`).
- **Image optimization**: server-side/local script [optimize.js](optimize.js) uses `sharp` to process images under `public/products` and writes to `public/products/optimized-images`.
- **Deployment**: configured for Vercel. See [vercel.json](vercel.json) and `public/` static assets (sitemap, robots, verification files).

Key commands (from package.json)
- `npm run dev` — start Vite dev server.
- `npm run build` — build production assets with Vite.
- `npm run preview` — preview the built site.
- `node optimize.js` — run local image optimization (sharp must be installed; the project lists `sharp` as a dependency).

Important patterns & conventions
- Vanilla ESM + DOM-driven UI: code in [main.js](main.js) manipulates the DOM directly (no React/Vue). Keep changes idiomatic to this style rather than introducing framework-specific patterns.
- Environment variables: client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (accessed via `import.meta.env`). Do not hardcode secrets; expect `.env` or Vercel env settings.
- Pages are static HTML + associated JS modules: adding a new page requires adding an HTML file and adding it to `vite.config.js` rollup `input` map.
- Static assets: images and verification files live in `public/`. Optimized images are generated into `public/products/optimized-images` by `optimize.js`.
- Database surface: queries against `products` are central; check [supabase/migrations](supabase/migrations/) for schema clues (there is at least one migration SQL file).

Files to inspect when editing features
- UI, product flows and Supabase usage: [main.js](main.js)
- Build inputs: [vite.config.js](vite.config.js)
- Deployment headers: [vercel.json](vercel.json)
- Image processing: [optimize.js](optimize.js)
- Styles: [style.css](style.css)
- DB migrations: [supabase/migrations/](supabase/migrations/)

Safe change checklist for agents
- If adding a page: update `vite.config.js` inputs and ensure the HTML references the correct JS module.
- If changing data fields from `products`: update both queries in [main.js](main.js) and any rendering code which references `product.image_url`, `product.price`, `product.stock`, `product.category`, etc.
- When touching images: run `node optimize.js` locally to generate optimized copies in `public/products/optimized-images` and update paths in HTML/JS to prefer optimized images.
- Don’t commit environment secrets. Use `import.meta.env` and instruct the user to set Vercel or local `.env` variables.

Examples (concrete)
- Vite inputs: see [vite.config.js](vite.config.js) — `main`, `products`, `about` map to the three HTML pages.
- Supabase usage sample: in [main.js](main.js) `const { data, error } = await supabase.from('products').select('*');`
- Optimize script: [optimize.js](optimize.js) reads `public/products` and writes `public/products/optimized-images` using `sharp().resize(800).jpeg({quality:80})`.

When in doubt
- Preserve small, focused edits. Follow the repository's vanilla JS + DOM approach.
- Run `npm run dev` and verify UI flows (product grid, order modal) before opening PRs.

If you want me to expand this file with examples of common PR templates, or add automated checks (lint/build scripts), say which area to focus on.

— End of guidance
