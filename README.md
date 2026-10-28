# Healthcare Backend API

Healthcare Backend API is a Node.js and Express.js REST API for managing users, patients, doctors, and patient-doctor assignments. Authenticated users can manage their own patients, access the shared doctor directory, and assign doctors to their patients.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express.js `^5.3.0` | HTTP server and routing |
| PostgreSQL | Relational database |
| Prisma ORM / Prisma Client `^6.19.3` | Database schema, migrations, and queries |
| JSON Web Token `^9.0.3` | Authentication tokens |
| bcrypt `^6.0.0` | Password hashing and verification |
| express-validator `^7.3.2` | Request validation |
| dotenv `^18.0.9` | Loading environment variables |
| nodemon `^3.1.14` | Development-time server restarts |

The project is configured for PostgreSQL through Prisma's `DATABASE_URL` datasource. The package manifest also declares `cors`, `pg`, `pg-hstore`, and `sequelize`; the active application code uses Prisma Client for database access and does not register a separate CORS middleware.

## Features

- User registration and login.
- JWT-based authentication for protected API routes.
- Password hashing with bcrypt before passwords are stored.
- Patient CRUD operations with authenticated-user-specific access control.
- Doctor CRUD operations for authenticated users.
- Assign doctors to patients owned by the authenticated user.
- Retrieve all assignments or the doctors assigned to a specific patient.
- Remove patient-doctor assignments.
- Input validation with `express-validator`.
- Centralized error handling for unexpected errors and common Prisma errors.
- PostgreSQL persistence managed with Prisma ORM.
- Duplicate unique values return a conflict response instead of exposing database internals.

## Project Structure

```text
healthcare-backend/
├── config/
│   └── prisma.js                 # Shared Prisma Client instance
├── controllers/
│   ├── authController.js         # Registration and login logic
│   ├── doctorController.js       # Doctor CRUD logic
│   ├── mappingController.js      # Patient-doctor assignment logic
│   └── patientController.js      # Patient CRUD logic
├── middleware/
│   └── authMiddleware.js         # Bearer-token authentication
├── prisma/
│   ├── migrations/
│   │   └── 20261028120531_init/  # Initial database migration
│   └── schema.prisma             # Prisma models and PostgreSQL datasource
├── routes/
│   ├── authRoutes.js             # Public authentication routes
│   ├── doctorRoutes.js           # Protected doctor routes
│   ├── mappingRoutes.js          # Protected assignment routes
│   └── patientRoutes.js          # Protected patient routes
├── validators/
│   ├── authValidator.js
│   ├── doctorValidator.js
│   ├── mappingValidator.js
│   └── patientValidator.js       # Request validation rules
├── .env                          # Local environment variables (not committed)
├── .gitignore
├── package.json
├── package-lock.json
├── schema.sql                    # SQL schema reference
└── server.js                     # Express application entry point
```

The `models/` directory is present in the repository but contains no application model files; database models are defined in `prisma/schema.prisma`.

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/saurabhk9919/Assignment---Whatbytes-.git
cd Assignment---Whatbytes-
```

If the repository directory has a different local name, change into the directory that contains `package.json`.

### 2. Install dependencies

```bash
npm install
```

### 3. Create the PostgreSQL database

Create a PostgreSQL database named `healthcare_db`. For example, using `psql`:

```bash
createdb healthcare_db
```

Alternatively, run this statement in a PostgreSQL client while connected to a database where you have permission to create databases:

```sql
CREATE DATABASE healthcare_db;
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthcare_db?schema=public"
JWT_SECRET="replace_with_a_secure_random_secret"
JWT_EXPIRES_IN="1d"
```

`JWT_SECRET` is required for login and token verification. `JWT_EXPIRES_IN` defaults to `1d` in the login controller when it is not set. `PORT` defaults to `5000` when it is not set.

**Never commit `.env`, database credentials, JWT secrets, or any other real secrets.** The repository's `.gitignore` excludes `.env`.

## Database Setup

Generate the Prisma Client and run the database migration:

```bash
npx prisma generate
npx prisma migrate dev
```

This repository already contains an initial migration at `prisma/migrations/20261028120531_init/`.

For deployment or another environment where migrations have already been created, apply committed migrations without creating new ones:

```bash
npx prisma migrate deploy
```

The Prisma schema contains these models:

- `User`: registered users and hashed passwords.
- `Patient`: patient records owned by a user.
- `Doctor`: shared doctor records.
- `PatientDoctor`: unique patient-doctor assignments.

## Running the API

Start the server in development mode with automatic restarts:

```bash
npm run dev
```

Start the server normally:

```bash
npm start
```

The API listens on `http://localhost:5000` by default, or on the port configured by `PORT`.

