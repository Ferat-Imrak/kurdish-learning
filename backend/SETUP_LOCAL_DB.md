# Setup Local PostgreSQL Database

## Step 1: Create Database

Open Postgres.app terminal or run:

```bash
psql postgres
```

Then run:
```sql
CREATE DATABASE kurdish_learning;
\q
```

## Step 2: Update Backend .env

Make sure `backend/.env` has:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kurdish_learning
```

**Note:** Postgres.app usually uses:
- User: your macOS username (or `postgres`)
- Password: (usually empty, or check Postgres.app settings)
- Port: 5432

## Step 3: Test Connection

```bash
cd backend
psql postgresql://postgres@localhost:5432/kurdish_learning
# If this works, your connection string is correct
```

## Step 4: Run Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Step 5: Start Backend

```bash
npm run dev
```

Backend should start on port 8080.

## Step 6: Restart Frontend

```bash
cd ../frontend
# Stop current server (Ctrl+C)
npm run dev
```

Then hard refresh browser: `Cmd+Shift+R`

