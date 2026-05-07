# Game Platform Architecture - User-Generated Content Platform

## Vision

Transform the demo project from a simple multiplayer game into a **platform** where developers can create and publish their own games. The platform provides all the infrastructure (multiplayer, persistence, authentication, hosting) and developers just implement game logic.

Think: **Roblox meets GitHub Actions** - a game platform with CI/CD integration.

## Core Concept

Developers implement a standard interface (`GameDefinition`), push to their GitHub repo, and the platform:
1. Automatically pulls their code
2. Runs contract tests to ensure compliance
3. Deploys the game to the platform
4. Makes it available to all players

The platform handles:
- ✅ Multiplayer infrastructure
- ✅ Real-time synchronization
- ✅ Persistence (save games)
- ✅ Authentication
- ✅ Hosting
- ✅ CI/CD
- ✅ Testing

Developers just write:
- ✅ Game logic (deterministic state transitions)
- ✅ Rendering (how to display the game)
- ✅ Commands (what actions players can take)

## Why This Is Exceptional

This isn't just a microservices demo - it's a **platform engineering** project that demonstrates:

### DevOps/CI-CD:
- GitHub API integration
- Automated testing pipelines
- Webhook handling
- Build artifact management
- Deployment automation
- Error reporting

### Software Architecture:
- Plugin architecture
- Interface-driven development
- Contract testing
- Monorepo shared code (client + server)
- Dynamic module loading
- Multi-tenancy

### Microservices:
- Game Server (stateful, real-time)
- Core Service (stateless, CRUD)
- Deployment Service (CI/CD)
- ML Service (optional)
- Event-driven communication

### Security:
- Token management (encrypted storage)
- Code sandboxing
- Webhook signature verification
- Input validation

## The Game Interface Contract

Every game must implement this interface. The same code runs on both client and server to ensure deterministic state synchronization.

```typescript
// @platform/game-sdk/src/GameInterface.ts

export interface GameCommand {
  type: string;          // e.g., "MOVE_UNIT", "BUILD_STRUCTURE"
  playerId: string;      // Who issued the command
  data: unknown;         // Command-specific data
  tick: number;          // Game tick when command was issued
}

export interface GameState {
  tick: number;          // Current game tick
  players: Map<string, PlayerState>;
  // Game-specific state below - completely flexible
  [key: string]: unknown;
}

export interface PlayerState {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: number;
}

export interface GameDefinition {
  // ===== Metadata =====
  id: string;                    // Unique game ID (e.g., "city-builder")
  name: string;                  // Display name
  version: string;               // Semantic version
  minPlayers: number;
  maxPlayers: number;
  description?: string;
  author?: string;
  thumbnail?: string;

  // ===== Core Interface (MUST implement) =====

  /**
   * Create the initial game state
   * Called when a new game starts
   */
  createInitialState(config: GameConfig): GameState;

  /**
   * Process a player command
   * MUST be deterministic: same state + same command = same result
   * This runs on BOTH client and server
   */
  processCommand(state: GameState, command: GameCommand): GameState;

  /**
   * Validate if a command is legal in the current state
   * Called before processCommand
   */
  validateCommand(state: GameState, command: GameCommand): ValidationResult;

  /**
   * Serialize state for persistence
   */
  serializeState(state: GameState): SerializedState;

  /**
   * Deserialize state from persistence
   */
  deserializeState(data: SerializedState): GameState;

  /**
   * Check if game is over
   */
  isGameOver(state: GameState): GameOverResult;

  /**
   * Optional: Game tick logic (runs every tick even without commands)
   * Use for passive updates (resource generation, AI, etc.)
   */
  onTick?(state: GameState, tick: number): GameState;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface GameOverResult {
  isOver: boolean;
  winner?: string;
  reason?: string;
}

export interface GameConfig {
  mapSize?: { width: number; height: number };
  difficulty?: 'easy' | 'medium' | 'hard';
  seed?: number; // For procedural generation
  [key: string]: unknown;
}

export type SerializedState = string;
```

## Starter Template Repository

Developers clone this template and implement the interface:

```
game-template-repo/                   (Provided by platform)
├── .github/
│   └── workflows/
│       ├── test.yml                  (Runs on every push)
│       └── deploy.yml                (Optional: manual deploy)
│
├── src/
│   ├── game.ts                       (MAIN: Implements GameDefinition)
│   ├── types.ts                      (Game-specific types)
│   ├── commands/
│   │   ├── index.ts                  (Export all command handlers)
│   │   ├── build.ts                  (Example: BUILD_STRUCTURE command)
│   │   └── move.ts                   (Example: MOVE_UNIT command)
│   ├── state/
│   │   ├── initial.ts                (Initial state creation)
│   │   └── validation.ts             (Validation logic)
│   └── rendering/                    (Client-side only)
│       ├── GameRenderer.tsx          (React component to render game)
│       ├── components/
│       │   ├── Map.tsx
│       │   ├── Unit.tsx
│       │   └── UI.tsx
│       └── styles/
│           └── game.module.css
│
├── tests/
│   ├── contract.test.ts              (Tests interface compliance)
│   ├── determinism.test.ts           (Tests deterministic behavior)
│   ├── commands.test.ts              (Test individual commands)
│   └── game.test.ts                  (Integration tests)
│
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md                          (Instructions for developers)
```

