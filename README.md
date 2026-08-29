# AI Trainers Admin

Internal desk for watching applications and intro-call bookings.

Runs on port **3100**, separate from the marketing site (3000) and API (5000).

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://127.0.0.1:3100`. Sign in with `ADMIN_API_KEY` from the backend `.env`.
