# NexaHealth

NexaHealth is a healthcare web application prototype with a React frontend and an Express API backed by Supabase PostgreSQL through Prisma.

## Project structure

- `frontend/` — React, Vite, and Tailwind CSS application.
- `backend/` — Express API, Prisma schema and migrations, and RFID device demos.

The API currently provides patient registration with email OTP verification, login, session/profile lookup, patient smart-card lookup, and RFID endpoints. Some frontend screens represent functionality that is not yet implemented by this API.

## Run locally

Prerequisites: Node.js and npm, plus an active Supabase project.

1. Configure the backend environment:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

   Set `DATABASE_URL` to the connection string from your Supabase project and replace the example values for `JWT_SECRET` and `RFID_DEVICE_KEY`. Configure the `EMAILJS_*` values to enable registration email delivery.

2. Start the API in one terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   The API listens on `http://localhost:5001` by default. Prisma migrations are in `backend/prisma/migrations`; apply them to the configured database with `npx prisma migrate deploy` from `backend` when setting up a database.

3. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5001`; set `NEXAHEALTH_API_URL` in the frontend environment to use a different local API URL.

## Deploy to Vercel

Import the repository with its root as the project root. `vercel.json` configures the `frontend/` and `backend/` services and routes `/api/*` requests to the backend.

Configure these environment variables for the backend service in Vercel:

- `DATABASE_URL` — Supabase PostgreSQL connection string.
- `JWT_SECRET` — a strong, unique secret.
- `RFID_DEVICE_KEY` — a strong, unique key for RFID device authentication.
- `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_SERVICE_ID`, and `EMAILJS_TEMPLATE_ID` — required for email OTP delivery.

Do not commit `.env` files or production credentials. Configure the frontend API URL for the deployed backend if it is hosted separately.

## Notes

- The frontend contains pages for product areas whose API routes are not all present in the current backend; those areas need backend implementation before they can work end-to-end.
- `backend/esp32-rfid-demo/` contains firmware examples for RFID hardware.
- This is a student project prototype, not a certified medical system or a substitute for professional medical advice.
