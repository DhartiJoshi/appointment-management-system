# Appointment Management System

A simple appointment management system built with **Node.js, Express.js, MongoDB (Mongoose) and React (Vite)**.

## Features

- Admin login with JWT authentication
- Doctor management: add, edit, delete, view (Active / Inactive status)
- Appointment management: add, view, edit, delete (View and Edit open in a modal, Delete asks for confirmation)
- Appointments only in 15-minute intervals; a doctor cannot have two appointments at the same date and time (validated on the backend)
- Search by patient name and mobile number
- Filters: doctor, status and date range (from - to)
- Dashboard: total doctors, total appointments, pending, completed and cancelled counts, with date range filter
- Form validation (frontend and backend) and global error handling

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Joi
- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS

## Folder Structure

```
appointment-management-system/
├── backend/
│   ├── config/         # database connection
│   ├── controllers/    # request logic
│   ├── middleware/     # JWT auth, validation, error handler
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── validators/     # Joi validation rules
│   ├── seed.js         # creates default admin and sample data
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/        # axios setup
│       ├── components/ # Navbar, Layout, Modal, forms
│       ├── context/    # auth state
│       └── pages/      # Login, Dashboard, Doctors, Appointments
└── database-export/    # JSON export of the database
```

## Prerequisites

- Node.js (v18 or later)
- A MongoDB database: MongoDB Atlas or a local MongoDB

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see `backend/.env.example`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
```

`MONGO_URI` works with MongoDB Atlas or a local MongoDB (for example `mongodb://127.0.0.1:27017/appointment_db`).

### 2. Load the data

Choose **one** option:

**Option A: seed script (recommended)**

```bash
npm run seed
```

This creates the default admin, 5 sample doctors and 3 sample appointments. It only adds sample data to an empty database.

**Option B: import the JSON export**

The `database-export/` folder contains `admins.json`, `doctors.json` and `appointments.json`. Import each into the matching collection of the `appointment_db` database, using MongoDB Compass (Import Data) or `mongoimport` with `--jsonArray`.

### 3. Run the backend

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 4. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env` (see `frontend/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## Default Admin Login

- **Email:** admin@example.com
- **Password:** Admin@123

## API Endpoints

All routes except login require the header `Authorization: Bearer <token>`.

| Method             | Endpoint              | Description                                       |
| ------------------ | --------------------- | ------------------------------------------------- |
| POST               | /api/auth/login       | Admin login, returns a JWT                        |
| GET / POST         | /api/doctors          | List / add doctors                                |
| GET / PUT / DELETE | /api/doctors/:id      | View / edit / delete a doctor                     |
| GET / POST         | /api/appointments     | List (with search and filters) / add appointments |
| GET / PUT / DELETE | /api/appointments/:id | View / edit / delete an appointment               |
| GET                | /api/dashboard        | Dashboard counts (optional `fromDate`, `toDate`)  |

Appointment list query params: `search`, `doctor`, `status`, `fromDate`, `toDate` (dates as `YYYY-MM-DD`).

## Notes and Assumptions

- Appointment status is **Pending** by default and can be changed to Completed or Cancelled when editing.
- Appointment time is stored in 24-hour `HH:mm` format and shown as AM/PM. Only `00`, `15`, `30` and `45` minutes are accepted.
- A cancelled appointment does not block its time slot.
- A doctor who has appointments cannot be deleted (set them to Inactive instead).
- Mobile number must be exactly 10 digits.
- Network access `0.0.0.0/0` on Atlas is used for development only; restrict IPs in production.
