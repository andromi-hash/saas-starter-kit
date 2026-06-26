# SaaS Starter Kit

**Launch your SaaS in days, not months.** Full-stack starter with React frontend, Node.js API, Stripe subscriptions, API key management, and Docker.

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Architecture

```
frontend/     → React + Vite + Tailwind (admin dashboard)
backend/      → Express + Prisma + Stripe + JWT
docker-compose.yml → Full stack with Postgres
```

## Features

- **Auth** — signup, login, JWT, protected routes
- **Subscriptions** — Stripe checkout, billing portal, webhooks
- **API keys** — generate, list, revoke API keys
- **Dashboard** — analytics, user management, settings (from Admin Template)
- **Docker** — full stack with Postgres
- **CI** — GitHub Actions for backend tests + frontend build

## License

MIT
