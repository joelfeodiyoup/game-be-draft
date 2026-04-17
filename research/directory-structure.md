# Proposed Directory Structure

## Backend Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
│
├── prisma/                           # Prisma setup
│   ├── schema.prisma                 # PostgreSQL schema definition
│   ├── migrations/                   # Auto-generated migrations
│   └── seed.ts                       # Optional: seed data
│
├── src/
│   ├── server.ts                     # App entry point
│   │
│   ├── config/
│   │   ├── env.ts                    # Env validation (zod?)
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── mongoose.ts               # Mongoose connection
│   │   ├── redis.ts                  # Redis client + connection pooling
│   │   └── clickhouse.ts             # ClickHouse client
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── client.ts             # Export typed Prisma client
│   │   │   └── repositories/         # Repository pattern for PostgreSQL
│   │   │       ├── player.repository.ts
│   │   │       ├── session.repository.ts
│   │   │       └── achievement.repository.ts
│   │   │
│   │   ├── mongoose/
│   │   │   ├── schemas/              # Mongoose schemas
│   │   │   │   ├── gameState.schema.ts
│   │   │   │   └── playerInventory.schema.ts
│   │   │   └── repositories/         # Repository pattern for MongoDB
│   │   │       └── gameState.repository.ts
│   │   │
│   │   ├── redis/
│   │   │   ├── client.ts             # Redis connection wrapper
│   │   │   └── repositories/
│   │   │       ├── session.repository.ts
│   │   │       └── cache.repository.ts
│   │   │
│   │   └── clickhouse/
│   │       ├── client.ts             # ClickHouse connection
│   │       ├── schemas/              # Table definitions (as SQL or TS)
│   │       │   └── playerEvents.sql
│   │       └── repositories/
│   │           └── analytics.repository.ts
│   │
│   ├── models/                       # TypeScript types/interfaces
│   │   ├── player.types.ts           # Shared types across services
│   │   ├── gameState.types.ts
│   │   ├── session.types.ts
│   │   └── analytics.types.ts
│   │
│   ├── services/                     # Business logic layer
│   │   ├── player.service.ts         # Uses Prisma repo
│   │   ├── gameState.service.ts      # Uses Mongoose repo
│   │   ├── session.service.ts        # Uses Redis repo
│   │   ├── cache.service.ts          # Redis caching strategies
│   │   └── analytics.service.ts      # Uses ClickHouse repo
│   │
│   ├── routes/                       # API endpoints
│   │   ├── index.ts                  # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── player.routes.ts
│   │   ├── game.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # Session validation via Redis
│   │   ├── errorHandler.middleware.ts
│   │   └── requestLogger.middleware.ts
│   │
│   └── utils/
│       ├── errors.ts                 # Custom error classes
│       ├── logger.ts                 # Winston/Pino logger
│       └── validation.ts             # Zod schemas for API validation
│
└── scripts/
    ├── init-clickhouse.sql           # ClickHouse table creation
    └── seed-dev-data.ts              # Dev data seeding script
```

## Frontend Structure (with Dexie)

```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
└── src/
    ├── main.ts                       # Entry point
    │
    ├── db/                           # IndexedDB with Dexie
    │   ├── schema.ts                 # Dexie database schema
    │   ├── client.ts                 # Dexie instance singleton
    │   └── repositories/
    │       ├── localGameState.repository.ts
    │       └── offlineQueue.repository.ts  # Optional: sync queue
    │
    ├── api/
    │   ├── client.ts                 # Axios/fetch wrapper
    │   ├── auth.api.ts
    │   ├── player.api.ts
    │   ├── game.api.ts
    │   └── analytics.api.ts
    │
    ├── game/
    │   ├── gameLoop.ts               # Main game logic
    │   ├── renderer.ts               # Canvas/WebGL rendering
    │   ├── input.ts                  # Keyboard/mouse handling
    │   └── autoSave.ts               # Auto-save orchestrator
    │
    ├── services/
    │   ├── syncService.ts            # Sync IndexedDB ↔ Backend
    │   └── offlineService.ts         # Handle offline state
    │
    ├── types/
    │   └── game.types.ts             # Shared types with backend
    │
    └── utils/
        └── logger.ts