### Example Implementation: City Builder

```typescript
// my-city-builder/src/game.ts
import { GameDefinition, GameState, GameCommand } from '@platform/game-sdk';

interface Building {
  id: string;
  type: 'HOUSE' | 'FARM' | 'FACTORY';
  position: { x: number; y: number };
  ownerId: string;
  builtAt: number;
}

interface CityState extends GameState {
  buildings: Building[];
  resources: {
    wood: number;
    stone: number;
    food: number;
  };
  population: number;
  tick: number;
}

export const CityBuilderGame: GameDefinition = {
  // Metadata
  id: 'city-builder-demo',
  name: 'Cooperative City Builder',
  version: '1.0.0',
  minPlayers: 1,
  maxPlayers: 4,
  description: 'Build a thriving city together',
  author: 'YourName',

  // Core interface implementation

  createInitialState(config): CityState {
    return {
      tick: 0,
      players: new Map(),
      buildings: [],
      resources: {
        wood: 100,
        stone: 50,
        food: 20
      },
      population: 10
    };
  },

  processCommand(state: CityState, command: GameCommand): CityState {
    // CRITICAL: This MUST be deterministic
    // No randomness, no Date.now(), no external state

    switch (command.type) {
      case 'BUILD_STRUCTURE': {
        const { type, position } = command.data as {
          type: Building['type'];
          position: { x: number; y: number };
        };

        // Deduct resources
        const costs = { HOUSE: 50, FARM: 30, FACTORY: 100 };

        return {
          ...state,
          buildings: [
            ...state.buildings,
            {
              id: `${command.playerId}-${state.tick}`,
              type,
              position,
              ownerId: command.playerId,
              builtAt: state.tick
            }
          ],
          resources: {
            ...state.resources,
            wood: state.resources.wood - costs[type]
          },
          tick: state.tick + 1
        };
      }

      case 'DEMOLISH_STRUCTURE': {
        const { buildingId } = command.data as { buildingId: string };

        return {
          ...state,
          buildings: state.buildings.filter(b => b.id !== buildingId),
          tick: state.tick + 1
        };
      }

      default:
        return state;
    }
  },

  validateCommand(state: CityState, command: GameCommand): ValidationResult {
    if (command.type === 'BUILD_STRUCTURE') {
      const { type, position } = command.data as any;

      // Check resources
      const costs = { HOUSE: 50, FARM: 30, FACTORY: 100 };
      if (state.resources.wood < costs[type]) {
        return { valid: false, error: 'Not enough wood' };
      }

      // Check position not occupied
      const occupied = state.buildings.some(
        b => b.position.x === position.x && b.position.y === position.y
      );
      if (occupied) {
        return { valid: false, error: 'Position occupied' };
      }

      return { valid: true };
    }

    return { valid: false, error: 'Unknown command type' };
  },

  serializeState(state: CityState): string {
    return JSON.stringify(state);
  },

  deserializeState(data: string): CityState {
    return JSON.parse(data);
  },

  isGameOver(state: CityState) {
    // Win condition: 1000 population
    if (state.population >= 1000) {
      return { isOver: true, reason: 'Victory! Population reached 1000' };
    }

    // Lose condition: no resources and no buildings
    if (state.resources.wood === 0 && state.buildings.length === 0) {
      return { isOver: true, reason: 'Defeat! City abandoned' };
    }

    return { isOver: false };
  },

  // Optional: Passive updates every tick
  onTick(state: CityState, tick: number): CityState {
    // Generate resources based on buildings
    const farms = state.buildings.filter(b => b.type === 'FARM').length;
    const factories = state.buildings.filter(b => b.type === 'FACTORY').length;

    return {
      ...state,
      resources: {
        ...state.resources,
        food: state.resources.food + (farms * 2),
        wood: state.resources.wood + (factories * 1)
      },
      population: state.population + Math.floor(farms * 0.5),
      tick
    };
  }
};

export default CityBuilderGame;
```

### Client-Side Rendering

