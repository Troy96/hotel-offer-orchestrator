# Hotel Offer Orchestrator

A backend service that aggregates hotel offers from two mock suppliers, deduplicates listings by hotel name, and returns the best-priced offer per hotel. Orchestration is handled by **Temporal**, results are cached in **Redis** using a Sorted Set for O(log N) price-range filtering, and the whole stack runs via **Docker Compose**.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Workflow & Caching Design](#workflow--caching-design)
- [Temporal UI](#temporal-ui)
- [Design Decisions](#design-decisions)

---

## Architecture

```
┌─────────────┐     GET /api/hotels      ┌─────────────────────┐
│   Client    │ ───────────────────────► │    Express API       │
└─────────────┘                          │  (apps/api)          │
                                         └────────┬────────────┘
                                                  │
                                    cache miss     │    cache hit
                                    ┌─────────────┘─────────────────┐
                                    │                                │
                                    ▼                                ▼
                         ┌──────────────────┐            ┌──────────────────┐
                         │  Temporal Client  │            │      Redis        │
                         │  trigger workflow │            │                   │
                         └────────┬─────────┘            └──────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Temporal Worker        │
                    │   (apps/worker)          │
                    │                          │
                    │  ┌──────────────────┐   │
                    │  │  hotelWorkflow   │   │
                    │  │                  │   │
                    │  │  fetchSupplierA ─┼───┼──► GET /api/supplierA/hotels
                    │  │  fetchSupplierB ─┼───┼──► GET /api/supplierB/hotels
                    │  │  (parallel)      │   │
                    │  │       │          │   │
                    │  │  dedup + select  │   │
                    │  │  cheapest offer  │   │
                    │  └──────────────────┘   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │      Redis       │
                    │  Sorted Set by   │
                    │  price           │
                    └──────────────────┘
```

---

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js 18 + TypeScript |
| API Framework | Express 4 |
| Orchestration | Temporal (dev mode) |
| Cache & Filtering | Redis - Sorted Set (`ZADD` / `ZRANGEBYSCORE`) |
| HTTP Client | Axios |
| Containerisation | Docker Compose |
| Dev runner | `tsx` (no compile step in development) |

---

## Project Structure

```
hotel-offer-orchestrator/
├── apps/
│   ├── api/                        # Express HTTP server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── hotelController.ts
│   │   │   ├── routes/
│   │   │   │   └── hotelRoutes.ts
│   │   │   ├── services/
│   │   │   │   └── hotelService.ts
│   │   │   ├── utils/
│   │   │   │   └── validator.ts
│   │   │   └── index.ts
│   │   └── Dockerfile
│   └── worker/                     # Temporal worker process
│       ├── src/
│       │   └── worker.ts
│       └── Dockerfile
├── packages/
│   ├── suppliers/                  # Mock supplier A & B fetch logic
│   ├── workflows/                  # Temporal workflow definition
│   └── redis/                      # Redis client + hotel repository
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

The monorepo uses TypeScript path aliases to keep cross-package imports clean:

```jsonc
"paths": {
  "@suppliers/*": ["packages/suppliers/src/*"],
  "@workflows/*": ["packages/workflows/src/*"],
  "@redis/*":     ["packages/redis/src/*"]
}
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run the full stack

```bash
git clone <repo-url>
cd hotel-offer-orchestrator
docker compose up --build
```

This starts four services:

| Service | Port | Description |
|---|---|---|
| `api` | `3000` | Express HTTP API |
| `worker` | — | Temporal workflow worker (no exposed port) |
| `temporal` | `7233` / `8233` | Temporal server + Web UI |
| `redis` | `6379` | Redis |

The API is ready when you see:
```
api | API running on port 3000
worker | Worker connected to Temporal
```

### Run locally (without Docker)

Requires Redis and Temporal running locally. The fastest way is to run just the dependencies via Docker and the app processes directly:

```bash
# Start Redis and Temporal only
docker compose up redis temporal

# In one terminal — start the API
npm run dev:api

# In another terminal — start the worker
npm run dev:worker
```

### Other scripts

```bash
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled API (production)
npm run start:worker # Run compiled worker (production)
npm run typecheck    # Type-check without emitting
npm run lint         # ESLint
```

---

## Environment Variables

These are set per-service in `docker-compose.yml`. When running locally, defaults are used.

| Variable | Default (local) | Docker value | Description |
|---|---|---|---|
| `PORT` | `3000` | `3000` | Express server port |
| `REDIS_HOST` | `localhost` | `redis` | Redis hostname |
| `TEMPORAL_ADDRESS` | `localhost:7233` | `temporal:7233` | Temporal gRPC address |

---

## API Reference

All routes are mounted under `/api`.

---

### `GET /api/hotels`

Returns the deduplicated, best-priced hotel list for a city. On the first request for a city the Temporal workflow is triggered; subsequent requests are served from Redis.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `city` | `string` | ✅ | City to search (e.g. `delhi`) |
| `min` | `number` | ❌ | Minimum price filter (inclusive) |
| `max` | `number` | ❌ | Maximum price filter (inclusive) |

**Examples**

```bash
# All hotels in Delhi
GET /api/hotels?city=delhi

# Hotels in Delhi between ₹4,000 and ₹9,000
GET /api/hotels?city=delhi&min=4000&max=9000
```

**Response `200 OK`**

```json
[
  {
    "name": "Holtin",
    "price": 5340,
    "supplier": "Supplier B",
    "commissionPct": 20
  },
  {
    "name": "Radison",
    "price": 5900,
    "supplier": "Supplier A",
    "commissionPct": 13
  }
]
```

**Error Responses**

| Status | Condition |
|---|---|
| `400` | Missing or invalid query parameters |
| `500` | Internal server error (e.g. Temporal or Redis unavailable) |

---

### `GET /api/supplierA/hotels`

Mock Supplier A endpoint. Returns a static hotel list for the requested city.

```bash
GET /api/supplierA/hotels?city=delhi
```

**Response `200 OK`**

```json
[
  {
    "hotelId": "a1",
    "name": "Holtin",
    "price": 6000,
    "city": "delhi",
    "commissionPct": 10
  }
]
```

---

### `GET /api/supplierB/hotels`

Mock Supplier B endpoint. Returns a static hotel list for the requested city. Intentionally overlaps with Supplier A on several hotel names at different prices to exercise the deduplication logic.

```bash
GET /api/supplierB/hotels?city=delhi
```

---

### `GET /api/health`

Probes both supplier endpoints in parallel and returns an aggregated status. Used to verify the system is operational and both data sources are reachable.

```bash
GET /api/health
```

**Response `200 OK` — all systems healthy**

```json
{
  "status": "UP",
  "supplierA": "UP",
  "supplierB": "UP"
}
```

**Response — degraded**

```json
{
  "status": "DEGRADED"
}
```

---

## Workflow & Caching Design

### Temporal Workflow

The `hotelWorkflow` is triggered once per cold-cache city request. It:

1. Calls Supplier A and Supplier B **in parallel** via `Promise.all`
2. Merges the two lists — for hotels with the same name, selects the **cheaper price**
3. Returns the deduplicated result to the API, which then saves it to Redis

Temporal handles retries, timeouts, and failure visibility automatically. Each workflow execution is visible in the Temporal UI with a full event history.

### Redis Sorted Set

Hotels are stored as a **Sorted Set** with `price` as the score:

```
ZADD hotels:delhi <price> <JSON-stringified hotel>
```

This makes price-range filtering a single native Redis command:

```
ZRANGEBYSCORE hotels:delhi <min> <max>
```

---

## Temporal UI

The Temporal developer UI is available at:

```
http://localhost:8233
```

From here you can inspect workflow executions, event histories, activity retries, and worker status in real time. Useful for debugging the orchestration during development.

---
