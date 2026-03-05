<div align="center">
  <img src="public/logos/ingredio.webp" width="200" alt="Ingredio Logo" />
  <br />
  <h2>App Icon</h2>
  <img src="public/logos/logo-small.webp" width="80" alt="Ingredio Icon" />

  <h1>Ingredio</h1>

  <p>Scan any Indian food or cosmetic product barcode and get an instant ingredient safety score.</p>
</div>

---

## Stack

- **Mobile** — React Native + Expo (TBD)
- **API** — (Node.js + Express) OR (FastAPI) + PostgreSQL + Redis
- **Scraper** — Python + Playwright
- **Auth** — Supabase
- **Payments** — Razorpay?

---

## Setup

```bash
git clone https://github.com/yourhandle/ingredio.git
cd ingredio
npm install
cp .env.example .env
docker-compose up -d        # starts postgres + redis
cd apps/api && npm run migrate
npm run dev
```

### Scraper

```bash
cd data/scraper
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python scrapers/bigbasket.py
python pipeline/normalize.py
python pipeline/import_to_db.py
```

---

## Structure

```
ingredio/
├── apps/
│   ├── mobile/        # React Native
│   └── api/           # Express API
├── packages/
│   └── shared/        # Shared TypeScript types
└── data/
    ├── scraper/       # BigBasket, Blinkit, Zepto scrapers
    └── ingredients/   # Master ingredient scoring database
```

---

## Environment Variables

```bash
DATABASE_URL=
REDIS_URL=
SUPABASE_URL=
SUPABASE_KEY=
GOOGLE_VISION_API_KEY=
REVENUECAT_API_KEY=
CLOUDFLARE_R2_KEY=
```
