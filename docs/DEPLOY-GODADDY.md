# SocialsFlip — Live deploy (new GitHub + Vercel + GoDaddy)

Aapka naya GitHub: **infosmmcounter-design**  
Repo: https://github.com/infosmmcounter-design/Social  
Domain: GoDaddy par (apna domain)

## A) Pehle: Cursor GitHub App (push ke liye zaroori)

Cloud Agent abhi **write push** nahi kar sakta jab tak Cursor GitHub App naye account par install na ho:

1. Open: https://github.com/apps/cursor  
2. **Install** / **Configure** → account `infosmmcounter-design`  
3. Repo access: **All repositories** ya specifically **Social**  
4. Permissions: **Contents: Read and write**, **Pull requests: Read and write**

Phir Cursor agent ko bata dein “GitHub app installed” — woh code `main` par push kar dega.

**Manual fallback (abhi):** laptop pe ZIP extract karke:

```bash
cd SocialsFlip-folder
git init
git remote add origin https://github.com/infosmmcounter-design/Social.git
git add .
git commit -m "SocialsFlip marketplace"
git branch -M main
git push -u origin main --force
```

(Force is OK sirf is liye ke repo abhi empty/README-only hai.)

---

## B) Free Postgres (Neon) — live data ke liye zaroori

Vercel par file storage persist nahi hoti. Neon free use karein:

1. https://neon.tech → Sign up with **naya** GitHub  
2. Create project: `socialsflip`  
3. Copy connection string → yehi **`DATABASE_URL`** hai  
   (`postgresql://...?...sslmode=require`)

---

## C) Vercel par deploy

1. https://vercel.com → Login with **infosmmcounter-design** GitHub  
2. **Add New → Project** → import **Social**  
3. Framework: **Next.js** (auto)  
4. **Environment Variables:**
   - `DATABASE_URL` = Neon wali string  
   - `NEXT_PUBLIC_SITE_URL` = `https://YOURDOMAIN.com` (baad mein domain set karke update)  
5. **Deploy**  
6. Temporary URL milega: `https://social-xxxxx.vercel.app`  
7. Check: `https://….vercel.app/api/health`  
   → `"persistence":"postgres"` hona chahiye  

Demo login (live pe turant change karein):

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@socialsflip.com | admin123  |

Admin → **Settings → Change admin password** + Trust Wallet USDT addresses paste.

---

## D) GoDaddy domain → Vercel (step by step)

1. Vercel project → **Settings → Domains** → Add `yourdomain.com` aur `www.yourdomain.com`  
2. Vercel aapko DNS records dikhayega (usually):
   - **A** record `@` → `76.76.21.21` (Vercel IP — UI mein exact value dekhein)  
   - **CNAME** `www` → `cname.vercel-dns.com`  
3. GoDaddy → **My Products → DNS** (domain ke liye):
   - Purane A / CNAME / Parked records jo conflict karein, hata dein ya edit  
   - Upar wale Vercel records add karein  
4. Save → 5–60 minutes wait (kabhi 24h)  
5. Vercel Domains page par **Valid** / SSL active dikhe  
6. `NEXT_PUBLIC_SITE_URL` update karke **Redeploy**

### GoDaddy tips
- Agar GoDaddy “Forwarding” on hai to band kar dein (Vercel ke saath conflict).  
- Nameservers GoDaddy ke default reh sakte hain jab tak A/CNAME yahin set ho.  
- Agar nameservers Cloudflare pe shift karna ho to woh alag flow hai — pehle seedha GoDaddy DNS theek hai.

---

## E) Live checklist

1. Home + **Services** (Freelance) tab  
2. Listing → Buy / Order gig → USDT pay flow  
3. Admin confirm payment → seller deliver → buyer complete  
4. Admin password change  
5. Escrow wallet addresses apni Trust Wallet se  

## F) Budget (low)

| Piece        | Cost              |
|--------------|-------------------|
| Vercel Hobby | Free              |
| Neon free    | Free              |
| Domain       | Jo GoDaddy pe hai |
| Total start  | ~$0 / month       |

Baad mein: Vercel Pro / Neon paid tab jab traffic / DB size barhe.
