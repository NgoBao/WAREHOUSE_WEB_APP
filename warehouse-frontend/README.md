# Warehouse Frontend (Vue 3 + Vite)

This is the frontend web app for the Warehouse project.

## Prerequisites

- Node.js **20+** recommended
- npm (comes with Node)

## Setup

```bash
cd warehouse-frontend
npm install
```

## Configure API URL (important)

The API base URL is configured in `.env` via:

- `VITE_API_BASE_URL` (example: `http://localhost:5000/api`)

To get started:

```bash
copy .env.example .env
```

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

2. Start the frontend:

```bash
cd warehouse-frontend
npm install
npm run dev
```

## Troubleshooting

- **401 Unauthorized**: the frontend attaches `Authorization: Bearer <token>` from `localStorage.getItem('token')`. Log in first (or clear localStorage if you have an old token).
- **CORS errors**: ensure the backend is running and reachable at the URL in `VITE_API_BASE_URL`.
