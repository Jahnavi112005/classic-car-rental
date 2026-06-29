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

The frontend uses `VITE_API_BASE_URL` from `client/.env` and defaults to `http://localhost:5000/api`.

## Server

```bash
cd server
npm install
npm run dev
```

The backend uses MongoDB through Mongoose. Configure `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/classic-car-rental
JWT_SECRET=change-this-secret-in-production
CLIENT_URL=http://localhost:5173
```

## Run Both

```bash
npm install
npm run dev
```

The root `dev` script starts both the client and server with Concurrently.
