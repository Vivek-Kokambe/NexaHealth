# SmartCare Health Network
> **“Connected Care. Smarter Health.”**

[![Platform Status](https://img.shields.io/badge/System-Active%20Prototype-success)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node%20%2B%20Express%20%2B%20MongoDB-blue)](#)
[![Compliance](https://img.shields.io/badge/Notice-Student%20Project%20Prototype-amber)](#)

SmartCare Health Network is a unified, modern, and responsive full-stack healthcare web application connecting **Patients**, **Doctors**, **Hospitals**, and **Administrators**.

Patients receive a unique digital **Smart Card ID** (`SCN-YYYY-XXXXXX`) that unifies their medical identities, lets them book appointments in real time, check their hospital queue position with live wait-time telemetry, and carry their encrypted medical timeline across hospitals without paperwork.

---

## 🌟 Key Features

### 1. Patient Portal
- **Unique Smart Card Minting**: Automated issuance of `SCN-YYYY-XXXXXX` with simulated QR code and microchip interface.
- **Physical-style Digital Card**: Copy Smart Card ID, download/print pass, and report lost card.
- **Appointment Booking Wizard**: 4-step wizard to search accredited hospitals, select specialists, choose time slots, and obtain an instant confirmation number (`APT-2026-XXXX`).
- **Live Queue Tracking**: Real-time waiting position and estimated wait time countdown synchronized via Socket.IO.
- **Digital Medical Timeline**: Chronological history of past encounters, vital signs (blood pressure, heart rate, temperature, SpO2), electronic prescriptions (Rx), and lab reports.
- **Summary Export**: Print clinical summary with formatted print styles.

### 2. Doctor Portal
- **Daily OPD Roster**: Overview of today's appointments and live waiting lounge count.
- **Live Patient Queue Control**: Advance queue states (`Checked In` → `Waiting` → `In Consultation` → `Completed` / `No-Show`).
- **Patient Lookup by Smart Card ID**: Fast clinical lookup with visible regulatory audit consent warnings and emergency trauma bypass.
- **Consultation & Rx Workbench**: Record diagnoses, symptoms, vitals, multi-medication dosage prescriptions, and follow-up recommendations.

### 3. Hospital Portal
- **Hospital Administration**: Manage departments, facilities, operating hours, and ICU bed availability.
- **Specialist Roster**: Overview of credentialed physicians and daily duty hours.
- **Queue Overview**: Live outpatient footfall and check-in feed.
- **Hospital Analytics**: Recharts visualizations for department volume and average wait times.

### 4. Administrator Command Center
- **System Dashboard**: Metrics on users, issued Smart Cards, active doctors, and partner hospitals.
- **Credentialing Approvals**: Approve or reject new hospital accreditations and doctor medical licenses.
- **User Management**: Filter users by role and activate or suspend accounts.
- **Compliance Audit Trail**: Timestamped logs of every medical record access, login, and administrative action.
- **Grievance Desk**: Support ticket resolution queue.

---

## 🔑 Demo Login Accounts

SmartCare comes pre-seeded with realistic fictional demo accounts. In the UI, you can use the **floating Demo Role Switcher** in the bottom right corner or sign in manually with these credentials:

| Role | Name / Organization | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Rajesh Mehta | `admin@smartcare.org` | `admin123` | Platform Chief Superadmin |
| **Patient 1** | Vivek Kokambe | `vivek.kokambe@example.com` | `patient123` | Smart Card: `SCN-2026-104582` (Blood: `A+`) |
| **Patient 2** | Priya Patel | `priya.patel@example.com` | `patient123` | Smart Card: `SCN-2026-209841` (Blood: `B+`) |
| **Patient 3** | Amit Verma | `amit.verma@example.com` | `patient123` | Smart Card: `SCN-2026-384712` (Blood: `A+`) |
| **Doctor 1** | Dr. Ananya Sen | `dr.ananya.sen@smartcare.org` | `doctor123` | Cardiology • Apollo Central Hospital |
| **Doctor 2** | Dr. Vikram Malhotra | `dr.vikram.malhotra@smartcare.org` | `doctor123` | Neurology • Max Super Specialty |
| **Doctor 3** | Dr. Sneha Reddy | `dr.sneha.reddy@smartcare.org` | `doctor123` | Pediatrics • Fortis Memorial |
| **Hospital 1** | Apollo Central Hospital | `apollo@smartcare.org` | `hospital123` | Andheri East, Mumbai |
| **Hospital 2** | Max Super Specialty Hospital | `max@smartcare.org` | `hospital123` | Sector 17, Vashi, Navi Mumbai |
| **Hospital 3** | Fortis Memorial Research Inst. | `fortis@smartcare.org` | `hospital123` | Mulund West, Mumbai |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - React Router DOM v6
  - Tailwind CSS (Navy `#1F2C8F`, Secondary `#2563EB`, Teal `#0F766E`, Light `#EFF6FF`)
  - Recharts for dashboard analytics
  - Lucide React icons
  - QRCode.react for simulated Smart Card verification
  - Socket.IO client for live queue telemetry
  - Axios HTTP client with JWT interceptor

- **Backend**:
  - Node.js & Express.js
  - MongoDB with Mongoose Schemas (`User`, `Patient`, `Doctor`, `Hospital`, `Appointment`, `MedicalRecord`, `Notification`, `AuditLog`)
  - **Zero-Friction Fallback**: Built-in mock in-memory data store activates automatically if local MongoDB is not running (`USE_MOCK_DB=true`).
  - JWT Authentication & bcrypt password hashing
  - Socket.IO Server for live queue broadcasting
  - Helmet, Morgan, and Express-Rate-Limit security middleware

---

## 🚀 Quick Start & Run Instructions

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)
- (Optional) MongoDB (if running with real local database instance)

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
*The server will start on port `5000`. If local MongoDB is not running, it gracefully falls back to the pre-loaded in-memory store so you can start testing immediately!*

### 2. (Optional) Seed Real MongoDB Database
```bash
cd server
npm run seed
```

### 3. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## ☁️ Deploy to Vercel

The root `vercel.json` configures the `client` and `server` directories as separate services and routes `/api/*` requests to Express. Import the repository into Vercel with the repository root (`./`) as the project root; do not create separate Vercel projects for the two folders.

Before deploying, create a MongoDB Atlas database and add the following environment variable in Vercel's project settings for every deployment environment:

| Variable | Value |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas connection string |

Allow Vercel's outbound connections in the Atlas network access settings. Do not set `USE_MOCK_DB=true`: Vercel functions are temporary and in-memory data is not persistent. The API returns an error if the database is not configured or reachable.

To load the demo accounts into a new, empty Atlas database, set the same `MONGODB_URI` in `server/.env` and run `npm run seed` from `server` before deploying. The seed command deletes existing records first; do not run it against a database containing data you need to keep.

The Express API deploys as serverless functions. Socket.IO's persistent live queue updates remain available for local development but are disabled on Vercel, whose serverless functions do not support this persistent WebSocket server.

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` - Register Patient, Doctor, or Hospital (auto-generates Smart Card ID)
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Get current session profile & role data
- `POST /api/auth/forgot-password` - Request password recovery token
- `POST /api/auth/reset-password` - Reset password

### Patients
- `GET /api/patients/profile` - Get patient demographics and emergency contacts
- `PUT /api/patients/profile` - Update patient details & allergies
- `GET /api/patients/smart-card` - Get Smart Card pass details
- `GET /api/patients/medical-records` - Get patient clinical timeline
- `GET /api/patients/appointments` - Get upcoming & past appointments
- `GET /api/patients/queue` - Get live queue position & wait-time telemetry

### Doctors
- `GET /api/doctors` - Public directory with filters (specialization, hospital, rating)
- `GET /api/doctors/:id` - Doctor profile and OPD schedule slots
- `GET /api/doctors/appointments` - Today's appointment schedule
- `PUT /api/doctors/appointments/:id/status` - Advance queue status
- `GET /api/doctors/patients/:smartCardId` - Query patient history by Smart Card token
- `POST /api/doctors/medical-records` - Record consultation, vitals, Rx, and follow-up

### Hospitals
- `GET /api/hospitals` - Public hospital directory with city/department filters
- `GET /api/hospitals/:id` - Hospital details, facilities, and attending roster
- `GET /api/hospitals/:id/doctors` - Hospital doctor list
- `GET /api/hospitals/:id/appointments` - Hospital appointments feed
- `GET /api/hospitals/:id/analytics` - Hospital bed occupancy & queue telemetry

### Appointments
- `POST /api/appointments` - Reserve appointment slot
- `GET /api/appointments/:id` - Appointment details
- `DELETE /api/appointments/:id` - Cancel appointment
- `POST /api/appointments/:id/check-in` - Check in with Smart Card token & join live queue

### Admin
- `GET /api/admin/dashboard` - Platform KPI counters and analytics charts
- `GET /api/admin/users` - User directory
- `PUT /api/admin/users/:id/status` - Suspend or activate user account
- `PUT /api/admin/hospitals/:id/approve` - Approve or reject hospital registration
- `PUT /api/admin/doctors/:id/approve` - Approve or reject doctor credentials
- `GET /api/admin/audit-logs` - Platform compliance audit trail

---

## ⚖️ Disclaimer & Compliance Notice
> **Notice**: SmartCare Health Network is developed as a student project prototype and engineering demonstrator. It is not a certified medical device and should not be used for emergency medical diagnosis. Fictional demo accounts are provided for demonstration purposes.
