# Healthcare Backend API

Healthcare Backend API is a Node.js and Express.js REST API for managing users, patients, doctors, and patient-doctor assignments. Authenticated users can manage their own patients, access the shared doctor directory, and assign doctors to their patients.

This repository is the Node.js/Express implementation of the WhatBytes healthcare backend assignment. It is not a Django or Django REST Framework project.

## Technology Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| Node.js | Runtime | Runs the backend |
| Express.js | `^5.3.0` | HTTP server and routing |
| PostgreSQL | Database | Persistent relational storage |
| Prisma ORM / Prisma Client | `^6.19.3` | Schema, migrations, and database queries |
| `jsonwebtoken` | `^9.0.3` | JWT creation and verification |
| `bcrypt` | `^6.0.0` | Password hashing and verification |
| `express-validator` | `^7.3.2` | Request validation |
| `dotenv` | `^18.0.9` | Environment-variable loading |
| `nodemon` | `^3.1.14` (development) | Automatic development-server restarts |

The package manifest also declares `cors`, `pg`, `pg-hstore`, and `sequelize`. The active application code uses Prisma Client for database access and does not register a separate CORS middleware or Sequelize connection.

## Features

- User registration and login.
- JWT-based authentication for protected routes.
- Password hashing with bcrypt.
- Patient CRUD operations with authenticated-user-specific access control.
- Doctor CRUD operations for authenticated users.
- Patient-doctor assignment and removal.
- Retrieval of all mappings and the doctors assigned to a specific patient.
- Request validation with `express-validator`.
- PostgreSQL persistence through Prisma ORM.
- Centralized error handling that avoids exposing internal database error details.

## Project Structure

The following is the committed application structure:

```text
healthcare-backend/
├── config/
│   └── prisma.js
├── controllers/
│   ├── authController.js
│   ├── doctorController.js
│   ├── mappingController.js
│   └── patientController.js
├── middleware/
│   └── authMiddleware.js
├── postman/
│   └── Healthcare-Backend-API-Tests.postman_collection.json
├── prisma/
│   ├── migrations/
│   │   ├── 20261028120531_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── routes/
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   ├── mappingRoutes.js
│   └── patientRoutes.js
├── validators/
│   ├── authValidator.js
│   ├── doctorValidator.js
│   ├── mappingValidator.js
│   └── patientValidator.js
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

Directory responsibilities:

- `config/` — shared Prisma Client configuration.
- `controllers/` — authentication, patient, doctor, and mapping business logic.
- `middleware/` — Bearer-token authentication middleware.
- `postman/` — exported Postman request collection for manual API verification.
- `prisma/` — PostgreSQL datasource, Prisma models, and committed migrations.
- `routes/` — Express route definitions and middleware wiring.
- `validators/` — `express-validator` rules for request bodies.

The repository does not contain a `docs/` directory or application model files under `models/`. Database models are defined in `prisma/schema.prisma`. Developers create `.env` locally; it is excluded by `.gitignore` and is not a committed project file.

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git
- Postman, if using the exported collection

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/saurabhk9919/Assignment---Whatbytes-.git
cd Assignment---Whatbytes-
```

If the checkout directory has a different local name, change into the directory containing `package.json`.

### 2. Install dependencies

```bash
npm install
```

### 3. Create the PostgreSQL database

Create a local PostgreSQL database named `healthcare_db`. For example:

```bash
createdb healthcare_db
```

Alternatively, run this SQL using a PostgreSQL client:

```sql
CREATE DATABASE healthcare_db;
```

### 4. Configure environment variables

Create a `.env` file in the project root using safe placeholders:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthcare_db?schema=public"
JWT_SECRET="replace_with_a_secure_random_secret"
JWT_EXPIRES_IN="1d"
```

`DATABASE_URL` is consumed by Prisma. `JWT_SECRET` is required for login and token verification. `JWT_EXPIRES_IN` controls the token lifetime and defaults to `1d` in the login controller when it is not set. `PORT` defaults to `5000`.

Never commit `.env`, real passwords, JWT secrets, database credentials, or other sensitive values. The repository excludes `.env` through `.gitignore`.

## Database Setup

Prisma is the active ORM, and [prisma/schema.prisma](prisma/schema.prisma) is the database schema definition. Generate the Prisma Client and apply the development migration:

```bash
npx prisma generate
npx prisma migrate dev
```

The repository contains this committed initial migration:

```text
prisma/migrations/20261028120531_init/migration.sql
```

For deployment or another environment where the committed migrations should be applied without creating a new migration:

```bash
npx prisma migrate deploy
```

The schema defines these models:

- `User` — registered users and hashed passwords.
- `Patient` — patient records owned by a user.
- `Doctor` — shared doctor records.
- `PatientDoctor` — unique patient-doctor assignments.

## Running the API

Development mode:

```bash
npm run dev
```

Normal start:

```bash
npm start
```

The API listens at `http://localhost:5000` by default, or at the port configured by `PORT`.

