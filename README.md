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