```typescript
// my-city-builder/src/rendering/GameRenderer.tsx
import React from 'react';
import { CityState } from '../game';

interface GameRendererProps {
  state: CityState;
  onCommand: (command: any) => void;
}

export const GameRenderer: React.FC<GameRendererProps> = ({ state, onCommand }) => {
  const handleBuild = (type: string, x: number, y: number) => {
    onCommand({
      type: 'BUILD_STRUCTURE',
      data: { type, position: { x, y } }
    });
  };

  return (
    <div className="city-game">
      <div className="resources">
        <div>Wood: {state.resources.wood}</div>
        <div>Stone: {state.resources.stone}</div>
        <div>Food: {state.resources.food}</div>
        <div>Population: {state.population}</div>
      </div>

      <div className="map">
        {state.buildings.map(building => (
          <div
            key={building.id}
            className={`building ${building.type}`}
            style={{
              left: building.position.x * 32,
              top: building.position.y * 32
            }}
          >
            {building.type}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={() => handleBuild('HOUSE', 5, 5)}>
          Build House (50 wood)
        </button>
        <button onClick={() => handleBuild('FARM', 10, 5)}>
          Build Farm (30 wood)
        </button>
      </div>
    </div>
  );
};
```

## GitHub Integration Flow

```
┌─────────────────────────────────────────────────────────┐
│  Developer Workflow                                     │
└─────────────────────────────────────────────────────────┘
  1. Clone template repo
  2. Implement GameDefinition interface
  3. Write game logic (commands, state, rendering)
  4. Run tests locally: npm test
  5. Push to their GitHub repo
  6. Go to platform website
  7. Register game with:
     - GitHub repo URL
     - Personal access token
     - Branch name (default: main)

┌─────────────────────────────────────────────────────────┐
│  Platform Automation                                    │
└─────────────────────────────────────────────────────────┘

  Step 1: Validation
  ├─ Platform receives registration
  ├─ Uses GitHub API to verify:
  │  ├─ Repo exists and is accessible
  │  ├─ Required files present (package.json, src/game.ts)
  │  └─ Token has correct permissions
  └─ Sets up webhook for push events

  Step 2: Initial Build
  ├─ Clone repo to temp directory
  ├─ Install dependencies: npm install
  ├─ Run contract tests: npm run test:contract
  ├─ Run determinism tests: npm run test:determinism
  ├─ Run game-specific tests: npm test
  └─ Build: npm run build

  Step 3: Validation Tests
  ├─ Import built module
  ├─ Verify GameDefinition interface is properly implemented
  ├─ Run determinism verification:
  │  └─ Same command on same state produces same result 100x
  ├─ Run serialization test:
  │  └─ State → serialize → deserialize → equals original
  └─ Validate metadata (id, version, name, etc.)

  Step 4: Deployment (if tests pass)
  ├─ Generate unique build ID
  ├─ Copy build artifacts to deployment directory
  ├─ Register in game catalog database
  ├─ Make available to players
  ├─ Publish event: 'game.deployed'
  └─ Notify developer of success

  Step 5: Failure Handling (if tests fail)
  ├─ Store error logs in database
  ├─ Notify developer via email/webhook
  └─ Provide detailed error report with:
     ├─ Which test failed
     ├─ Error messages
     ├─ Stack traces
     └─ Suggestions for fixes

  Step 6: Continuous Deployment
  ├─ GitHub webhook fires on push
  ├─ Platform receives webhook event
  ├─ Verify webhook signature
  ├─ Trigger build pipeline again (Steps 2-5)
  └─ Auto-deploy new version if tests pass
```

## Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Browse games catalog                                     │
│  - Join/create game rooms                                   │
│  - Play games (loads game-specific renderer)                │
│  - Developer dashboard (register games, view builds)        │
└─────────────────────────────────────────────────────────────┘
           │                        │                 │
           │ HTTP REST              │ WebSocket       │ HTTP REST
           ▼                        ▼                 ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Core Service    │    │  Game Server     │    │ Deployment   │
│                  │    │  Service         │    │ Service      │
│ - Games catalog  │    │ - WebSocket      │    │ - GitHub API │
│ - User auth      │    │ - Game rooms     │    │ - CI/CD      │
│ - Ratings        │    │ - Load games     │    │ - Testing    │
│ - Sessions       │    │ - State sync     │    │ - Artifact   │
└──────────────────┘    └──────────────────┘    │   mgmt       │
           │                        │            └──────────────┘
           │                        │                    │
           │        gRPC            │                    │
           │◄───────────────────────┤                    │
           │                        │                    │
           │                        │                    │
           └────────────────────────┴────────────────────┘
                              │
                              │ Events
                              ▼
                     ┌─────────────────┐
                     │   Event Bus     │
                     │ (RabbitMQ/Redis)│
                     └─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────┐    ┌──────────┐    ┌──────────┐
      │ Core     │    │ ML       │    │ Analytics│
      │ Service  │    │ Service  │    │ Service  │
      │(saves DB)│    │(optional)│    │(optional)│
      └──────────┘    └──────────┘    └──────────┘
```

## Shared Code Architecture

One of the key innovations: the **same game logic code** runs on both client and server.

```
┌─────────────────────────────────────────────────────────┐
│              Monorepo Structure                         │
└─────────────────────────────────────────────────────────┘