The root health endpoint is:

```http
GET /
```

Response:

```json
{
  "message": "Healthcare API is running"
}
```

## Authentication

Registration and login are public. Patient, doctor, and mapping routes require a valid Bearer JWT:

```http
Authorization: Bearer <token>
```

Requests without a token, with a malformed token, or with an expired token return `401 Unauthorized`.

## API Endpoints

The trailing slashes below match the route declarations. Express also handles the corresponding paths without a trailing slash.

### Authentication

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

Validation requires a non-empty name, a valid email address, and a password of at least eight characters. A successful registration returns `201 Created` without returning the password. An already-registered email returns `409 Conflict`.

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

A successful login returns `200 OK` with a JWT `token` and user details. Invalid credentials return `401 Unauthorized`.

### Patients

All patient endpoints require a Bearer JWT. Patient list, detail, update, and delete operations are restricted to records owned by the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/patients/` | Create a patient for the authenticated user |
| `GET` | `/api/patients/` | List the authenticated user's patients, newest first |
| `GET` | `/api/patients/:id/` | Get one of the authenticated user's patients |
| `PUT` | `/api/patients/:id/` | Update one of the authenticated user's patients |
| `DELETE` | `/api/patients/:id/` | Delete one of the authenticated user's patients |

Create-patient request body:

```json
{
  "name": "Ravi Kumar",
  "age": 42,
  "gender": "Male",
  "address": "12 Main Street",
  "phone": "555-0100"
}
```

`name` is required when creating a patient. `age` is optional and must be an integer from 0 through 130. `gender`, `address`, and `phone` are optional strings. Update fields are optional, but supplied values must pass the same field validation.

### Doctors

All doctor endpoints require a Bearer JWT. Doctors are shared resources in the current implementation and are not scoped to the user who created them.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/doctors/` | Create a doctor |
| `GET` | `/api/doctors/` | List all doctors, newest first |
| `GET` | `/api/doctors/:id/` | Get a doctor by ID |
| `PUT` | `/api/doctors/:id/` | Update a doctor |
| `DELETE` | `/api/doctors/:id/` | Delete a doctor |

Create-doctor request body:

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

All mapping endpoints require a Bearer JWT. A user can assign doctors only to their own patients.

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

Validation failures return `400 Bad Request`:

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

The centralized error handler also provides:

- `401 Unauthorized` for missing or invalid authentication tokens.
- `404 Not Found` for missing resources and unknown routes.
- `409 Conflict` for duplicate unique values or duplicate assignments.
- `500 Internal Server Error` for unexpected failures.

Unexpected database and application error details are logged server-side but are not returned to clients.

## Postman API Collection

The repository includes an exported collection for importing and manually trying the API endpoints:

```text
postman/Healthcare-Backend-API-Tests.postman_collection.json
```

The collection contains these request groups:

- Registration and login
- Patient CRUD requests
- Doctor CRUD requests
- Patient-doctor mapping requests, including creating a patient, listing doctors, assigning a doctor, listing mappings, listing a patient's doctors, and deleting a mapping

### Import and use the collection

1. Install and open Postman.
2. Download or clone this repository.
3. In Postman, click **Import**.
4. Select `postman/Healthcare-Backend-API-Tests.postman_collection.json`.
5. Start the API and configure the base URL as `http://localhost:5000` when using the default port. The exported requests currently contain the local URL directly.
6. Register a test user and log in.
7. Copy the JWT returned by login into the collection variable used by the protected requests.
8. Run the authenticated patient, doctor, and patient-doctor mapping requests with a valid token and IDs from the local database.

The protected requests in the exported JSON use `{{jwtToken}}` in their Authorization headers. The exported collection currently defines a different variable named `json_web_token_0fc6` and does not define `jwtToken`. Before running protected requests, either create a collection variable named `jwtToken` and set its value to the returned JWT, or update the requests to reference the existing variable. This documents the collection as it exists; no automatic variable synchronization is assumed.

The exported collection preserves request definitions only. It does not by itself prove that every request succeeds, and this repository does not claim saved successful response histories, automated assertions, or a collection-runner report unless they are produced separately.

Do not use real passwords, JWTs, database credentials, or other secrets in a collection that may be shared or committed.

## Postman Testing and Verification

The exported collection is provided for manual API verification. Run the backend, configure PostgreSQL and the local `.env`, apply the Prisma migration, and use a valid Bearer JWT for protected requests.

Automated tests are not included in the repository: [package.json](package.json) contains only the `start` and `dev` scripts, and no automated test files were found. The presence of the Postman collection does not mean that every request has been executed successfully or that a Postman collection-runner suite exists.

## Available npm Scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Run the server with nodemon |
| `npm start` | Run the server with Node.js |