The root health response is available at:

```text
GET /
```

Expected response:

```json
{
  "message": "Healthcare API is running"
}
```

## Authentication

Register or log in through the public authentication endpoints. Login returns a JWT:

```http
Authorization: Bearer <token>
```

Include this header on every `/api/patients`, `/api/doctors`, and `/api/mappings` request. Requests without a token, with a malformed token, or with an expired token return `401 Unauthorized`.

## API Endpoints

Trailing slashes shown below match the route declarations. Express also handles the corresponding route without a trailing slash.

### Authentication

These endpoints are public.

#### Register

```http
POST /api/auth/register/
Content-Type: application/json
```

Request body:

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "securepassword"
}
```

Validation requires a non-empty name, a valid email address, and a password of at least 8 characters. A successful registration returns `201 Created` and excludes the password from the response. An already-registered email returns `409 Conflict`.

#### Login

```http
POST /api/auth/login/
Content-Type: application/json
```

Request body:

```json
{
  "email": "asha@example.com",
  "password": "securepassword"
}
```

A successful login returns `200 OK` with `token` and user details. Invalid credentials return `401 Unauthorized`.

### Patients

All patient endpoints require a Bearer token. Patient list, detail, update, and delete operations are restricted to patients owned by the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/patients/` | Create a patient for the authenticated user |
| `GET` | `/api/patients/` | List the authenticated user's patients, newest first |
| `GET` | `/api/patients/:id/` | Get one of the authenticated user's patients |
| `PUT` | `/api/patients/:id/` | Update one of the authenticated user's patients |
| `DELETE` | `/api/patients/:id/` | Delete one of the authenticated user's patients |

Patient create/update fields:

```json
{
  "name": "Ravi Kumar",
  "age": 42,
  "gender": "Male",
  "address": "12 Main Street",
  "phone": "555-0100"
}
```

`name` is required when creating a patient. `age` is optional and must be an integer from 0 through 130. The remaining fields are optional strings. Update fields are optional, but supplied values must pass the same field validation.

### Doctors

All doctor endpoints require a Bearer token. Doctors are not scoped to the creating user in the current implementation.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/doctors/` | Create a doctor |
| `GET` | `/api/doctors/` | List all doctors, newest first |
| `GET` | `/api/doctors/:id/` | Get a doctor by ID |
| `PUT` | `/api/doctors/:id/` | Update a doctor |
| `DELETE` | `/api/doctors/:id/` | Delete a doctor |

Doctor create/update fields:

```json
{
  "name": "Dr. Meera Patel",
  "specialization": "Cardiology",
  "email": "meera.patel@example.com",
  "phone": "555-0110"
}
```

`name` and `specialization` are required when creating a doctor. `email` and `phone` are optional; when supplied, `email` must be valid and is unique when not null. Update fields are optional.

### Patient-doctor mappings

All mapping endpoints require a Bearer token. A user can assign doctors only to their own patients.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/mappings/` | Assign a doctor to one of the user's patients |
| `GET` | `/api/mappings/` | List the user's patient-doctor assignments |
| `GET` | `/api/mappings/:patient_id/` | List doctors assigned to one of the user's patients |
| `DELETE` | `/api/mappings/:id/` | Remove an assignment owned through the user's patient |

Create-mapping request body:

```json
{
  "patientId": 1,
  "doctorId": 2
}
```

Both IDs must be positive integers. Assigning the same doctor to the same patient twice returns `409 Conflict`.

## Validation and Error Responses

Validation failures return `400 Bad Request` with a consistent shape:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "A valid email is required"
    }
  ]
}
```

The server also provides:

- `401 Unauthorized` for missing or invalid authentication tokens.
- `404 Not Found` for missing resources and unknown routes.
- `409 Conflict` for duplicate unique values or duplicate assignments.
- `500 Internal Server Error` for unexpected failures. Internal error details are logged by the server and are not sent to clients.

## Available npm Scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Run the server with nodemon |
| `npm start` | Run the server with Node.js |

