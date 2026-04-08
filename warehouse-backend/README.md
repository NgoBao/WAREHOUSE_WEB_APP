# Warehouse Backend (Express + SQLite)

This is the backend API for the Warehouse web app.

## Prerequisites

- Node.js **20+** recommended
- npm (comes with Node)

## Setup

```bash
cd warehouse-backend
npm install
```

## Environment variables

Create a `.env` file in `warehouse-backend/`:

```env
PORT=5000
JWT_SECRET=replace_me_with_a_long_random_secret
```

Notes:

- **`PORT`**: API port (defaults to `5000` if not set).
- **`JWT_SECRET`**: used to sign/verify auth tokens.

If you don’t want to create it manually, you can copy the example:

```bash
copy .env.example .env
```

## Running the API

### Development (auto-reload)

```bash
npm run dev
```

### Production-like (no reload)

```bash
npm start
```

When the server starts it will:

- Connect to SQLite at `warehouse-backend/warehouse.db`
- Create the required tables (if they don’t exist)

## Seeding sample data (optional)

This project includes a seed script that inserts demo data (users, suppliers, customers, products, purchase orders, sales orders).

1. Start the API once to ensure tables exist:

```bash
npm run dev
```

2. In another terminal (or after stopping the server), run:

```bash
node seed.js
```

### Default login credentials (seeded)

- **Admin**: `admin@test.com` / `123456`
- **Staff**: `staff1@test.com` / `123456` (also `staff2`, `staff3`)

## API Routes

Base URL: `http://localhost:5000`

- `GET /` → health text: `Warehouse API Running...`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `CRUD /api/users`
- `CRUD /api/suppliers`
- `CRUD /api/customers`
- `CRUD /api/products`
- `CRUD /api/purchases`
- `CRUD /api/sales`
- `GET /api/dashboard/*` (dashboard endpoints)

## Troubleshooting

- **JWT errors**: make sure `JWT_SECRET` is set in `warehouse-backend/.env`.
- **Port already in use**: change `PORT` in `.env`, then update the frontend API base URL accordingly.
- **Database issues**: `warehouse.db` is a local dev database file. If you want a clean slate, stop the server and delete `warehouse-backend/warehouse.db`, then start the server again.

