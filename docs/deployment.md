# Deployment Guide

## Docker Compose

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` for your host:

```txt
FRONTEND_PORT=3000
BACKEND_PORT=5000
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
MONGO_URI=mongodb://mongodb:27017/royal-spice
JWT_SECRET=replace-with-a-long-random-production-secret
CLIENT_URL=http://localhost:3000,http://127.0.0.1:3000
```

For a server deployment, replace `localhost` with your public domain or IP address in `VITE_API_URL`, `VITE_SOCKET_URL`, and `CLIENT_URL`.

3. Build and start:

```bash
docker compose --env-file .env up --build -d
```

4. Seed demo data once:

```bash
docker compose exec backend npm run seed
```

The backend also auto-seeds the bar item catalog when the `baritems` collection is empty, so a fresh deployment will show bar items after the API restarts. To backfill only bar items on an existing deployment, run:

```bash
docker compose exec backend npm run seed:bar
```

5. Open:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api/health
```

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
docker compose down -v
```

After changing any `VITE_*` variable, rebuild the frontend because those values are baked into the browser bundle:

```bash
docker compose build frontend
docker compose up -d frontend
```

## Images

- `frontend/Dockerfile` builds the Vite app and serves `dist/` with Nginx.
- `backend/Dockerfile` runs the Express API with Node.js.
- `mongodb` uses the official `mongo:7` image.

## Linux Case Safety

Before deploying from Windows or macOS:

```bash
npm run check:case
```
