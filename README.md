# calc.github.io

Static calculator suite built with Vite + TypeScript + Tailwind, powered by [`decimal.js`](https://mikemcl.github.io/decimal.js/) for precise arithmetic.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs with Vite (default port 5173). Open the UI and switch calculators from the left navigation.

## Scripts

- `npm run dev` – Vite dev server
- `npm run build` – Production build (`dist/`) plus SPA fallback (`dist/404.html`)
- `npm run preview` – Preview the production build
- `npm run test` – Run unit tests with Vitest

## Deployment

The repository is wired for GitHub Pages. On push to `main`, the workflow at `.github/workflows/deploy.yml`:

1. Installs dependencies with `npm ci`
2. Builds the site with Vite
3. Copies `dist/index.html` to `dist/404.html` to support deep links
4. Publishes `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`

If you prefer a manual publish, run `npm run build` and upload the `dist/` folder to your static host (or copy to a `docs/` folder and enable Pages from `docs/`).

## Notes

- Calculations run entirely in the browser; there is no server component.
- History is stored locally in `localStorage` under `calc.history`.
