# How to Find PostgreSQL Username and Password

## Option 1: Using Docker (Recommended for this project)

If you're using Docker Compose, the credentials are already set in `docker-compose.yml`:

- **Username**: `postgres`
- **Password**: `password`
- **Database**: `kurdish_learning`

Your `.env` file should have:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kurdish_learning
```

## Option 2: Local PostgreSQL Installation

If you installed PostgreSQL locally (not via Docker), check:

### Find Username:
```bash
# Default username is usually "postgres"
whoami
# Or try:
psql -l
```

### Find/Reset Password:
```bash
# Connect as postgres user
sudo -u postgres psql

# Inside psql, you can:
# 1. Change password:
ALTER USER postgres PASSWORD 'your_new_password';

# 2. Or create a new user:
CREATE USER kurdish_user WITH PASSWORD 'your_password';
CREATE DATABASE kurdish_learning OWNER kurdish_user;
GRANT ALL PRIVILEGES ON DATABASE kurdish_learning TO kurdish_user;
```

### Test Connection:
```bash
# Test connection with default user
psql -U postgres -d kurdish_learning

# Or with custom user
psql -U kurdish_user -d kurdish_learning
```

## Option 3: Check Your Current .env File

Check if you already have a `.env` file:
```bash
# Frontend
cat frontend/.env.local | grep DATABASE_URL

# Backend  
cat backend/.env | grep DATABASE_URL
```

## Quick Setup

1. **If using Docker:**
   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres
   
   # Your DATABASE_URL is:
   # postgresql://postgres:password@localhost:5432/kurdish_learning
   ```

2. **If using local PostgreSQL:**
   ```bash
   # Update backend/.env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kurdish_learning
   
   # Update frontend/.env.local (if needed)
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kurdish_learning
   ```

## Common Defaults

- **Username**: Usually `postgres` (the superuser)
- **Password**: 
  - Docker: `password` (as set in docker-compose.yml)
  - Local install: Whatever you set during installation (often blank initially)
  - macOS Homebrew: Usually blank (empty password)
- **Port**: `5432` (default PostgreSQL port)
- **Host**: `localhost` (for local development)

