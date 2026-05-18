# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN npm ci --omit=dev --workspace backend --include-workspace-root=false \
  && mkdir -p backend/node_modules

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN mkdir -p /app/backend/src/uploads && chown -R node:node /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --chown=node:node backend ./backend

WORKDIR /app/backend
USER node

EXPOSE 5000

CMD ["node", "src/server.js"]
