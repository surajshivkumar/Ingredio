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

Ensure you have **Node.js v20.x or higher** installed.

### 1. Install Dependencies
```bash
nvm use v20
npm install
```

### 2. Environment Variables
Create a `.env` file in this directory (`apps/api/`) using the example as a template:
```bash
PORT=9600
DATABASE_URL=postgresql://youruser@localhost:5432/ingredio
```

### 3. Create the Database
```bash
psql postgres -c "CREATE DATABASE ingredio;"
```

### 4. Run Migrations
```bash
npm run db:migrate
```
This applies all pending SQL migrations from `src/migrations/` to your PostgreSQL database.

### 5. Run the Server

**Development (Hot-Reloading):**
Powered by `ts-node-dev`. Automatically injects the `.env` file and restarts the server on any TypeScript file changes.
```bash
npm run dev
```

**Production:**
Builds TypeScript to JavaScript (`dist/`) and correctly leverages Node's native file loader for `.env`.
```bash
npm run build
npm run start
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
| Drizzle Studio | `npm run db:studio` | Opens a visual database browser at `https://local.drizzle.studio` |

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

### Global Health Check
An unversioned, shallow ping check reserved strictly for Load Balancers (K8s, AWS).

*   **GET** `/health`

### Product Recommendations (Example Mock)

Retrieves a list of personalized product recommendations tailored to a specific user profile. Requires the `x-user-id` header to be present safely validated by the `request.context` hook.

*   **GET** `/api/v1/recommendations`

#### Example Curl
```bash
curl -v -H "x-user-id: suraj123" http://localhost:9600/api/v1/recommendations
```

#### Expected JSON Response
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
