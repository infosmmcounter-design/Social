# SocialsFlip Marketplace

Escrow-protected marketplace for social media accounts (USDT TRC20 / BEP20 only).

## Live (Vercel + Neon + GoDaddy)

Full guide (new GitHub account + domain): **[docs/DEPLOY-GODADDY.md](docs/DEPLOY-GODADDY.md)**

Also: **[docs/DEPLOY-MOBILE.md](docs/DEPLOY-MOBILE.md)**

You need:
1. Push code to `infosmmcounter-design/Social` `main`
2. Free Neon Postgres → `DATABASE_URL`
3. Import repo in Vercel → add `DATABASE_URL` → Deploy
4. Point GoDaddy DNS (A/CNAME) to Vercel

### Marketplace modes
- **Accounts** — buy/sell social accounts
- **Freelance services** — Fiverr-style gigs (YouTube thumbnails, Reels editing, AI setup, page management…)

## Local

```bash
npm install
npm run preview   # stable production preview on :3000 (recommended)
# or: npm run dev # webpack dev (do not run build at the same time)
```

Open http://localhost:3000

If you ever see **Internal Server Error** from a broken `.next` cache:

```bash
npm run preview
```

That kills old Next processes, rebuilds cleanly, and starts one stable server.

### Demo logins

| Role  | Email                 | Password |
|-------|-----------------------|----------|
| Admin | admin@socialsflip.com | admin123 |
| Buyer | buyer@demo.com        | buyer123 |

## Escrow wallets

- USDT TRC20: `TLj1Esv4stWJNcimvXZDXkP5W9FZfQVpx7`
- USDT BEP20: `0x97ff787aa462141bc27660BFDB8b96728B3e0209`

## Stack

- Next.js App Router + API routes
- Local file store (dev) / Neon Postgres via `DATABASE_URL` (Vercel)
- Supabase-ready SQL: `supabase/schema.sql`