```

## Key Structural Decisions

### 1. Repository Pattern Per Database
Each database gets its own `repositories/` folder because:
- **Prisma repos** will have typed queries using the Prisma client
- **Mongoose repos** will use Mongoose models
- **Redis repos** will have raw ioredis commands
- **ClickHouse repos** will construct SQL queries

### 2. Separation of Concerns
```
Repository → Service → Route
```
- **Repositories**: Pure DB operations (CRUD)
- **Services**: Business logic (e.g., "save game state" might update MongoDB + invalidate Redis + log to ClickHouse)
- **Routes**: HTTP handling, validation, response formatting

### 3. Config vs Database Folders
- `config/`: Connection setup and client initialization
- `database/`: All DB-specific code (schemas, repos, migrations)

### 4. Error Handling Strategy
Create custom error classes in `utils/errors.ts`:
```typescript
class DatabaseError extends Error { ... }
class PrismaError extends DatabaseError { ... }
class MongooseError extends DatabaseError { ... }
class RedisError extends DatabaseError { ... }
class ClickHouseError extends DatabaseError { ... }
```

Then catch and transform in `middleware/errorHandler.middleware.ts`.

### 5. Type Sharing
Since Prisma generates types, you can:
- Export Prisma types from `database/prisma/client.ts`
- Create custom types in `models/` that compose or extend generated types
- Share these types between services

## Data Flow Philosophy

**Write Path:**
1. Player plays game → Local auto-save to IndexedDB (every few seconds)
2. Player hits "Save to Cloud" → POST to backend
3. Backend saves:
   - Game state → MongoDB (flexible, denormalized)
   - Update session timestamp → PostgreSQL
   - Clear cache → Redis (invalidate)
   - Log analytics event → ClickHouse

**Read Path:**
1. Player logs in → Create session in Redis
2. Check Redis cache for recent game state
3. If miss: fetch from MongoDB, cache in Redis (TTL: 5-10 min)
4. Analytics dashboard hits separate endpoint → Query ClickHouse aggregates

## API Endpoints Example

```
POST   /api/auth/login           → Create Redis session
POST   /api/auth/logout          → Delete Redis session

GET    /api/player/:id           → PostgreSQL (profile, stats)
PATCH  /api/player/:id           → PostgreSQL (update achievements)

GET    /api/game/state/:playerId → MongoDB (with Redis cache)
POST   /api/game/state           → MongoDB + invalidate Redis
POST   /api/game/autosave        → MongoDB only (frequent, uncached)

GET    /api/analytics/leaderboard     → ClickHouse (aggregated)
GET    /api/analytics/player/:id/history → ClickHouse (time series)
```

## Tech Stack

**Backend:**
- **Framework**: Express (simple) or Fastify (fast + good TypeScript support)
- **PostgreSQL client**: Prisma
- **MongoDB client**: Mongoose
- **Redis client**: ioredis
- **ClickHouse client**: @clickhouse/client

**Frontend:**
- **Build tool**: Vite
- **Framework**: Vanilla TS or React/Vue
- **IndexedDB**: Dexie.js

## Architecture Trade-offs

**Pros:**
- Clear separation by database type
- Easy to find Prisma migrations vs Mongoose schemas
- Repository pattern makes testing easier (mock the repo, not the ORM)
- Services can orchestrate multiple databases cleanly

**Cons:**
- More boilerplate upfront
- Might feel heavy for a small demo (but showcases architectural skills)

**Alternative (Simpler):**
If less nesting is preferred, flatten repositories:
```
src/
├── repositories/
│   ├── player.repository.ts          # (Prisma)
│   ├── gameState.repository.ts       # (Mongoose)
│   ├── session.repository.ts         # (Redis)
│   └── analytics.repository.ts       # (ClickHouse)
```

But this loses the clear "database territory" boundaries.
