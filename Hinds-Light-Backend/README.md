# Hind's Light Backend

Quick start:

1. Create `.env` with:

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hinds_light?schema=public
REDIS_URL=redis://localhost:6379
TRANSLATION_PROVIDER=dummy
# For Google (optional)
GOOGLE_TRANSLATE_API_KEY=
```

2. Install dependencies:

```
npm i
npx prisma generate
```

3. Start DBs (example with Docker):

```
docker run -d --name hl-postgres -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hinds_light postgres:16-alpine
docker run -d --name hl-redis -p 6379:6379 redis:7-alpine
```

4. Migrate:

```
npx prisma migrate dev --name init
```

5. Run services:

```
npm run dev
npm run worker:ingest
npm run worker:translation
```

To enable Google Translate, set `TRANSLATION_PROVIDER=google` and provide `GOOGLE_TRANSLATE_API_KEY`.

## Docker

Build and run API + workers + DBs with one command:

```
docker compose up -d --build
```

Environment variables are read from your local shell or a `.env` file in the repo root. Default DB creds are baked into compose for local dev.

Rebuild on code changes:

```
docker compose up -d --build api worker-ingest worker-translation
```

Stop services:

```
docker compose down
```

Run migrations inside the `api` container (after DB is up):

```
docker compose exec api npx prisma migrate deploy
```


