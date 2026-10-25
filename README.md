# NexaHealth

NexaHealth is a healthcare web application prototype with a React frontend and an Express API backed by Supabase PostgreSQL through Prisma.

## Project structure

- `frontend/` — React, Vite, and Tailwind CSS application.
- `backend/` — Express API, Prisma schema and migrations, and RFID device demos.

The API provides patient registration with email OTP verification, login, session/profile lookup, patient smart-card lookup, RFID pairing, staff-only patient card lookup, hospital registration and review, hospital profile management, and patient-to-hospital appointment requests. Other frontend screens may represent functionality that is not yet implemented by this API.

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

   To provision an administrator, set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters in `backend/.env`, then run `npm run create:admin` from `backend`.

3. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5001`; set `NEXAHEALTH_API_URL` in the frontend environment to use a different local API URL.

## Hospital registration and appointments

Hospitals can apply at `/hospital/register`. Applications are pending until an administrator reviews them. The hospital portal supports department and facility updates, bed-capacity settings, appointment-request review, and dashboard counts. Patients can request an appointment with an approved hospital; the requested date and time are preferences until the hospital confirms the request.

The related API routes are:

- `POST /api/hospitals/register/request` and `POST /api/hospitals/register/verify` — verify an email and submit a hospital application.
- `GET /api/admin/hospitals` and `PATCH /api/admin/hospitals/:hospitalId/review` — administrator review of hospital applications.
- `GET /api/hospitals/me`, `GET /api/hospitals/me/analytics`, and `PATCH /api/hospitals/me/services` — current hospital profile, dashboard data, and service settings.
- `POST /api/appointments`, `GET /api/patients/appointments`, and `DELETE /api/appointments/:appointmentId` — patient appointment requests.
- `GET /api/hospitals/appointments` and `PATCH /api/hospitals/appointments/:appointmentId` — hospital appointment management.

Apply the migrations in `backend/prisma/migrations` before using these endpoints. Bed fields represent capacity; occupancy and average wait-time metrics are not collected by the current database.

## Deploy to Vercel

Import the repository with its root as the project root. `vercel.json` configures the `frontend/` and `backend/` services and routes `/api/*` requests to the backend.

Configure these environment variables for the backend service in Vercel:

- `DATABASE_URL` — Supabase PostgreSQL connection string.
- `JWT_SECRET` — a strong, unique secret.
- `RFID_DEVICE_KEY` — a strong, unique key for RFID device authentication.
- `EMAILJS_PUBLIC_KEY`, `EMAILJS_PRIVATE_KEY`, `EMAILJS_SERVICE_ID`, and `EMAILJS_TEMPLATE_ID` — required for email OTP delivery.

Do not commit `.env` files or production credentials. Configure the frontend API URL for the deployed backend if it is hosted separately.

## Notes

- Patient card lookup is restricted by the backend to authenticated doctor, hospital/staff, and admin accounts. RFID, QR, and manual Smart Card lookups are logged in `PatientInfoAccessLog`.
- Apply the new patient information access-log migration with `npx prisma migrate deploy` from `backend` before using the lookup feature.
- The frontend contains pages for product areas whose API routes are not all present in the current backend; those areas need backend implementation before they can work end-to-end.
- `backend/esp32-rfid-demo/` contains RFID firmware and [ESP32 + RC522 setup instructions](./backend/esp32-rfid-demo/README.md).
- RFID cards are identified by their UID only; UIDs can be cloned and must not be used alone to authorize access to medical records.
- This is a student project prototype, not a certified medical system or a substitute for professional medical advice.
