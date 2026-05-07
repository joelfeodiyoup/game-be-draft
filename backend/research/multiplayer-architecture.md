# Multiplayer Game Architecture - Design Notes

## Overview

Design for adding a real-time multiplayer game server microservice to demonstrate:
- Microservices architecture
- Event-driven patterns
- gRPC for service-to-service communication
- WebSocket for real-time client communication
- Appropriate scaling strategies

## Core Concept

**Cooperative multiplayer 2D isometric strategy game** (city builder / factory builder / settlement management)

### Why Cooperative?
- Simpler conflict resolution (no hiding information, no fog of war)
- More forgiving latency
- Unique compared to competitive games
- Better for demos (collaborative is engaging)

## Architecture Pattern: Deterministic Lockstep

### The Key Insight

For large maps with many units, don't sync state—sync **commands**.

```
Initial State (T=0):
  Map: 100x100 tiles, 1000 units, buildings
  Size: ~2-5 MB (one-time download)

During Gameplay (T=1...N):
  Only send player commands:
    - "Player 1: Move unit X to (50,30)" - 20 bytes
    - "Player 2: Build barracks at (10,15)" - 25 bytes
  Size: ~100 bytes per command
```

**How it works:**
1. All clients download the same initial state
2. Game logic is deterministic (same inputs → same outputs)
3. Only player commands are sent over network
4. Each client runs the same simulation with the same commands
5. Everyone sees the same state

**Bandwidth comparison:**
- Traditional state sync: 10 updates/sec × 5KB = 50KB/sec = 400 Kbps
- Command sync: 5 commands/sec × 50 bytes = 250 bytes/sec = 2 Kbps

### Benefits
- ✅ Supports massive maps
- ✅ Supports thousands of units
- ✅ Minimal bandwidth
- ✅ Classic RTS architecture (Age of Empires, StarCraft)

## System Architecture

```
┌─────────────┐
│   Browser   │
│   Client    │
└─────────────┘
       │
       │ WebSocket (real-time game commands)
       │ HTTP REST (game catalog, auth, ratings)
       │
       ▼
┌──────────────────────────────────────┐
│      Game Server Microservice        │
│  - Handles WebSocket connections     │
│  - In-memory authoritative state     │
│  - Validates & processes commands    │
│  - Broadcasts commands to all        │
│  - Runs deterministic simulation     │
└──────────────────────────────────────┘
       │               │
       │               │ gRPC (sync, internal)
       │               │ - ValidatePlayerSession
       │               │ - GetGame
       │               │ - CreateGameSession
       │               ▼
       │        ┌─────────────────┐
       │        │  Core Service   │
       │        │  (Existing)     │
       │        │  - Players      │
       │        │  - Games        │
       │        │  - Auth         │
       │        │  - Ratings      │
       │        └─────────────────┘
       │
       │ Events (async, fire-and-forget)
       │ - game.started
       │ - game.command.executed
       │ - game.snapshot
       │ - game.ended
       ▼
┌──────────────────┐
│  Message Queue   │
│  (RabbitMQ/      │
│   Redis Pub/Sub) │
└──────────────────┘
       │
       └──► Core Service (saves to DB)
       └──► Analytics Service (optional)
```

## Communication Patterns

### When to Use What

| Pattern | Protocol | Use Case | Example |
|---------|----------|----------|---------|
| Client ↔ Game Server | **WebSocket** | Real-time game commands | Move unit, build structure |
| Client ↔ Core Service | **HTTP REST** | Standard CRUD | Game catalog, auth, ratings |
| Game Server → Core Service | **gRPC** | Fast sync calls needing response | Validate session, get game info |
| Game Server → Services | **Events** | Async notifications | Save snapshot, analytics |

### WebSocket (Client Communication)

**Why:** Lowest latency for real-time gameplay

```javascript
// Client → Game Server
socket.emit('joinGame', { gameId: 'abc123', token: 'jwt_token' });
socket.emit('executeCommand', {
  type: 'MOVE_UNIT',
  unitId: 'unit5',
  destination: {x: 50, y: 30}
});

// Game Server → All Clients in room
io.to(gameId).emit('commandBroadcast', {
  playerId: 'player1',
  command: { type: 'MOVE_UNIT', ... },
  tick: 1234
});
```

### gRPC (Service-to-Service Sync)

**Why:** Fast, type-safe, when you need immediate response

```protobuf
// core-service.proto
service CoreService {
  // Authentication
  rpc ValidatePlayerSession(SessionRequest) returns (PlayerInfo);

  // Game data
  rpc GetGame(GameRequest) returns (GameInfo);
  rpc GetScenarioData(ScenarioRequest) returns (ScenarioData);

  // Lifecycle
  rpc CreateGameSession(CreateSessionRequest) returns (GameSession);
  rpc UpdateGameSession(UpdateSessionRequest) returns (GameSession);
}
```

