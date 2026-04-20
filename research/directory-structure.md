# Directory Structure

Domain-driven architecture organized by **business capabilities**, not technologies.

## Core Domains
- **Player** - Accounts, profiles, achievements
- **Auth** - Login, sessions, authentication
- **Game** - Save/load game state, inventory
- **Analytics** - Events, leaderboards, metrics

## Backend Structure

```
backend/
├── src/
│   ├── server.ts
│   │
│   ├── databases/                    # Infrastructure: DB clients & schemas
│   │   ├── postgres/
│   │   │   ├── prisma.client.ts
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   │
│   │   ├── mongodb/
│   │   │   ├── mongoose.client.ts
│   │   │   ├── schemas/
│   │   │   │   ├── gameState.schema.ts
│   │   │   │   └── inventory.schema.ts
│   │   │   └── seed.ts
│   │   │
│   │   ├── redis/
│   │   │   └── redis.client.ts
│   │   │
│   │   └── clickhouse/
│   │       ├── clickhouse.client.ts
│   │       └── schemas/
│   │           └── player_events.sql
│   │
│   ├── domains/                      # Business logic by domain
│   │   ├── player/
│   │   │   ├── player.service.ts
│   │   │   ├── player.routes.ts
│   │   │   ├── player.types.ts
│   │   │   └── repositories/
│   │   │       └── player.repository.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── repositories/
│   │   │       └── session.repository.ts
│   │   │
│   │   ├── game/
│   │   │   ├── gameState.service.ts
│   │   │   ├── gameState.routes.ts
│   │   │   ├── gameState.types.ts
│   │   │   └── repositories/
│   │   │       ├── gameState.repository.ts
│   │   │       └── inventory.repository.ts
│   │   │
│   │   └── analytics/
│   │       ├── analytics.service.ts
│   │       ├── analytics.routes.ts
│   │       └── repositories/
│   │           ├── events.repository.ts
│   │           └── leaderboard.repository.ts
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── env.ts
│   │
│   └── routes.ts                     # Aggregate all domain routes
│
└── scripts/
    └── seed-dev-data.ts
```

## Frontend Structure

```
frontend/
└── src/
    ├── main.ts
    │
    ├── db/                           # IndexedDB (Dexie)
    │   ├── schema.ts
    │   ├── client.ts
    │   └── repositories/
    │       ├── localGameState.repository.ts
    │       └── offlineQueue.repository.ts
    │
    ├── api/                          # Backend API calls
    │   ├── client.ts
    │   ├── auth.api.ts
    │   ├── player.api.ts
    │   └── game.api.ts
    │
    ├── game/                         # Game engine
    │   ├── gameLoop.ts
    │   ├── renderer.ts
    │   ├── input.ts
    │   └── autoSave.ts
    │
    └── services/
        ├── syncService.ts            # Sync IndexedDB ↔ Backend
        └── offlineService.ts
```

## Architecture Principles

### Separation of Concerns
```
databases/    → Connection clients, schemas, migrations
domains/      → Business logic, grouped by capability
  routes/     → HTTP endpoints, validation
  services/   → Business logic, orchestration
  repositories/ → Data access queries
```

### Database Choices by Domain

| Domain | Database | Why |
|--------|----------|-----|
| Player | PostgreSQL | Relational, ACID guarantees |
| Game State | MongoDB | Flexible nested documents |
| Auth Sessions | Redis | Fast in-memory, TTL support |
| Analytics | ClickHouse | Time-series aggregations |

### Repository Pattern
- Repositories import clients from `databases/`
- Multiple repos can access the same database for different use cases
- Example: `player.repository.ts` (CRUD) and `player.analytics.repository.ts` (aggregations) both use PostgreSQL

## Data Flow Examples

**Game Save:**
1. Client auto-saves to IndexedDB (offline-first)
2. "Save to Cloud" → POST to backend
3. `gameState.service.ts` orchestrates:
   - Save to MongoDB
   - Invalidate Redis cache
   - Log event to ClickHouse

**Authentication:**
1. Login validates credentials (PostgreSQL)
2. Create session in Redis
3. Subsequent requests validate token via `auth.middleware.ts` (Redis)

## Tech Stack

**Backend:**
- Express/Fastify
- Prisma (PostgreSQL)
- Mongoose (MongoDB)
- ioredis (Redis)
- @clickhouse/client
- Zod (validation)

**Frontend:**
- Vite
- TypeScript
- Dexie.js (IndexedDB)
