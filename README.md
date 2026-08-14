## Name: ForgeIQ Backend

ForgeIQ is an industrial intelligence and predictive maintenance platform designed to help manufacturers monitor machine health, identify potential problems, reduce unexpected downtime, and improve overall machine performance.

This repository contains the backend service for the ForgeIQ platform.

## Live URL:

<!-- Live link Here--- -->

## 🚀 Overview

The ForgeIQ backend provides the server-side foundation for the application, including:

- REST API development
- User authentication and authorization
- User and role management
- Machine and industrial asset management
- Predictive maintenance data processing
- System health and status endpoints
- Database integration
- Secure request validation
- Error handling and HTTP response management

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Package Manager:** pnpm
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** Zod
- **Authentication:** JSON Web Token (JWT)
- **Password Hashing:** bcryptjs
- **CORS:** cors
- **Cookie Handling:** cookie-parser
- **HTTP Status:** http-status

## 📁 Project Structure

```text
forgeiq-backend/
├── prisma/
│   ├── schema/
│   │   └── ...
│   └── prisma.config.ts
│
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── machine/
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── config/
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

> The exact folder structure may evolve as new ForgeIQ modules are added.

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd forgeiq-backend
```

### 2. Install dependencies

Using pnpm:

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/forgeiq"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

NODE_ENV="development"
```

Never commit the real `.env` file to Git.

### 4. Generate Prisma Client

```bash
pnpm exec prisma generate
```

### 5. Run database migrations

```bash
pnpm exec prisma migrate dev
```

## ▶️ Running the Server

### Development

```bash
pnpm dev
```

The backend will normally be available at:

```text
http://localhost:5000
```

### Production

Build the project:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## 🩺 Root Endpoint

The root endpoint provides a ForgeIQ-branded server status page.

```http
GET /
```

Example:

```text
http://localhost:5000/
```

The page displays:

- ForgeIQ logo
- Backend Server title
- Industrial intelligence description
- Server running status
- API status
- Environment status
- Overall health status

## 🔐 Authentication

ForgeIQ uses JWT-based authentication.

Typical authentication flow:

```text
Register
   ↓
Login
   ↓
Access Token
   ↓
Protected API
   ↓
Authorization Middleware
   ↓
Controller
```

Authentication-related endpoints can include:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## 👤 User Management

ForgeIQ supports role-based user management.

Example user roles:

- `ADMIN`
- `MANAGER`
- `ENGINEER`
- `VIEWER`

Example user states:

- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`

The exact roles and statuses are defined by the Prisma schema.

## 🏭 Industrial Asset Management

The backend is designed to support industrial assets such as:

- Machines
- Production lines
- Sensors
- Facilities
- Equipment
- Maintenance records

Example API structure:

```text
/api/v1/machines
/api/v1/machines/:id
/api/v1/sensors
/api/v1/maintenance
```

## 🤖 Predictive Maintenance

ForgeIQ is designed around predictive maintenance.

The backend can provide the foundation for collecting and processing:

- Machine sensor readings
- Temperature
- Vibration
- Pressure
- Operating hours
- Energy consumption
- Failure events
- Maintenance history
- Machine health scores

A future predictive-maintenance workflow can look like:

```text
Sensor Data
     ↓
Data Collection
     ↓
Backend API
     ↓
Data Processing
     ↓
AI / ML Model
     ↓
Failure Prediction
     ↓
Risk Score
     ↓
Maintenance Alert
```

## 🗄️ Database

ForgeIQ uses Prisma as the ORM.

Common Prisma commands:

### Generate client

```bash
pnpm exec prisma generate
```

### Create development migration

```bash
pnpm exec prisma migrate dev
```

### Check database

```bash
pnpm exec prisma studio
```

### Format schema

```bash
pnpm exec prisma format
```

## 🔒 Security

The backend follows common API security practices, including:

- Password hashing with bcryptjs
- JWT authentication
- Role-based authorization
- Environment-based secrets
- Request validation with Zod
- CORS configuration
- HTTP-only cookies where appropriate
- Centralized error handling
- Input validation
- Protected routes

## 🧪 API Development

API routes should follow a consistent structure:

```text
Route
  ↓
Validation
  ↓
Authentication
  ↓
Authorization
  ↓
Controller
  ↓
Service
  ↓
Database
```

This keeps business logic separated from HTTP and database concerns.

## 📡 API Versioning

ForgeIQ APIs are organized under a versioned prefix:

```text
/api/v1
```

Example:

```text
/api/v1/users
/api/v1/machines
/api/v1/maintenance
/api/v1/auth
```

API versioning makes it easier to introduce future API changes without breaking existing clients.

## 🌐 CORS

The backend supports Cross-Origin Resource Sharing so that the ForgeIQ frontend can communicate with the API.

During development, the frontend and backend may run on different ports.

Example:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:5000
```

The production CORS origin should be configured through environment variables rather than hard-coded.

## 📦 Useful Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build application
pnpm build

# Start production server
pnpm start

# Generate Prisma Client
pnpm exec prisma generate

# Create Prisma migration
pnpm exec prisma migrate dev

# Open Prisma Studio
pnpm exec prisma studio

# Format Prisma schema
pnpm exec prisma format
```

## 🧭 Development Roadmap

### Phase 1 — Backend Foundation

- [x] Express server
- [x] TypeScript configuration
- [x] CORS configuration
- [x] Environment configuration
- [x] ForgeIQ root server page
- [ ] Global error handler
- [ ] API response utilities

### Phase 2 — Authentication

- [ ] User registration
- [ ] User login
- [ ] JWT access token
- [ ] Refresh token
- [ ] Logout
- [ ] Protected routes
- [ ] Role-based authorization

### Phase 3 — User Management

- [ ] User profile
- [ ] User update
- [ ] Admin user management
- [ ] User status management
- [ ] Role management

### Phase 4 — Industrial Management

- [ ] Machine management
- [ ] Sensor management
- [ ] Production line management
- [ ] Maintenance records
- [ ] Machine health monitoring

### Phase 5 — Predictive Intelligence

- [ ] Sensor data ingestion
- [ ] Machine health scoring
- [ ] Failure-risk calculation
- [ ] Predictive maintenance alerts
- [ ] AI/ML integration
- [ ] Prediction history

### Phase 6 — Production

- [ ] API documentation
- [ ] Automated testing
- [ ] Logging
- [ ] Monitoring
- [ ] Rate limiting
- [ ] Deployment
- [ ] CI/CD

## 🎯 Project Goal

The long-term goal of ForgeIQ is to provide an intelligent industrial platform that helps organizations move from reactive maintenance to proactive and predictive maintenance.

```text
Traditional Maintenance
        ↓
Unexpected Failure
        ↓
Production Downtime
        ↓
High Maintenance Cost

ForgeIQ
        ↓
Continuous Monitoring
        ↓
Intelligent Analysis
        ↓
Early Warning
        ↓
Predictive Maintenance
        ↓
Reduced Downtime
```

## 👨‍💻 Development

ForgeIQ is being developed as a portfolio-grade industrial software project with a focus on:

- Clean architecture
- Scalable backend design
- Secure authentication
- Modern TypeScript development
- Database integrity
- RESTful API design
- Industrial IoT concepts
- AI-assisted predictive maintenance

## 📄 License

This project is currently intended for educational, portfolio, and demonstration purposes.

Add an appropriate open-source license before distributing the project publicly.
