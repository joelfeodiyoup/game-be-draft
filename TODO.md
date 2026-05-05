## past

### 20.04.2026
- ~~come up with a basic relational schema for postgres~~
- ~~write schema with prisma~~
- ~~write repository file~~
- ~~set up api bootstrap~~
- ~~add controller for authentication~~
- ~~add FE bootstrap~~
- ~~implement authentication~~
- ~~add FE for authentication~~
- ~~add FE context wrapper for logged in state~~
- ~~functionality from FE to sign up a user~~

### 22.04.2026

- ~~add seeding for 'games', and 'scenarios' so I can start~~
- ~~add mongo db~~
- ~~add mongo gui~~
- ~~add listing of games and scenarios~~
- ~~implement the mongodb client~~
- ~~figure out what needs to be done to hook up mongodb with postgres~~
- ~~login endpoint returns the sessionId object. It shouldn't, because that includes the sessionId~~

### 23.04.2026

- ~~make ui look nice~~

### 25.04.2026

- ~~rearrange ui to be a bit more simple~~
- ~~figure out how I could have authentication on separate endpoints~~
- ~~figure out hono middleware~~
- ~~add proper error catching for auth login etc.~~

### 27.04.2026

- ~~add game rating~~
- ~~add some hono api documentation~~
- ~~update my repository files to accept an optional client. That way, I can use prisma.$transaction(tx => { /* pass tx client to repository */})~~
- ~~add authentication thing to documentation endpoint~~

### 04.05.2026

- ~~add documentation for all the routes~~
- ~~reset some queries based on things. E.g. when voting, the game thing should update.~~
- ~~fix styling so it just looks minimal and clean~~
- ~~add comments to game reviews~~
- ~~implement the worker/orchestrator thing~~

## today

- ~~fix refetch on modifying game rating~~
- ~~add user info at top~~
- ~~sort games alphabetically~~
- map game rating fields to data
- paginate game reviews
- add service to save game
- show some kind of mock 'game' when they start a game
- handle game state on FE
- add 'create scenario' functionality
- further fix up dto objects.

## future

- auth middleware for every controller endpoint
- integration tests
- add rate limiting
- rate limit login
- rate limit expensive operations
- set up global tanstack query error handling for 401s
- add redis caching
- write complex queries - joins, aggregations, transactions
- implement data seeding
- add query optimization examples - explain analyze, n+1 prevention
- figure out the best way to handle controller endpoints like /country/:countryId/games/:gameId/ratings/:ratingId etc
- add jsonb for ACID and compare the two.
- add static site for github display