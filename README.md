# Classic Car Rental

Professional MERN stack application for Classic Car Rental.

## Structure

- `client/` - React + Vite frontend
- `server/` - Express + MongoDB backend

## Client

```bash
cd client
npm install
npm run dev
```

The frontend uses `VITE_API_BASE_URL` from `client/.env`.

## Server

```bash
cd server
npm install
npm run dev
```

The backend uses MongoDB through Mongoose. Configure `server/.env` or copy `server/.env.example` and set production values.

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=<strong-secret>
CLIENT_URL=https://your-frontend-url.vercel.app
SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_SECURE=true
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-pass>
FROM_EMAIL=<from-email>
```

## Run Both

```bash
npm install
npm run dev
```

The root `dev` script starts both the client and server with Concurrently.
