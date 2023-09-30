# kural-backend

To install dependencies:

```bash
bun install
```

## Postgres setup

```postgres
CREATE TABLE hosts(username text, password bytea)
```
create a `.env` file for Postgres login credentials:
```bash
export PGUSER=username
export PGPASSWORD=password
export PGDATABASE=databasename
export PGPORT=5432
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

