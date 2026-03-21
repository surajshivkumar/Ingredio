# Ingredio API

High-performance Backend API for the Ingredio mobile application. Built using Node.js (v20+), Fastify (v5), and TypeScript.

## 🏗️ Architecture

This API follows a strict **N-Tier (Layered) Architecture**. All features are decoupled across distinct layers to ensure optimal testability, scalability, and ease of maintenance as the codebase grows.

```text
src/
├── controller/     # Manages HTTP interactions (Extracts Request, formats Reply)
├── db/             # Database connection pool & migration runner
├── middleware/     # Fastify hooks applied globally or per-route scope (Auth, Context, DB)
├── migrations/    # Auto-generated SQL migration files (via Drizzle Kit)
├── models/        # Drizzle ORM table definitions (PostgreSQL schemas)
├── routes/         # Maps endpoint URIs and HTTP verbs directly to Controllers
├── services/       # Contains ALL core business logic! Connects to Postgres/Redis
├── types/          # TypeScript interfaces for strict Data Contracts (Inputs/Outputs)
└── server.ts       # Application runtime entry point & Bootstrap
```

### Feature Implementation Flow

If you need to build a new feature (e.g., User Profiles), you will follow this exact flow:
`Route` ➔ `Controller` ➔ `Service` ➔ `Types`.

Never put database calls directly in a Controller. Everything goes through a Service.

---

## 🚀 Getting Started

### Prerequisites

Before running the API, ensure the following are installed on your machine:

| Prerequisite | Version | Check Command |
|---|---|---|
| **Node.js** | v20.x or higher | `node -v` |
| **npm** | v10.x or higher | `npm -v` |
| **PostgreSQL** | v15 or higher | `psql --version` |
| **nvm** (optional) | latest | `nvm --version` |

### Step 1 — Clone & Enter Project

```bash
git clone https://github.com/yourhandle/ingredio.git
cd ingredio/apps/api
```

### Step 2 — Set Node Version

```bash
nvm use v20
```

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Start PostgreSQL

Make sure PostgreSQL is running on your machine.

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**Linux (systemd):**
```bash
sudo systemctl start postgresql
```

**Docker (alternative):**
```bash
docker run -d --name ingredio-postgres \
  -e POSTGRES_USER=suraj \
  -e POSTGRES_DB=ingredio \
  -p 5432:5432 \
  postgres:15
```

### Step 5 — Create the Database

Connect to PostgreSQL and create the database:

```bash
psql postgres -c "CREATE DATABASE ingredio;"
```

If you need to create a specific user:
```bash
psql postgres -c "CREATE USER youruser WITH PASSWORD 'yourpassword';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE ingredio TO youruser;"
```

### Step 6 — Configure Environment Variables

Create a `.env` file in the `apps/api/` directory:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```bash
# Server port
PORT=9600

# PostgreSQL connection string
# Format: postgresql://<user>[:<password>]@<host>:<port>/<database>
DATABASE_URL=postgresql://suraj@localhost:5432/ingredio
```

**Examples:**

```bash
# Local with no password
DATABASE_URL=postgresql://suraj@localhost:5432/ingredio

# Local with password
DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/ingredio

# Remote PostgreSQL
DATABASE_URL=postgresql://user:pass@remote-host:5432/ingredio
```

### Step 7 — Generate & Run Database Migrations

**Generate migration files** (creates SQL from schema changes):
```bash
npm run db:generate
```
This reads your Drizzle models in `src/models/`, diffs against existing migrations in `src/migrations/`, and generates a new `.sql` file.

**Apply all pending migrations** to your PostgreSQL database:
```bash
npm run db:migrate
```

**Push schema directly** (skip migration files, fast for prototyping):
```bash
npm run db:push
```

### Step 8 — Seed the Database

Populate the database with sample data (products, brands, categories, users, etc.):

```bash
npm run db:seed
```

The seed script reads from `data/pipeline/india_products_cleaned.jsonl` and inserts:
- Brands, Categories, Ingredients, Allergens
- Products with nutrition data
- Item-ingredient and item-allergen mappings
- Preferences, Box categories
- Sample users and reviewers
- App version records

**To re-seed**, the script automatically truncates all tables before inserting.

### Step 9 — Run the Server