```typescript
// Game Server uses gRPC
const player = await coreServiceClient.ValidatePlayerSession({
  player_id: 'player123',
  session_token: 'jwt_token'
});

if (!player.is_valid) {
  socket.emit('error', { message: 'Invalid session' });
  return;
}
```

### Events (Async Notifications)

**Why:** Decouple services, fire-and-forget, multiple subscribers

```typescript
// Game Server publishes events
eventBus.publish('game.started', {
  sessionId: 'session123',
  gameId: 'abc123',
  playerIds: ['player1', 'player2'],
  timestamp: '2026-05-07T...'
});

eventBus.publish('game.snapshot', {
  gameId: 'abc123',
  tick: 5000,
  state: serializeGameState(),
  timestamp: '2026-05-07T...'
});

eventBus.publish('game.ended', {
  sessionId: 'session123',
  duration: 3600,
  outcome: 'completed',
  stats: { ... }
});

// Core Service subscribes
eventBus.subscribe('game.snapshot', async (event) => {
  await mongoDb.collection('game_snapshots').insertOne({
    gameId: event.gameId,
    tick: event.tick,
    state: event.state,
    timestamp: event.timestamp
  });
});

eventBus.subscribe('game.ended', async (event) => {
  await prisma.gameSession.update({
    where: { id: event.sessionId },
    data: {
      end_time: new Date(),
      duration_seconds: event.duration
    }
  });
});
```

## Events vs gRPC Decision Matrix

| Scenario | Use Events | Use gRPC | Reason |
|----------|-----------|----------|---------|
| Save game snapshot | ✅ | ❌ | Async, fire-and-forget, don't block game |
| Validate player on join | ❌ | ✅ | Need immediate response to allow/deny |
| Log player action | ✅ | ❌ | Analytics, don't block game |
| Get player profile | ❌ | ✅ | Need data returned |
| Update player stats | ✅ | ❌ | Can be eventually consistent |
| Check if player is banned | ❌ | ✅ | Need answer before allowing join |
| Periodic game state backup | ✅ | ❌ | No rush, async is fine |
| Load game metadata | ❌ | ✅ | Need data to initialize game |

## Implementation Structure

```
backend/
├── src/
│   ├── game-server/              # NEW MICROSERVICE
│   │   ├── index.ts              # WebSocket server entry
│   │   ├── server.ts             # Socket.io setup
│   │   ├── GameRoom.ts           # In-memory game state
│   │   ├── CommandProcessor.ts   # Validate & execute commands
│   │   ├── EventPublisher.ts     # Publish to event bus
│   │   ├── grpc/
│   │   │   └── clients/
│   │   │       └── core-service.client.ts
│   │   └── game-logic/           # Deterministic simulation
│   │       ├── GameState.ts
│   │       ├── units.ts
│   │       ├── buildings.ts
│   │       ├── map.ts
│   │       └── tick.ts           # Game loop
│   │
│   ├── domains/                  # EXISTING SERVICE (Core)
│   │   └── games/
│   │       ├── game-session.orchestrator.ts  # Subscribe to events
│   │       └── game-session.repository.ts
│   │
│   ├── grpc/                     # SHARED
│   │   ├── proto/
│   │   │   └── core-service.proto
│   │   └── server/
│   │       └── core-service.server.ts
│   │
│   └── event-bus/                # NEW
│       ├── publisher.ts
│       ├── subscriber.ts
│       └── types.ts
│
├── docker-compose.yml            # Add RabbitMQ/Redis
└── package.json
```

## Game Server Flow Example

### Player Joins Game

```
1. Client → Game Server (WebSocket):
   socket.emit('joinGame', { gameId: 'abc123', token: 'jwt_token' })

2. Game Server → Core Service (gRPC):
   player = ValidatePlayerSession({ token })
   gameInfo = GetGame({ game_id: 'abc123' })
   session = CreateGameSession({ game_id, player_id })

3. Game Server (in-memory):
   gameRoom = activeGames.get(gameId) || createNewGameRoom(gameId)
   gameRoom.addPlayer(player)

4. Game Server → Client (WebSocket):
   socket.emit('gameJoined', {
     sessionId,
     initialState: gameRoom.getState(),
     otherPlayers: gameRoom.getPlayers()
   })

5. Game Server → Event Bus (async):
   publish('game.player.joined', { gameId, playerId, sessionId })
```

### Player Executes Command

```
1. Client → Game Server (WebSocket):
   socket.emit('command', {
     type: 'BUILD_STRUCTURE',
     structureType: 'HOUSE',
     position: {x: 25, y: 30}
   })

2. Game Server (validate):
   - Check player has resources
   - Check position is valid
   - Check no collision

3. Game Server (execute):
   gameRoom.executeCommand(playerId, command)
   gameRoom.tick++

4. Game Server → All Clients (WebSocket broadcast):
   io.to(gameId).emit('commandBroadcast', {
     playerId,
     command,
     tick: gameRoom.tick
   })

5. Game Server → Event Bus (async, every N commands):
   publish('game.snapshot', { gameId, state, tick })
```

## Database Usage

