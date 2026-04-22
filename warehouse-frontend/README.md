# Warehouse Frontend (Vue 3 + Vite)

This is the frontend web app for the Warehouse project (Vue 3, Vue Router, Pinia, Axios).

## Prerequisites

- Node.js **20+** recommended (see `engines` in `package.json`)
- npm (comes with Node)

## Setup

```bash
cd warehouse-frontend
npm install
```

## Configure API URL (important)

API calls use a shared Axios instance (`src/api/axios.js`):

- If **`VITE_API_BASE_URL`** is set (in `.env` / `.env.local`), that value is used (trailing slashes are stripped). It must include the `/api` suffix, e.g. `http://localhost:5000/api`.
- If it is **not** set, the app falls back to **`http://localhost:5000/api`**.

The repo includes **`.env.example`**, which sets `VITE_API_BASE_URL=http://localhost:5050/api` and a comment explaining that **5050** is useful on macOS when port **5000** is taken by AirPlay Receiver. If you copy that file to `.env` without edits, run the backend with **`PORT=5050`** so the URLs match.

To create a local env file:

```bash
copy .env.example .env
```

(On macOS/Linux: `cp .env.example .env`.)

Then either align `PORT` on the backend with the port in `VITE_API_BASE_URL`, or change `VITE_API_BASE_URL` to match your backend (default backend port is **5000**).

## Running the frontend

```bash
npm run dev
```

Vite will print the local dev URL (commonly `http://localhost:5173`).

## Linting / formatting

```bash
npm run lint
npm run format
```

## Typical local dev flow

1. Start the backend:

```bash
cd warehouse-backend
npm install
copy .env.example .env
npm run dev
```

2. Start the frontend (same machine, API on default port **5000**):

```bash
cd warehouse-frontend
npm install
npm run dev
```

If you use a **frontend** `.env` from `.env.example` (port **5050**), set `PORT=5050` in `warehouse-backend/.env` before `npm run dev`, or edit `VITE_API_BASE_URL` to match your backend `PORT`.

## Troubleshooting

- **401 Unauthorized**: the frontend sends `Authorization: Bearer <token>` from `localStorage.getItem('token')` (`src/api/axios.js`). Log in first, or clear `localStorage` if you have an expired or wrong-environment token.
- **CORS errors**: ensure the backend is running and that `VITE_API_BASE_URL` (or the default `http://localhost:5000/api`) matches the backend origin and `/api` prefix.
