# GETO Project — Frontend
**Repo:** `zazadev121/GetoFrontend`
**Deployed on:** Vercel

## ⚠️ CRITICAL — READ BEFORE PUSHING

> **DO NOT push the entire monorepo (`FullStackapp/`) here.**
>
> This repo contains **ONLY** the `Frontend/` folder (Angular app).
> The backend (`apiprojnew/`) has its own separate repo → **[GetoBackend](https://github.com/zazadev121/GetoBackend)**
>
> Pushing the whole app to this repo almost broke the entire project.
> **Always push only frontend changes here.**

---

## How to push correctly

The monorepo lives at `d:\Csharp things brada\FullStackapp\`.
It has two subfolders — each goes to its own GitHub repo:

| Folder | GitHub Repo | Platform |
|---|---|---|
| `Frontend/` | **GetoFrontend** (this repo) | Vercel |
| `apiprojnew/` | **GetoBackend** | Render |

### Push frontend changes
```bash
# From FullStackapp/ root
git add Frontend/
git commit -m "your message"
git push origin main
```

### Push backend changes
```bash
# From FullStackapp/ root
git add apiprojnew/
git commit -m "your message"
git push origin main

# Then sync to GetoBackend (Render reads from here)
$splitHash = git subtree split --prefix=apiprojnew HEAD
git push backend "${splitHash}:refs/heads/main" --force
```

> If `backend` remote is not set up yet:
> ```bash
> git remote add backend https://github.com/zazadev121/GetoBackend.git
> ```

---

## Tech Stack

- **Framework:** Angular 17+
- **Styling:** Tailwind CSS + custom CSS
- **Language:** TypeScript
- **Build:** `ng build`
- **Dev server:** `ng serve`

## Install & run locally

```bash
cd Frontend
npm install
npm run start
```

## Environment

- `src/environments/environment.ts` — local dev
- `src/environments/environment.prod.ts` — production (Vercel)

## Vercel Web Analytics

The Angular app initializes `@vercel/analytics` in `src/main.ts`. Enable **Web Analytics** for the `geto-frontend` project in Vercel and redeploy the frontend. Page views, including in-app navigation, will then appear in Vercel Analytics.

The admin page displays Vercel's own page views, visitor totals, daily traffic, and popular pages through the backend. Keep the Vercel access token on the backend only: set `VERCEL_ANALYTICS_TOKEN` in the backend's Render environment. The token must have access to the Vercel team that owns `geto-frontend`. The backend defaults to this project's known Vercel project and team IDs; `VERCEL_ANALYTICS_PROJECT_ID` and `VERCEL_ANALYTICS_TEAM_ID` can override them. Redeploy the backend after changing environment variables. The admin page shows setup guidance until the token is configured.
