# Deployment Guide — Classic Car Rental

This file documents steps to deploy the frontend (Vercel) and backend (Render).

Required environment variables (backend):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret for signing JWT tokens
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` — SMTP settings for sending emails
- `CLIENT_URL` — frontend URL (e.g. https://your-site.vercel.app)

Frontend (Vercel)
1. Connect the `client` folder to Vercel via GitHub (or import repo).
2. Ensure `VITE_API_BASE_URL` is set in Vercel Environment Variables to your backend URL (include `/api`), e.g. `https://api.example.com/api`.
3. Build command: `npm run build`
4. Output directory: `client/dist` (the included `vercel.json` uses `dist`).

Backend (Render)
1. Create a new Web Service on Render and link your repository, or use `render.yaml` in the `server` folder.
2. Set the `startCommand` to `npm start` and build command if necessary.
3. Add the required environment variables listed above in the Render dashboard.
4. Ensure `CLIENT_URL` matches the Vercel site URL.

Notes
- The backend will automatically seed admin users when the `users` collection is empty. For production, set your own `BOOKING_EMAIL`/`BOOKING_PASSWORD` and `OWNER_*` env variables before first start, or run the seed script manually: `node scripts/seedAdmin.js`.
- The frontend reads `VITE_API_BASE_URL` from `import.meta.env`. Make sure it's configured in Vercel.

Verification checklist (after deployment):
- Visit frontend: homepage loads and assets are served.
- Login with seeded admin credentials (if used) or create accounts.
- Create a booking and verify it appears in MongoDB Atlas.
- Trigger an email (e.g. forgot-password) to verify SMTP.
