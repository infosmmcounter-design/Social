# SocialsFlip — Mobile se live (GitHub + Vercel)

**Naya GitHub:** `infosmmcounter-design` · Repo: https://github.com/infosmmcounter-design/Social  
GoDaddy domain ke liye detail: **[DEPLOY-GODADDY.md](./DEPLOY-GODADDY.md)**

## 1) Code `main` par (GitHub)

1. Cursor GitHub App naye account par install karein (Contents: write).  
2. Ya laptop se ZIP push karein (DEPLOY-GODADDY.md → Manual fallback).

## 2) Free Postgres (Neon) — Vercel ke liye zaroori

Vercel par file-storage persist nahi hoti. Is liye free Neon DB:

1. Phone browser: https://neon.tech → Sign up (GitHub se)
2. **Create project** → project name: `socialsflip`
3. Connection string copy karein (`postgresql://...`)  
   → yehi **DATABASE_URL** hai

## 3) Vercel par deploy (mobile)

1. https://vercel.com → Login with GitHub
2. **Add New… → Project**
3. Repo choose: `socialsflip/Marketplace`
4. Framework: **Next.js** (auto)
5. **Environment Variables** add karein:
   - Name: `DATABASE_URL`
   - Value: Neon wali connection string
6. **Deploy** dabayein
7. Deploy hone ke baad Vercel aapko link dega, jaise:  
   `https://marketplace-xxxxx.vercel.app`

## 4) Live check (phone)

1. Vercel link open karein
2. Home → listings dikhni chahiye
3. Koi listing → **Buy Now / Start Escrow Deal**
4. USDT TRC20 ya BEP20 choose → deal room
5. Escrow address Copy → Trust Wallet se send
6. TX hash Submit → Admin login se **Confirm payment**

### Demo logins (live pe password change kar dein)

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@socialsflip.com | admin123  |
| Buyer | buyer@demo.com        | buyer123  |

Admin → **Settings → Change admin password**

## 5) Agar kuch break ho

- `/api/health` open karein — `"persistence":"postgres"` aana chahiye
- Agar `"file"` dikhe to `DATABASE_URL` Vercel env mein missing hai → Redeploy after adding

## Optional baad mein

- Custom domain (Vercel → Domains)
- Auto TX detect (TronGrid + BscScan API keys)
