Note: this is intentionally a bit over-engineered in the amount of databases used. If this were a real system I might reduce the number by using jsonb data types in postgresql for unstructured data, which could remove the need for mongodb, and TimescaleDB (an extension to postgresql) for metrics. I've deliberately chosen to use a few here just for educational purposes.

The point is firstly just to demonstrate a few database things. It'll do it by building a backend for the game I keep trying to make. i.e. saving the game, etc.

- relational DB (e.g. postgresql) for player info. amount of time played. record of game sessions? Achievements?
- document DB (e.g. mongodb) for the game state (it's got some unknown structure)
- key-value (e.g. redis) for user session state? or caching?
- IndexedDB (on front end) for local save state. auto save.

slightly optional:
- analytics db (clickhouse/timescaledb) - could just include "most time played" and update automatically? "player progression" ?
- vector database - I can't yet think of a good use-case.
- redis pub/sub for real-time features?
- caching strategies?

ORMS:
- postgresql - Prisma
- mongodb - mongoose
- redis - no ORM. ioredis.
- clickhouse - no ORM (it's OLAP) - @clickhouse/client
- IndexedDB - dexie.js