game-platform/
├── packages/
│   ├── game-sdk/                    # Shared interfaces
│   │   ├── src/
│   │   │   ├── GameInterface.ts     # Core interface
│   │   │   ├── types.ts             # Shared types
│   │   │   └── utils.ts             # Shared utilities
│   │   └── tests/
│   │       ├── contract-tests.ts    # Reusable tests
│   │       └── determinism-tests.ts
│   │
│   ├── game-client/                 # Client runtime
│   │   ├── src/
│   │   │   ├── GameClient.tsx       # React wrapper
│   │   │   ├── GameLoader.ts        # Load game modules
│   │   │   └── WebSocketClient.ts   # Comm with server
│   │   └── package.json
│   │
│   └── game-server/                 # Server runtime
│       ├── src/
│       │   ├── GameRoom.ts          # In-memory game state
│       │   ├── GameLoader.ts        # Load game modules
│       │   └── CommandProcessor.ts  # Process commands
│       └── package.json
│
├── games/                           # Deployed games
│   ├── city-builder/
│   │   ├── v1.0.0/
│   │   │   └── game.js              # Built artifact
│   │   └── v1.0.1/
│   │       └── game.js
│   └── tower-defense/
│       └── v1.0.0/
│           └── game.js
│
└── services/
    ├── core-service/                # Main backend
    ├── game-server/                 # Multiplayer service
    └── deployment-service/          # CI/CD service
```

## Implementation: Game Loading & Execution

### Server-Side Game Room

```typescript
// game-server/src/GameRoom.ts
import { GameDefinition, GameState, GameCommand } from '@platform/game-sdk';

export class GameRoom {
  private state: GameState;
  private gameDef: GameDefinition;
  private players: Set<string>;
  private commandHistory: GameCommand[] = [];

  constructor(
    public readonly roomId: string,
    public readonly gameId: string,
    gameDef: GameDefinition
  ) {
    this.gameDef = gameDef;
    this.state = gameDef.createInitialState({});
    this.players = new Set();
  }

  addPlayer(playerId: string) {
    this.players.add(playerId);
    // Could update state to reflect new player
  }

  async executeCommand(command: GameCommand): Promise<GameState> {
    // 1. Validate
    const validation = this.gameDef.validateCommand(this.state, command);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Execute (deterministic)
    this.state = this.gameDef.processCommand(this.state, command);

    // 3. Store in history (for reconnections/replays)
    this.commandHistory.push(command);

    // 4. Check if game over
    const gameOver = this.gameDef.isGameOver(this.state);
    if (gameOver.isOver) {
      await this.handleGameOver(gameOver);
    }

    return this.state;
  }

  tick() {
    // Optional: Run passive updates
    if (this.gameDef.onTick) {
      this.state = this.gameDef.onTick(this.state, this.state.tick);
    }
  }

  getState(): GameState {
    return this.state;
  }

  serialize(): string {
    return this.gameDef.serializeState(this.state);
  }

  private async handleGameOver(result: GameOverResult) {
    // Publish event
    eventBus.publish('game.ended', {
      roomId: this.roomId,
      gameId: this.gameId,
      winner: result.winner,
      reason: result.reason,
      finalState: this.serialize(),
      commandCount: this.commandHistory.length
    });
  }
}
```

### Dynamic Game Loader

```typescript
// game-server/src/GameLoader.ts
import path from 'path';

export class GameLoader {
  private loadedGames = new Map<string, GameDefinition>();
  private GAMES_DIR = path.join(__dirname, '../../games');

  async loadGame(gameId: string, version?: string): Promise<GameDefinition> {
    const cacheKey = `${gameId}@${version || 'latest'}`;

    // Check cache
    if (this.loadedGames.has(cacheKey)) {
      return this.loadedGames.get(cacheKey)!;
    }

    // Get active version from registry
    const gameInfo = version
      ? await gameRegistry.getVersion(gameId, version)
      : await gameRegistry.getLatest(gameId);

    if (!gameInfo) {
      throw new Error(`Game ${gameId} not found`);
    }

    // Load module
    const modulePath = path.join(
      this.GAMES_DIR,
      gameId,
      gameInfo.version,
      'game.js'
    );

    const gameModule = await import(modulePath);
    const gameDef: GameDefinition = gameModule.default;

    // Runtime validation
    this.validateGameDefinition(gameDef);

    // Cache
    this.loadedGames.set(cacheKey, gameDef);

    return gameDef;
  }

  private validateGameDefinition(game: GameDefinition) {
    const required = [
      'id', 'name', 'version', 'minPlayers', 'maxPlayers',
      'createInitialState', 'processCommand', 'validateCommand',
      'serializeState', 'deserializeState', 'isGameOver'
    ];

    for (const prop of required) {
      if (!(prop in game)) {
        throw new Error(`Game missing required property: ${prop}`);
      }
    }
  }

