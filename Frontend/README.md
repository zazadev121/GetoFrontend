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
