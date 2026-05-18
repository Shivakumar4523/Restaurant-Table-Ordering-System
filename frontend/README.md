# Royal Spice Frontend

React, Vite, Tailwind CSS, Axios, React Router, Socket.IO client, Context API, and Framer Motion.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Environment

Copy `.env.local.example` to `.env.local` and set:

```txt
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Docker

The Docker image builds the Vite app and serves the static `dist/` directory with Nginx.

Use the root `docker-compose.yml` for local or server deployment:

```bash
docker compose --env-file .env up --build -d
```

## Structure

- `src/RootApp.tsx` React Router routes.
- `src/components` reusable UI and layout.
- `src/context` auth and socket state.
- `src/lib` API and Socket.IO integrations.
- `src/pages` public, staff, kitchen, and admin pages.
