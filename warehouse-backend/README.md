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

## Seeding sample data

**Automatic (first run):** If the `users` table is empty when the server starts, it runs the demo seed for you (same data as `node seed.js`). You can log in immediately with `admin@test.com` / `123456`.

**Manual:** To re-seed from scratch, stop the server, delete `warehouse.db`, start the server again (or run `node seed.js` after tables exist — only safe on an empty DB).

The seed inserts users, suppliers, customers, products, purchase orders, and sales orders.

### Default login credentials (seeded)

- **Admin**: `admin@test.com` / `123456`
- **Staff**: `staff1@test.com` / `123456` (also `staff2`, `staff3`)

## API Routes

Base URL: `http://localhost:5000`

- `GET /` → health text: `Warehouse API Running...`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|PUT|DELETE /api/users` (admin)
- `GET|POST|PUT|DELETE /api/suppliers` (read: staff+admin; write/delete: admin)
- `GET|POST|PUT|DELETE /api/customers` (delete: admin only)
- `GET|POST|PUT|DELETE /api/products` (read: staff+admin; write/delete: admin)
- **`/api/purchases`**: `GET /` list, `GET /:id` detail + line items, `POST /` create PO, `PUT /:id/receive` receive into stock (staff+admin)
- **`/api/sales`**: `GET /` list, `GET /:id` detail + lines, `POST /` create order, `PUT /:id/complete` complete and deduct stock (staff+admin)
- `GET /api/dashboard/summary` (admin — counts, completed sales total, low stock)
- `GET /api/dashboard/staff-summary` (staff + admin — catalog size, pending PO/sales counts, low stock; no revenue rollup)

## Troubleshooting

- **JWT errors**: make sure `JWT_SECRET` is set in `warehouse-backend/.env`.
- **Port already in use**: change `PORT` in `.env`, then update the frontend API base URL accordingly.
- **Database issues**: `warehouse.db` is a local dev database file. If you want a clean slate, stop the server and delete `warehouse-backend/warehouse.db`, then start the server again.

