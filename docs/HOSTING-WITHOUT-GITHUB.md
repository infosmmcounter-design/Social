# GitHub ke baghair SocialsFlip live kaise karein

Agar GitHub account suspend ho gaya ho to Vercel Git deploy kaam nahi karega.
Neeche alternatives hain.

## Option A — Cursor Publish (sab se asaan)

1. Cursor chat mein is agent ke **Publish** button se app publish karein
2. Visibility: **Public** choose karein
3. Link mil jayega — phone se open kar sakte hain

## Option B — ZIP + VPS / Node host

1. `SocialsFlip-marketplace.zip` download karein
2. Kisi VPS par (DigitalOcean / Contabo / Hostinger VPS):
   ```bash
   unzip SocialsFlip-marketplace.zip
   cd SocialsFlip-marketplace
   npm install
   npm run build
   npm start
   ```
3. Optional: free Neon `DATABASE_URL` set karein taake data persist rahe
4. Domain / IP se site open hogi

## Option C — Railway / Render (GitHub ke baghair)

- Railway: project create → **Deploy from local** / CLI upload
- Render: **Deploy a Docker / Web Service** with zip upload (agar available)

## Option D — Naya GitHub / GitLab account

Agar policy allow kare:
1. Naya GitLab.com account (GitHub nahi)
2. Repo push
3. Vercel/Netlify se GitLab connect

> Purane suspend account se ToS dodge karne ki advice nahi — nayi account sirf agar aap rules follow karte hain.

## Local phone test (bina host ke)

Computer/laptop par:
```bash
npm install
npm run dev
```
Phir phone aur laptop same Wi‑Fi par → laptop IP:3000 open karein.
