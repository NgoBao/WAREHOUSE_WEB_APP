# Warehouse Backend (Express + SQLite)

This is the backend API for the Warehouse web app.

## Prerequisites

- Node.js **20+** recommended (the Vue app in `warehouse-frontend` declares `^20.19.0 || >=22.12.0` in `package.json` `engines`)
- npm (comes with Node)

## Setup

```bash
cd warehouse-backend
npm install
```

## Automated tests

Integration tests exercise the real HTTP stack (`supertest`) against an **in-memory** SQLite database (see `test/api.integration.test.js`). They assert behavior engineers rely on: login failures, JWT issuance, **401** without a token, **403** when staff hits admin-only routes, **product create** for admins, **insufficient stock** on sale completion, and **inventory increase** after purchase receive.

```bash
npm test
```

Tests set `NODE_ENV=test`, `WAREHOUSE_DB_PATH=:memory:`, and `JWT_SECRET` internally; they do **not** read your `.env` or touch `warehouse.db`.

## Environment variables

Create a `.env` file in `warehouse-backend/`:

```env
PORT=5000
JWT_SECRET=replace_me_with_a_long_random_secret
```

Notes:

- **`PORT`**: API port (defaults to `5000` if not set).
- **`JWT_SECRET`**: used to sign/verify auth tokens (required for login and protected routes).
- **`WAREHOUSE_DB_PATH`** (optional): SQLite file path or `:memory:`. Defaults to `warehouse.db` in this package directory (see `config/db.js`). The normal dev server does not need this set.

If you don’t want to create it manually, you can copy the example:

```bash
copy .env.example .env
```

(On macOS/Linux: `cp .env.example .env`.)

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
- Run additive DB migrations (`config/migrations.js`: audit timestamps, soft-delete columns where missing, triggers)
- If the `users` table is empty, run the demo seed (same data as `node seed.js`)

## Seeding sample data

**Automatic (first run):** If the `users` table is empty when the server starts, it runs the demo seed for you (same data as `node seed.js`). You can log in immediately with `admin@test.com` / `123456`.

**Manual:** To re-seed from scratch, stop the server, delete `warehouse.db`, start the server again (or run `node seed.js` after tables exist — only safe on an empty DB).

The seed inserts users, suppliers, customers, products, purchase orders, and sales orders.

### Default login credentials (seeded)

- **Admin**: `admin@test.com` / `123456`
- **Staff**: `staff1@test.com`, `staff2@test.com`, `staff3@test.com` / `123456`

## API overview

- **Health:** `GET /` returns plain text: `Warehouse API Running...`
- **JSON API base path:** `/api` (example origin: `http://localhost:<PORT>` where `<PORT>` is your `PORT` env or `5000` default).

Except where noted, **protected** routes expect header `Authorization: Bearer <JWT>` from `POST /api/auth/login`.

### Auth (`/api/auth`)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `POST` | `/api/auth/register` | Public | Body: name, email, password. New users default to role `staff`. |
| `POST` | `/api/auth/login` | Public | Returns JWT + user payload. |
| `GET` | `/api/auth/logout` | Public | Stateless: responds with a message; client must remove the token. |

### Users (`/api/users`) — **admin only** (JWT + role)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/users` | List users (non-deleted). |
| `POST` | `/api/users` | Create user. |
| `GET` | `/api/users/:id` | Get one user. |
| `PUT` | `/api/users/:id/role` | Update role. |
| `DELETE` | `/api/users/:id` | Soft-delete user. |

### Suppliers (`/api/suppliers`)

| Method | Path | Roles |
|--------|------|--------|
| `GET` | `/api/suppliers` | Admin, staff |
| `GET` | `/api/suppliers/:id` | Admin, staff |
| `POST` | `/api/suppliers` | Admin |
| `PUT` | `/api/suppliers/:id` | Admin |
| `DELETE` | `/api/suppliers/:id` | Admin (soft delete) |

### Customers (`/api/customers`)

| Method | Path | Roles |
|--------|------|--------|
| `GET` | `/api/customers` | Admin, staff |
| `GET` | `/api/customers/:id` | Admin, staff |
| `POST` | `/api/customers` | Admin, staff |
| `PUT` | `/api/customers/:id` | Admin, staff |
| `DELETE` | `/api/customers/:id` | Admin only (soft delete) |

### Products (`/api/products`)

| Method | Path | Roles |
|--------|------|--------|
| `GET` | `/api/products` | Admin, staff |
| `GET` | `/api/products/:id` | Admin, staff |
| `POST` | `/api/products` | Admin |
| `PUT` | `/api/products/:id` | Admin |
| `DELETE` | `/api/products/:id` | Admin (soft delete) |

### Purchase orders (`/api/purchases`) — **admin, staff**

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/purchases` | List purchase orders. |
| `GET` | `/api/purchases/:id` | Order detail including line items. |
| `POST` | `/api/purchases` | Create PO + lines (transaction). |
| `PUT` | `/api/purchases/:id/receive` | Receive into stock; increments quantities (transaction). |

### Sales orders (`/api/sales`) — **admin, staff**

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/sales` | List sales orders. |
| `GET` | `/api/sales/:id` | Order detail including line items. |
| `POST` | `/api/sales` | Create order + lines (transaction). |
| `PUT` | `/api/sales/:id/complete` | Complete sale; decrements stock if sufficient (transaction). |

### Dashboard (`/api/dashboard`)

| Method | Path | Roles | Notes |
|--------|------|--------|--------|
| `GET` | `/api/dashboard/summary` | Admin | Product/supplier/customer counts, sum of **completed** sales (`totalSales`), low stock list. |
| `GET` | `/api/dashboard/staff-summary` | Admin, staff | Catalog size, pending purchase/sales counts, low stock; **no** revenue rollup. |

## Troubleshooting

- **JWT errors**: make sure `JWT_SECRET` is set in `warehouse-backend/.env`.
- **Port already in use**: change `PORT` in `.env`, then point the frontend `VITE_API_BASE_URL` at `http://localhost:<PORT>/api`.
- **Database issues**: `warehouse.db` is a local dev database file. If you want a clean slate, stop the server and delete `warehouse-backend/warehouse.db`, then start the server again.
