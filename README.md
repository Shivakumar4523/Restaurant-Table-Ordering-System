# Royal Spice Restaurant Table Ordering System

Full-stack restaurant website and protected table-ordering system.

```txt
frontend/   React + Vite + Tailwind CSS
backend/    Node.js + Express + MongoDB + Socket.IO
```

## Features

- Public Home, Menu, About, and Contact pages.
- Dark green and gold Royal Spice Restaurant UI.
- Protected `/staff/login`, `/staff/orders`, `/kitchen`, and `/admin` routes.
- Waiter table ordering with cart, notes, active table orders, GST bill, and print bill.
- Kitchen dashboard with realtime Pending, Preparing, Ready, and Served updates.
- Admin management for menu items, categories, offers/coupons, tables, employees, and sales reports.
- MongoDB models for Users, Tables, Categories, MenuItems, Orders, and Payments.
- JWT role-based access for admin, waiter, kitchen staff, and cashier.

## Quick Start

```bash
npm install
npm run seed
npm run dev
```

Open:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api/health
```

Seeded staff accounts:

```txt
owner@royalspice.test / owner16655
waiter@royalspice.test / waiter6655
chef@royalspice.test / chef6655
cashier@royalspice.test / cash6655
```

## Validation

```bash
npm run check:case
npm --workspace frontend run build
```

## Docker Compose

```bash
cp .env.example .env
docker compose --env-file .env up --build -d
docker compose exec backend npm run seed
```

The frontend image builds the Vite app and serves it with Nginx. The backend image runs the Express API, and MongoDB uses the official `mongo:7` image.
