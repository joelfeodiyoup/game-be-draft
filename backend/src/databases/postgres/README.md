## why postgres?

- it's very popular / lots of support / documentation / access to expertise etc
- relational with clear schema
- in reality I'd probably even lean on this more, with its jsonb data type, and various extensions for different use-cases
- ACID guarantees
- strong type system matches well with typescript / prisma

## schema overview

- **players**
    - id (PK)
    - email
    - password_hash
    - created_at
    - password_hash
    - game saves
- **sessions**
    - id (PK)
    - player_id (FK -> players.id)
    - token
    - expires at
- **game saves**
    - id (PK)
    - player_id (FK -> players.id)
    - mongodb_state_id (references mongodb document)
    - time played
    - created_at

- **scenarios**
    - id (PK)
    - description
    - ratings ->

- **ratings**
    - player_id (FK -> players.id)
    - scenario_id (FK -> scenarios.id)
    - PK ([player_id, scenario_id])
    - rating (1-5)

## setup instructions