**Development (Hot-Reloading):**
Powered by `ts-node-dev`. Automatically injects the `.env` file and restarts the server on any TypeScript file changes.

```bash
npm run dev
```

**Production:**
Builds TypeScript to JavaScript (`dist/`) and runs the compiled output.

```bash
npm run build
npm run start
```

### Step 10 — Verify the Server is Running

Open a new terminal and test the health check endpoint:

```bash
curl http://localhost:9600/health
```

**Expected response:**
```json
{ "status": "running" }
```

---

## 🗄️ Database

### Tech Stack
- **ORM** — [Drizzle ORM](https://orm.drizzle.team/) (type-safe, lightweight)
- **Migration Tool** — [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) (auto-generates SQL from schema diffs)
- **Database** — PostgreSQL

### Scripts

| Script | Command | Description |
|---|---|---|
| Generate migration | `npm run db:generate` | Reads models, diffs against existing migrations, creates a new `.sql` file |
| Apply migrations | `npm run db:migrate` | Applies all pending migrations to your Postgres database |
| Push schema (dev) | `npm run db:push` | Pushes schema directly without creating migration files (fast for prototyping) |
| Seed database | `npm run db:seed` | Seeds the database with initial product data from `data/pipeline/` |
| Drizzle Studio | `npm run db:studio` | Opens a visual database browser at `https://local.drizzle.studio` |

### How Drizzle Commands Work

#### `npm run db:generate`

```bash
npm run db:generate
```

- Reads your schema from `src/models/schema.ts`
- Compares against existing migration files in `src/migrations/`
- Generates a new timestamped SQL migration file
- **Use when:** You've added/modified a model and want a versioned migration

#### `npm run db:migrate`

```bash
npm run db:migrate
```

- Reads all pending `.sql` files from `src/migrations/`
- Applies them sequentially to your PostgreSQL database
- Tracks which migrations have been applied (via a `__drizzle_migrations` table)
- **Use when:** You have new migration files to apply

#### `npm run db:push`

```bash
npm run db:push
```

- Pushes your current schema directly to the database
- Does NOT create migration files
- **Use when:** Prototyping or in early development (not for production)

#### `npm run db:seed`

```bash
npm run db:seed
```

- Truncates all tables (resets data)
- Reads products from `data/pipeline/india_products_cleaned.jsonl`
- Inserts brands, categories, ingredients, allergens, items, users, and more
- **Use when:** You need sample data for development/testing
- **Requires:** Migration must be applied first (`npm run db:migrate`)

### Schema Workflow

When you modify or add a model:

```bash
# 1. Edit a model file in src/models/
# 2. Export it from src/models/schema.ts
# 3. Generate the migration SQL
npm run db:generate

# 4. Apply it to the database
npm run db:migrate
```

### Data Model (20 Tables)

```text
Core Tables              Entity Tables          Junction / Child Tables
─────────────           ──────────────          ───────────────────────
users                   item                    user_devices
app                     scans                   user_preferences
category                review                  user_allergens
brand                   box                     brand_categories
preferences                                     item_ingredients
allergen                                         item_allergens
ingredients                                      scan_images
reviewer
box_category
```

### ER Diagram (Simplified)

```
users ──┬── user_devices
        ├── user_preferences ── preferences
        ├── user_allergens ── allergen ── item_allergens ── item
        ├── scans ──┬── scan_images
        │           └── item ──┬── item_ingredients ── ingredients
        │                      ├── category
        │                      └── brand ── brand_categories ── category
        ├── review ── reviewer
        └── box ── box_category
```

### Accessing the DB in Routes

The database is available via `fastify.db` in all routes and plugins:

```ts
fastify.get("/items/:barcode", async (request, reply) => {
    const { barcode } = request.params as { barcode: string };

    const result = await fastify.db.query.item.findFirst({
        where: (item, { eq }) => eq(item.barcode, barcode),
    });

    return reply.send(result);
});
```

---

## 📡 API Endpoints

All application features are scoped under the `/api/v1/` prefix to guarantee backward compatibility for older mobile app clients.

> **Auth:** Most endpoints require the `x-user-id` header. Public routes: `/health`, `/api/v1/login`.

---

### Health Check

```bash
# GET /health
curl http://localhost:9600/health
```
```json
{ "status": "running" }
```

---

### Login (Public)

```bash
# POST /api/v1/login
curl -X POST http://localhost:9600/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "psharma@gmail.com", "password": "test"}'
```
```json
{
  "user": {
    "id": "...",
    "name": "Piyush Sharma",
    "email": "psharma@gmail.com"
  },
  "token": "..."
}
```

---

### Categories

```bash
# GET /api/v1/products/categories
curl -H "x-user-id: suraj123" http://localhost:9600/api/v1/products/categories
```
```json
[
  { "id": "...", "name": "Beverages", "logo": "" },
  { "id": "...", "name": "Snacks", "logo": "" }
]
```

---

### Items by Category

```bash
# GET /api/v1/products/category/:categoryId/items
curl -H "x-user-id: suraj123" \
  http://localhost:9600/api/v1/products/category/CATEGORY_ID/items
```
```json
[
  {
    "id": "...",
    "name": "Organic Green Tea",
    "barcode": "8909876543210",
    "item_score": 0,
    "nutri_score": "a",
    "calories_per_100g": 1
  }
]
```

---

### Single Item by Category

```bash
# GET /api/v1/products/category/:categoryId/items/:itemId
curl -H "x-user-id: suraj123" \
  http://localhost:9600/api/v1/products/category/CATEGORY_ID/items/ITEM_ID
```
```json
{
  "id": "...",
  "name": "Organic Green Tea",
  "barcode": "8909876543210",
  "description": "Organic Green Tea",
  "nutri_score": "a",
  "nova_group": 1,
  "image_front_url": "https://...",
  "ingredients": [...],
  "allergens": [...]
}
```

---

### Product by Barcode

```bash
# GET /api/v1/products/:barcode
curl -H "x-user-id: suraj123" \
  http://localhost:9600/api/v1/products/8901234567890
```
```json
{
  "barcode": "8901234567890",
  "name": "Sample Product",
  "safetyScore": "A",
  "ingredients": ["Water", "Sugar"]
}
```

---

### Product Scan (OCR)

```bash
# POST /api/v1/products/scan
curl -X POST http://localhost:9600/api/v1/products/scan \
  -H "x-user-id: suraj123" \
  -H "Content-Type: application/json"
```
```json
{ "message": "OCR processing started" }
```

---

### Recommendations

```bash
# GET /api/v1/recommendations
curl -H "x-user-id: suraj123" \
  http://localhost:9600/api/v1/recommendations
```
```json
{
  "recommendedProducts": [
    {
      "id": "prod_1",
      "name": "Healthy Oat Biscuits",
      "barcode": "8901234567890",
      "safetyScore": "A",
      "ingredients": ["Oats", "Honey", "Almond Flour"]
    },
    {
      "id": "prod_2",
      "name": "Organic Green Tea",
      "barcode": "8909876543210",
      "safetyScore": "A+",
      "ingredients": ["Green Tea Leaves"]
    }
  ]
}
```

---

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Server health check |
| POST | `/api/v1/login` | No | User login |
| GET | `/api/v1/products/categories` | Yes | List all categories |
| GET | `/api/v1/products/category/:categoryId/items` | Yes | Items in a category |
| GET | `/api/v1/products/category/:categoryId/items/:itemId` | Yes | Single item details |
| GET | `/api/v1/products/:barcode` | Yes | Lookup product by barcode |
| POST | `/api/v1/products/scan` | Yes | OCR scan (placeholder) |
| GET | `/api/v1/recommendations` | Yes | Personalized recommendations |

---

## 🔧 Troubleshooting

### Port already in use
```bash
# Find and kill the process using port 9600
lsof -ti:9600 | xargs kill -9
```

### Database connection refused
- Ensure PostgreSQL is running: `brew services list` or `systemctl status postgresql`
- Verify `DATABASE_URL` in `.env` is correct
- Check PostgreSQL is listening on port 5432: `lsof -i :5432`

### Migration errors
```bash
# Drop and recreate the database
psql postgres -c "DROP DATABASE ingredio;"
psql postgres -c "CREATE DATABASE ingredio;"
npm run db:migrate
```

### Node version mismatch
```bash
nvm install v20
nvm use v20
```