### Postgres (via Prisma)
- Player accounts
- Game metadata
- GameSession records (start time, end time, duration)
- Ratings, auth sessions

### MongoDB (via Mongoose)
- Game state snapshots (periodic saves)
- Full game replay data (optional)
- Scenario definitions

### Redis
- Active game rooms list
- Player session cache
- Pub/sub for event bus (alternative to RabbitMQ)

## Scaling Considerations

### Core Service (Stateless)
- Horizontal scaling: Just add more instances
- Load balancer in front
- Database is the bottleneck

### Game Server (Stateful)
- Each instance holds N game rooms in memory
- Sticky sessions: Players in same game must connect to same instance
- Scale by adding instances, distribute rooms
- Redis pub/sub for cross-instance communication (if needed)

Example:
```
┌─────────────┐
│ Load Balancer│  (with sticky sessions based on gameId)
└─────────────┘
       │
   ────┼────────────────
   │   │               │
   ▼   ▼               ▼
┌────┐ ┌────┐      ┌────┐
│GS1 │ │GS2 │ ...  │GSN │  (Game Server instances)
└────┘ └────┘      └────┘
  │      │            │
  └──────┴────────────┘
           │
           ▼
      ┌────────┐
      │ Redis  │  (Pub/Sub for cross-instance events)
      └────────┘
```

## Optional: Additional Services

### Matchmaking Service
**Purpose:** Queue players, create game rooms

**Tech:**
- Redis for queue (sorted set with timestamps)
- gRPC interface for Game Server to request room creation

**Benefits:**
- Separate scaling (can be bursty)
- Demonstrates service orchestration
- Natural event producer: `match.found`, `room.created`

### Telemetry/Analytics Service
**Purpose:** Aggregate game metrics, player stats

**Tech:**
- ClickHouse or TimescaleDB (time-series data)
- Subscribes to ALL game events
- Read-only queries for dashboards

**Benefits:**
- Shows observability patterns
- Different data access patterns (write-heavy, analytical)
- Demonstrates polyglot persistence

## Why This Architecture Is Strong

### For Interviews

✅ **Two well-separated services with clear rationale:**
- Game Server: Stateful, memory-intensive, real-time, independently scalable
- Core Service: Stateless, database-backed, CRUD operations

✅ **Multiple communication patterns with clear use cases:**
- WebSocket: Client real-time (low latency)
- gRPC: Service-to-service sync (type-safe, fast)
- Events: Service-to-service async (decoupling)

✅ **Realistic technical challenges:**
- Real-time multiplayer synchronization
- Deterministic simulation
- In-memory state management
- Appropriate scaling strategies

✅ **Shows good judgment:**
- Not over-engineering with 5+ services
- Clear bounded contexts
- Pragmatic technology choices

### What You Can Say

> "I designed this as two microservices because they have fundamentally different characteristics. The game server is stateful and requires WebSocket connections for low-latency real-time gameplay, while the core service is stateless and handles traditional CRUD operations.
>
> For communication, I use WebSockets for client-to-server real-time commands, gRPC for synchronous service-to-service calls where I need immediate responses—like validating player sessions—and event-driven architecture for asynchronous operations like persisting game snapshots and analytics.
>
> The game uses a deterministic lockstep model, similar to classic RTS games, where we only synchronize player commands rather than full game state. This allows us to support large maps and many units with minimal bandwidth.
>
> I chose cooperative multiplayer because it's more forgiving of latency and demonstrates that I can make pragmatic scoping decisions for a demo project."

## Next Steps

1. **Minimal viable architecture:**
   - Set up Game Server microservice with Socket.io
   - Implement basic in-memory GameRoom
   - Add simple command processing (move, build)
   - Event publishing to save snapshots

2. **Add gRPC:**
   - Define `.proto` files
   - Core Service gRPC server
   - Game Server gRPC client
   - Implement ValidatePlayerSession, GetGame, CreateGameSession

3. **Event-driven:**
   - Set up RabbitMQ or Redis pub/sub
   - Publisher in Game Server
   - Subscriber in Core Service
   - Persist snapshots to MongoDB

4. **Frontend integration:**
   - WebSocket client connection
   - Render game state
   - Send commands
   - Handle command broadcasts

5. **Polish:**
   - Proper error handling
   - Reconnection logic
   - Game state reconciliation
   - Documentation

## References

- Classic RTS networking: Deterministic lockstep
- gRPC: https://grpc.io/
- Socket.io: https://socket.io/
- RabbitMQ: https://www.rabbitmq.com/
- Redis Pub/Sub: https://redis.io/docs/manual/pubsub/

## Questions to Revisit

- **Message queue choice:** RabbitMQ (full-featured) vs Redis Pub/Sub (simpler)?
- **Game tick rate:** 10 ticks/sec? 20? Based on game complexity
- **Snapshot frequency:** Every 30s? Every 100 commands?
- **gRPC vs REST for Core Service public API:** Keep REST for external, gRPC for internal?
- **Authentication flow:** JWT validation in Game Server or always delegate to Core Service?
