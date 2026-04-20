## why redis?

- key-value in memory store

## use cases

**session management**
- store session tokens with automatic expiration
- much faster than DB queries for every authenticated request
- `session:{sessionId}` -> player data + expiry
- redis as session store, TTL, get/set operations

**online player tracking**
- who's currently playing right now.

**rate limiting**

**recently active players cache**