# Ingredio API

High-performance Backend API for the Ingredio mobile application. Built using Node.js (v20+), Fastify (v5), and TypeScript.

## 🏗️ Architecture

This API follows a strict **N-Tier (Layered) Architecture**. All features are decoupled across distinct layers to ensure optimal testability, scalability, and ease of maintenance as the codebase grows.

```text
src/
├── controller/     # Manages HTTP interactions (Extracts Request, formats Reply)
├── middleware/     # Fastify hooks applied globally or per-route scope (Auth, Context)
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
nvm use --lts
npm install
```

### 2. Environment Variables
Create a `.env` file in this directory (`apps/api/`) using the example as a template:
```bash
# Example .env configuration
PORT=9100
LOG_LEVEL=info
NODE_ENV=development
```

### 3. Run the Server

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
curl -v -H "x-user-id: suraj123" http://localhost:9100/api/v1/recommendations
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