  clearCache() {
    this.loadedGames.clear();
  }
}
```

### WebSocket Game Server

```typescript
// game-server/src/server.ts
import { Server } from 'socket.io';
import { GameLoader } from './GameLoader';
import { GameRoom } from './GameRoom';

const gameLoader = new GameLoader();
const activeRooms = new Map<string, GameRoom>();

io.on('connection', (socket) => {
  let currentRoom: GameRoom | null = null;

  socket.on('createGame', async ({ gameId, config }) => {
    try {
      // Load game definition
      const gameDef = await gameLoader.loadGame(gameId);

      // Create room
      const roomId = generateRoomId();
      const room = new GameRoom(roomId, gameId, gameDef);
      activeRooms.set(roomId, room);

      // Add player
      room.addPlayer(socket.data.playerId);
      currentRoom = room;

      // Join socket.io room
      socket.join(roomId);

      // Send initial state
      socket.emit('gameCreated', {
        roomId,
        state: room.getState()
      });

      // Publish event
      eventBus.publish('game.created', {
        roomId,
        gameId,
        playerId: socket.data.playerId
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('joinGame', async ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    room.addPlayer(socket.data.playerId);
    currentRoom = room;
    socket.join(roomId);

    socket.emit('gameJoined', {
      state: room.getState()
    });

    io.to(roomId).emit('playerJoined', {
      playerId: socket.data.playerId
    });
  });

  socket.on('executeCommand', async ({ command }) => {
    if (!currentRoom) {
      socket.emit('error', { message: 'Not in a game' });
      return;
    }

    try {
      // Add metadata
      const fullCommand = {
        ...command,
        playerId: socket.data.playerId,
        tick: currentRoom.getState().tick
      };

      // Execute
      const newState = await currentRoom.executeCommand(fullCommand);

      // Broadcast to all players in room
      io.to(currentRoom.roomId).emit('commandExecuted', {
        command: fullCommand,
        state: newState
      });

      // Publish event (for persistence, analytics, etc.)
      eventBus.publish('game.command.executed', {
        roomId: currentRoom.roomId,
        gameId: currentRoom.gameId,
        command: fullCommand
      });

    } catch (error) {
      socket.emit('commandFailed', {
        error: error.message,
        command
      });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      io.to(currentRoom.roomId).emit('playerLeft', {
        playerId: socket.data.playerId
      });
    }
  });
});

// Game tick loop (optional, for games with passive updates)
setInterval(() => {
  for (const room of activeRooms.values()) {
    room.tick();
    io.to(room.roomId).emit('tick', {
      state: room.getState()
    });
  }
}, 1000); // 1 tick per second
```

## CI/CD Pipeline Implementation

### GitHub Service

```typescript
// deployment-service/src/services/github.service.ts
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

export class GitHubService {
  async validateRepo(repoUrl: string, accessToken: string) {
    const octokit = new Octokit({ auth: accessToken });
    const { owner, repo } = this.parseRepoUrl(repoUrl);

    try {
      // Check repo exists
      const { data: repoData } = await octokit.repos.get({ owner, repo });

      // Check for required files
      await octokit.repos.getContent({ owner, repo, path: 'package.json' });
      await octokit.repos.getContent({ owner, repo, path: 'src/game.ts' });

      return { valid: true, repo: repoData };
    } catch (error) {
      throw new Error(`Repo validation failed: ${error.message}`);
    }
  }

  async setupWebhook(owner: string, repo: string, accessToken: string) {
    const octokit = new Octokit({ auth: accessToken });

    const webhookUrl = `${process.env.PLATFORM_URL}/api/webhooks/github`;
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    await octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
        insecure_ssl: '0'
      },
      events: ['push']
    });
  }

  async cloneRepo(
    repoUrl: string,
    accessToken: string,
    branch: string
  ): Promise<string> {
    const tmpDir = path.join('/tmp', `game-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });

    const { owner, repo } = this.parseRepoUrl(repoUrl);
    const cloneUrl = `https://${accessToken}@github.com/${owner}/${repo}.git`;

    await exec(`git clone --branch ${branch} --depth 1 ${cloneUrl} ${tmpDir}`);

    return tmpDir;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  private parseRepoUrl(url: string): { owner: string; repo: string } {
    // Handle: https://github.com/owner/repo or owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/) ||
                  url.match(/^([^\/]+)\/([^\/]+)$/);

    if (!match) throw new Error('Invalid GitHub repo URL');

    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }
}
```

### Build Pipeline

```typescript
// deployment-service/src/services/build.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BuildService {
  async buildGame(repoPath: string): Promise<BuildResult> {
    const buildId = generateBuildId();
    const logFile = path.join(repoPath, 'build.log');

    try {
      // 1. Install dependencies
      await this.runCommand('npm install', repoPath, logFile);

      // 2. Run linter
      await this.runCommand('npm run lint', repoPath, logFile);

      // 3. Run contract tests
      const contractResult = await this.runCommand(
        'npm run test:contract',
        repoPath,
        logFile
      );

      if (contractResult.exitCode !== 0) {
        throw new BuildError('Contract tests failed', contractResult.output);
      }

      // 4. Run determinism tests
      const detResult = await this.runCommand(
        'npm run test:determinism',
        repoPath,
        logFile
      );

      if (detResult.exitCode !== 0) {
        throw new BuildError('Determinism tests failed', detResult.output);
      }

      // 5. Run user tests
      await this.runCommand('npm test', repoPath, logFile);

      // 6. Build
      await this.runCommand('npm run build', repoPath, logFile);

      // 7. Validate output
      const distPath = path.join(repoPath, 'dist');
      const gamePath = path.join(distPath, 'game.js');

      if (!fs.existsSync(gamePath)) {
        throw new BuildError('Build did not produce game.js');
      }

      // 8. Load and validate module
      const gameModule = await import(gamePath);
      const gameDef = gameModule.default;

      this.validateGameDefinition(gameDef);

      // Success!
      return {
        success: true,
        buildId,
        gameDef,
        artifacts: distPath,
        logs: await fs.readFile(logFile, 'utf-8')
      };

    } catch (error) {
      const logs = await fs.readFile(logFile, 'utf-8');

      return {
        success: false,
        buildId,
        error: error.message,
        logs
      };
    }
  }

  private async runCommand(
    command: string,
    cwd: string,
    logFile: string
  ): Promise<CommandResult> {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });

      await fs.appendFile(logFile, `\n[${command}]\n${stdout}\n${stderr}\n`);

      return {
        exitCode: 0,
        output: stdout
      };
    } catch (error) {
      await fs.appendFile(logFile, `\n[${command}] FAILED\n${error}\n`);

      return {
        exitCode: error.code || 1,
        output: error.message
      };
    }
  }

  private validateGameDefinition(gameDef: any) {
    const required = [
      'id', 'name', 'version', 'minPlayers', 'maxPlayers',
      'createInitialState', 'processCommand', 'validateCommand',
      'serializeState', 'deserializeState', 'isGameOver'
    ];

    for (const prop of required) {
      if (!(prop in gameDef)) {
        throw new Error(`Missing required property: ${prop}`);
      }

      if (typeof gameDef[prop] === 'function') {
        // Verify function signature by checking length
        // (This is basic - could be more sophisticated)
      }
    }
  }
}
```

### Deployment Controller

```typescript
// deployment-service/src/controllers/deployment.controller.ts

