# Deployment Guide

## 1) Local Run

```bash
npm install
npm start
```

Default health check:

```bash
GET /health
```

## 2) Environment Variables (Server Mode)

Set these for full backend features:

- `PORT` (optional)
- `NODE_ENV=production`
- `ALLOWED_ORIGIN` (comma-separated list, e.g. `https://your-app.vercel.app`)
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

If Supabase credentials are missing, the app still works in local-only mode.

## 3) Netlify (Static SPA)

- `netlify.toml` is included.
- Deploy root directory.
- App works with local-first fallback (no backend required).

## 4) Vercel (Static SPA)

- `vercel.json` is included.
- Deploy root directory.
- App rewrites all routes to `index.html`.

## 5) Firebase Hosting (Static SPA)

- `firebase.json` is included.
- Run:

```bash
firebase init hosting
firebase deploy
```

## Notes

- For backend APIs in production, prefer a Node host (for example Render/Railway/Fly/VM) and point frontend to that origin.
- Static hosting still works because chat/logging have local fallbacks.
