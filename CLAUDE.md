# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ingredio is a mobile app that lets users scan Indian food or cosmetic product barcodes and get an instant ingredient safety score.

## Stack

- **Mobile** — React Native + Expo (`apps/mobile/`)
- **API** — Node.js + Express OR FastAPI + PostgreSQL + Redis (`apps/api/`)
- **Scraper** — Python + Playwright (`data/scraper/`)
- **Shared types** — TypeScript (`packages/shared/`)
- **Auth** — Supabase
- **Payments** — Razorpay
- **Storage** — Cloudflare R2
- **OCR** — Google Vision API

## Setup

```bash
npm install
cp .env.example .env
docker-compose up -d        # starts postgres + redis
cd apps/api && npm run migrate
npm run dev
```

### Scraper setup

```bash
cd data/scraper
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python scrapers/bigbasket.py
python pipeline/normalize.py
python pipeline/import_to_db.py
```

## Architecture

```
ingredio/
├── apps/
│   ├── mobile/        # React Native + Expo
│   └── api/           # Express API
├── packages/
│   └── shared/        # Shared TypeScript types between mobile and API
└── data/
    ├── scraper/       # BigBasket, Blinkit, Zepto scrapers
    └── ingredients/   # Master ingredient scoring database
```

**Data flow:** Scrapers pull product/ingredient data from e-commerce sites → normalize and import into PostgreSQL → API serves ingredient safety scores → mobile app scans barcodes and displays results.

## Required Environment Variables

```
DATABASE_URL=
REDIS_URL=
SUPABASE_URL=
SUPABASE_KEY=
GOOGLE_VISION_API_KEY=
REVENUECAT_API_KEY=
CLOUDFLARE_R2_KEY=
```