export class DeploymentController {
  @Post('/api/games/register')
  async registerGame(@Body() body: RegisterGameDto) {
    const { repoUrl, accessToken, branch = 'main' } = body;
    const userId = req.user.id;

    try {
      // 1. Validate repo
      const repoInfo = await githubService.validateRepo(repoUrl, accessToken);

      // 2. Store in database (encrypt token!)
      const game = await prisma.developerGame.create({
        data: {
          userId,
          repoUrl,
          branch,
          accessToken: encrypt(accessToken), // MUST encrypt!
          status: 'pending'
        }
      });

      // 3. Setup webhook
      const { owner, repo } = parseRepoUrl(repoUrl);
      await githubService.setupWebhook(owner, repo, accessToken);

      // 4. Trigger initial build
      await this.triggerBuild(game.id);

      return {
        gameId: game.id,
        status: 'building',
        message: 'Build started. You will be notified when complete.'
      };

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/api/webhooks/github')
  async handleWebhook(@Headers() headers, @Body() payload) {
    // 1. Verify signature
    const signature = headers['x-hub-signature-256'];
    const body = JSON.stringify(payload);

    if (!githubService.verifyWebhookSignature(body, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Handle push event
    if (payload.ref === 'refs/heads/main') {  // Or configured branch
      const repoUrl = payload.repository.html_url;

      // Find registered game
      const game = await prisma.developerGame.findFirst({
        where: { repoUrl }
      });

      if (game) {
        await this.triggerBuild(game.id);
      }
    }

    return { received: true };
  }

  private async triggerBuild(gameId: string) {
    // Publish event to trigger build
    eventBus.publish('game.build.requested', { gameId });
  }
}

// Build worker (subscribes to build events)
eventBus.subscribe('game.build.requested', async (event) => {
  const { gameId } = event;

  const game = await prisma.developerGame.findUnique({
    where: { id: gameId }
  });

  if (!game) return;

  try {
    // Update status
    await prisma.developerGame.update({
      where: { id: gameId },
      data: { status: 'building' }
    });

    // Clone repo
    const repoPath = await githubService.cloneRepo(
      game.repoUrl,
      decrypt(game.accessToken),
      game.branch
    );

    // Build
    const result = await buildService.buildGame(repoPath);

    if (result.success) {
      // Deploy artifacts
      const deployPath = path.join(
        GAMES_DIR,
        result.gameDef.id,
        result.gameDef.version
      );

      await fs.mkdir(deployPath, { recursive: true });
      await fs.copy(result.artifacts, deployPath);

      // Register in catalog
      await prisma.game.upsert({
        where: { id: result.gameDef.id },
        create: {
          id: result.gameDef.id,
          title: result.gameDef.name,
          version: result.gameDef.version,
          minPlayers: result.gameDef.minPlayers,
          maxPlayers: result.gameDef.maxPlayers,
          status: 'active',
          developerId: game.userId
        },
        update: {
          version: result.gameDef.version,
          updatedAt: new Date()
        }
      });

      // Update game status
      await prisma.developerGame.update({
        where: { id: gameId },
        data: {
          status: 'deployed',
          lastBuildId: result.buildId,
          lastDeployedAt: new Date()
        }
      });

      // Notify developer
      await notificationService.send({
        userId: game.userId,
        type: 'build_success',
        message: `Game ${result.gameDef.name} deployed successfully!`,
        data: { gameId: result.gameDef.id, version: result.gameDef.version }
      });

      // Publish event
      eventBus.publish('game.deployed', {
        gameId: result.gameDef.id,
        version: result.gameDef.version
      });

    } else {
      // Build failed
      await prisma.developerGame.update({
        where: { id: gameId },
        data: { status: 'failed' }
      });

      await prisma.buildLog.create({
        data: {
          gameId,
          buildId: result.buildId,
          status: 'failed',
          error: result.error,
          logs: result.logs
        }
      });

      // Notify developer
      await notificationService.send({
        userId: game.userId,
        type: 'build_failed',
        message: `Build failed: ${result.error}`,
        data: { gameId, buildId: result.buildId, logs: result.logs }
      });
    }

  } catch (error) {
    await prisma.developerGame.update({
      where: { id: gameId },
      data: { status: 'error' }
    });

    console.error('Build error:', error);
  } finally {
    // Cleanup
    if (repoPath) {
      await fs.remove(repoPath);
    }
  }
});
```

## Contract Testing

```typescript
// @platform/game-sdk/tests/contract-tests.ts

export function createContractTests(gameDef: GameDefinition) {
  describe('GameDefinition Contract Tests', () => {

    test('has all required metadata', () => {
      expect(gameDef.id).toBeDefined();
      expect(gameDef.name).toBeDefined();
      expect(gameDef.version).toBeDefined();
      expect(gameDef.minPlayers).toBeGreaterThan(0);
      expect(gameDef.maxPlayers).toBeGreaterThanOrEqual(gameDef.minPlayers);
    });

    test('has all required methods', () => {
      expect(typeof gameDef.createInitialState).toBe('function');
      expect(typeof gameDef.processCommand).toBe('function');
      expect(typeof gameDef.validateCommand).toBe('function');
      expect(typeof gameDef.serializeState).toBe('function');
      expect(typeof gameDef.deserializeState).toBe('function');
      expect(typeof gameDef.isGameOver).toBe('function');
    });

    test('createInitialState returns valid state', () => {
      const state = gameDef.createInitialState({});

      expect(state).toBeDefined();
      expect(state.tick).toBeDefined();
      expect(state.players).toBeDefined();
    });

    test('processCommand is deterministic', () => {
      const initialState = gameDef.createInitialState({});

      // Create a test command
      const command = {
        type: 'TEST',
        playerId: 'player1',
        data: { action: 'test' },
        tick: 0
      };

      // Run 100 times
      const results = [];
      for (let i = 0; i < 100; i++) {
        const result = gameDef.processCommand(initialState, command);
        results.push(JSON.stringify(result));
      }

      // All results should be identical
      const firstResult = results[0];
      const allSame = results.every(r => r === firstResult);

      expect(allSame).toBe(true);
    });

    test('serialize/deserialize is reversible', () => {
      const original = gameDef.createInitialState({});
      const serialized = gameDef.serializeState(original);
      const deserialized = gameDef.deserializeState(serialized);

      expect(deserialized).toEqual(original);
    });

    test('validateCommand returns ValidationResult', () => {
      const state = gameDef.createInitialState({});
      const command = {
        type: 'INVALID',
        playerId: 'player1',
        data: {},
        tick: 0
      };

      const result = gameDef.validateCommand(state, command);

      expect(result).toHaveProperty('valid');
      expect(typeof result.valid).toBe('boolean');
    });

    test('isGameOver returns GameOverResult', () => {
      const state = gameDef.createInitialState({});
      const result = gameDef.isGameOver(state);

      expect(result).toHaveProperty('isOver');
      expect(typeof result.isOver).toBe('boolean');
    });
  });
}

// Developers include this in their test suite:
// import { createContractTests } from '@platform/game-sdk/tests';
// import { MyGame } from './game';
// createContractTests(MyGame);
```

## Database Schema

```prisma
// prisma/schema.prisma

model DeveloperGame {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])

  repoUrl          String
  branch           String   @default("main")
  accessToken      String   // Encrypted!

  status           GameStatus @default(PENDING)
  lastBuildId      String?
  lastDeployedAt   DateTime?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  builds           BuildLog[]
}

enum GameStatus {
  PENDING
  BUILDING
  DEPLOYED
  FAILED
  ERROR
}

model BuildLog {
  id          String   @id @default(uuid())
  gameId      String
  game        DeveloperGame @relation(fields: [gameId], references: [id])

  buildId     String   @unique
  status      BuildStatus
  error       String?
  logs        String   @db.Text

  createdAt   DateTime @default(now())
}

enum BuildStatus {
  RUNNING
  SUCCESS
  FAILED
}

model Game {
  id           String   @id  // From GameDefinition.id
  title        String
  description  String?
  version      String

  minPlayers   Int
  maxPlayers   Int

  developerId  String
  developer    User     @relation(fields: [developerId], references: [id])

  status       String   @default("active")  // active, deprecated

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  ratings      GameRating[]
  sessions     GameSession[]
}
```

## Implementation Phases

### Phase 1: Foundation (1-2 weeks)
- ✅ Define GameDefinition interface
- ✅ Create @platform/game-sdk package
- ✅ Build one example game (city builder)
- ✅ Game Server loads games dynamically
- ✅ Multiplayer works with deterministic sync
- ✅ Manual deployment (copy files)

### Phase 2: CI/CD (1-2 weeks)
- ✅ GitHub API integration
- ✅ Repo validation
- ✅ Build pipeline (clone, test, build)
- ✅ Contract testing
- ✅ Automated deployment
- ✅ Build logs and error reporting

### Phase 3: Webhooks & Auto-Deploy (3-5 days)
- ✅ GitHub webhook setup
- ✅ Webhook signature verification
- ✅ Auto-trigger builds on push
- ✅ Developer notifications

### Phase 4: Developer Experience (1 week)
- ✅ Template repository
- ✅ Developer dashboard
- ✅ Build status UI
- ✅ Error logs viewer
- ✅ Documentation

### Phase 5: Polish (ongoing)
- Game versioning
- Rollback capability
- A/B testing (deploy to subset of users)
- Analytics per game
- Security hardening (sandboxing)

## Security Considerations

1. **Token Storage**: Encrypt GitHub access tokens at rest
2. **Webhook Verification**: Verify GitHub webhook signatures
3. **Code Execution**: Run untrusted game code in VM or sandbox
4. **Rate Limiting**: Limit build frequency per developer
5. **Resource Limits**: Timeout long builds, limit memory
6. **Input Validation**: Validate all game commands
7. **Permissions**: Developers can only modify their own games

## What This Demonstrates

**For Interviews:**

- ✅ **Microservices**: Multiple services with clear boundaries
- ✅ **Event-Driven**: Async communication via events
- ✅ **CI/CD**: Full pipeline from code push to deployment
- ✅ **Platform Engineering**: Building a platform others build on
- ✅ **Plugin Architecture**: Dynamic module loading
- ✅ **Contract Testing**: Enforcing interfaces
- ✅ **Real-Time**: WebSocket multiplayer
- ✅ **Security**: Token management, sandboxing
- ✅ **DevOps**: GitHub integration, webhooks, automation
- ✅ **Monorepo**: Shared code between client/server
- ✅ **Type Safety**: TypeScript throughout

**The Story You Tell:**

> "I built a game platform where developers can create browser-based multiplayer games. The unique aspect is that developers just implement a standard interface for game logic, and the platform handles all the infrastructure—multiplayer synchronization, persistence, authentication, hosting, and deployment.
>
> The platform uses a deterministic lockstep model for multiplayer, meaning the same game logic code runs on both client and server. This allows massive scalability because we only sync player commands, not full game state.
>
> For CI/CD, I integrated with GitHub. Developers push to their repo, webhooks trigger our build pipeline, we run contract tests to ensure they've implemented the interface correctly, and if tests pass, the game is automatically deployed and available to all players.
>
> The architecture uses microservices—a stateless core service for game catalog and auth, a stateful game server for real-time multiplayer, and a deployment service for CI/CD. Services communicate via gRPC for synchronous calls and RabbitMQ events for asynchronous operations."

## Next Steps

1. Start with Phase 1 - get the foundation working
2. Build one example game to validate the interface
3. Once multiplayer works, add CI/CD
4. Iterate based on learnings

Would you like help implementing any specific part?
