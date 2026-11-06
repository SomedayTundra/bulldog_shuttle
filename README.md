# Bulldog Shuttle

Find the best Jefferson Lines bus between two cities without clicking through every
departure stop by hand. Pick a departure and arrival city and the app searches **every
stop in both cities** (downtown stations, campuses, airports, and so on) for the chosen
date. It then ranks the trips by your preferences.

- **Controls:** departure/arrival city, travel date, departure time (morning, midday,
  evening, don't care), allow transfers, minimize stops, prefer shortest trips
- **Results table:** click any row for highlighted boarding and booking instructions
- Styled in University of Minnesota Duluth maroon and gold. The mascot is original art
  (a gopher riding a bulldog riding a bus); other options are in `mascot-options/`

Stack: Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), TanStack Query
and TanStack Table, plus Vercel Functions.

## How it works

`ride.jeffersonlines.com` is a single-page app backed by a JSON API at
`ride-api.jeffersonlines.com`. Two serverless functions proxy that API, so the browser
never calls it directly and CORS isn't an issue:

| Endpoint | What it does |
|---|---|
| `GET /api/cities` | All Jefferson Lines cities, built from the stop list (cached for 1 hour) |
| `GET /api/trips?from=Minneapolis\|MN&to=Duluth\|MN&date=2026-10-14` | Searches every origin stop × destination stop pair in parallel and returns normalized trips with legs, layovers, and fares |

Filtering and sorting happen in the browser (`src/lib/trips.ts`), so changing a
preference is instant. Only changing the cities or the date triggers a new search.

Note that cities are separate: **Saint Paul** (Union Depot) is its own city. For
Twin Cities → Duluth, check both Minneapolis and Saint Paul. The fastest nonstop buses
often leave from Union Depot.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173 (the /api routes run inside Vite)
npm run build      # typecheck + production build
```

During development, `server/dev-api.ts` serves `/api/*` by loading the same handler
files Vercel deploys, so there's no need for `vercel dev`.

## Deploy to Vercel

Push this folder to a Git repo and import it at vercel.com/new. You can also run:

```bash
npx vercel        # preview
npx vercel --prod
```

`vercel.json` sets the Vite framework preset, the `dist` output, and a 30-second limit
for the API functions. No environment variables are needed.

## Caveats

This is an unofficial tool that relies on an undocumented API. If Jefferson Lines
changes that API, `api/_lib/jefferson.ts` is the only file to update. Always confirm
the time and fare on jeffersonlines.com before you buy.
