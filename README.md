# My Truck Update

## Technical Architecture Document

## 1. Overview

My Truck Update is a truck operations and maintenance tracking application designed to help individual truck owners and fleet managers record vehicle status, service events, and operational updates.

The system architecture is intentionally modular so that it can evolve from a simple dashboard-style web app into a production-ready fleet management platform with authentication, data persistence, reporting, and operational tooling.

## 2. Goals and Non-Goals

### Goals
- Track truck information and service history
- Provide a simple dashboard of current vehicle status
- Support operational updates and maintenance logging
- Maintain a clean and maintainable TypeScript codebase
- Provide a scalable foundation for future backend services
- Support future multi-user and fleet-level access patterns

### Non-Goals
- Full enterprise ERP integration in v1
- Real-time dispatch or GPS tracking at launch
- Advanced AI-based analytics without a backend foundation
- Multi-region, high-scale fleet systems in the initial release

## 3. Architectural Principles

- Separation of concerns between UI, business logic, and data access
- Type safety through TypeScript
- Modular component organization for maintainability
- Extensibility for future backend and database integration
- Secure handling of environment-specific configuration
- Simplicity first, with a path to scale

## 4. System Context

The application sits between users and truck operational data. Users interact with the system to create truck records, update statuses, and maintain service-related information. The app can be deployed in a local or production environment and can evolve to support fleet-scale workflows over time.

Actors:
- Truck owner
- Fleet manager
- Operations staff
- System administrator

Primary use cases:
- Create a truck profile
- Update vehicle status
- Log maintenance history
- Browse operational dashboard
- Review recent updates and service records

## 5. High-Level Architecture

At a high level, the architecture follows a layered model:

1. Presentation Layer
   - User interface components
   - Rendered pages and dashboard views
   - HTML, CSS, and TypeScript front-end assets

2. Application Layer
   - TypeScript modules for business flows
   - Validation logic
   - Service orchestration and state handling

3. Data Layer
   - Local storage or mock persistence (initially)
   - Future API and database integration

4. Integration Layer
   - External services, API endpoints, or third-party tools
   - Authentication providers in future versions

5. Deployment Layer
   - Development environment
   - Production build
   - Hosting and observability platform

## 6. Proposed Runtime Architecture

### Current State
The project is currently best described as a front-end TypeScript application. It likely renders pages and manages UI state in the browser, with app logic expressed as modular TypeScript functions and service abstractions.

### Target State
The target architecture is a web application with a clear separation of responsibilities:

- Frontend client
  - dashboard UI
  - truck management screens
  - service log and maintenance views

- API service layer
  - RESTful or GraphQL endpoints
  - validation and business rules
  - authentication middleware

- Data persistence layer
  - relational or document database
  - query layer for vehicle records and maintenance logs

- External services
  - email or notification system
  - analytics or reporting integrations
  - cloud hosting and CI/CD pipeline

## 7. Component Breakdown

### 7.1 UI Layer
Responsible for rendering interactive screens and accepting user actions.

Examples of likely UI modules:
- Dashboard screen
- Truck list view
- Truck detail screen
- Maintenance log screen
- Status update form
- Settings panel

Responsibilities:
- present data to users
- capture user input
- trigger application logic
- display success/error states

### 7.2 Application Layer
Responsible for logic that transforms user actions into domain operations.

Typical responsibilities:
- create/update/delete truck records
- schedule maintenance tasks
- validate fields and business rules
- aggregate status information for dashboard
- format records for display

### 7.3 Domain Model
Core entities expected in the system:

#### Truck
- id
- make
- model
- year
- vin
- status
- lastUpdated
- notes

#### MaintenanceRecord
- id
- truckId
- title
- description
- date
- type
- status
- createdAt

#### User
- id
- name
- email
- role
- createdAt

#### Fleet (future)
- id
- name
- memberIds
- vehicleIds

## 8. Data Flow

### User Flow: Create Truck
1. User opens the truck form.
2. User enters truck details.
3. UI validates input.
4. Application layer creates a truck record payload.
5. Data layer stores record.
6. UI refreshes list and dashboard data.

### User Flow: Log Maintenance
1. User selects a truck.
2. User enters maintenance details.
3. App validates schedule and status values.
4. Service layer stores maintenance record.
5. Dashboard updates with the new maintenance event.
6. User sees the record in the history timeline.

## 9. Technical Stack

### Frontend
- TypeScript
- HTML
- CSS
- JavaScript

### Build and Tooling
- Node.js
- npm or yarn
- TypeScript compiler
- Vite or equivalent bundler (likely, depending on implementation)

### Backend (planned)
- Node.js with TypeScript server
- REST API or GraphQL layer
- JWT or session-based auth

### Database (planned)
- PostgreSQL for relational data and auditing
- Optionally Redis for caching and queues

### Deployment (planned)
- CI/CD pipelines
- cloud hosting
- environment configuration via .env and secrets manager

## 10. Repository Layout

```bash
my-truck-update/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── app/
├── public/
│   └── assets/
├── styles/
├── tests/
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
├── .gitignore
├── LICENSE
└── docs/
```

## 11. Development Workflow

### Local Development
1. Clone repository
2. Install dependencies
3. Run dev server
4. Connect local UI to mock or API data
5. Validate core workflows

### Build Pipeline
1. Type-check TypeScript
2. Run linting and formatting
3. Run unit and integration tests
4. Build production bundle
5. Deploy to configured environment

## 12. Security Architecture

The system should adopt the following practices as it matures:

- enforce authentication for protected routes
- secure session and token handling
- validate all user input on both client and server
- protect API endpoints with authorization
- store secrets using environment variables or secret managers
- enforce CORS and request validation rules
- sanitize data before output to prevent injection vulnerabilities

## 13. Observability and Reliability

Important operational capabilities for future production deployment:

- request logging
- API error tracking
- application health checks
- performance metrics
- structured error reporting
- monitoring of background jobs and scheduled tasks

## 14. Scalability Considerations

The architecture is designed to grow with business needs:

- add more vehicle records without changing core UI workflows
- support multiple users and roles
- support fleet-level dashboards and reporting
- add notification workflows and scheduled reminders
- move from local persistence to a production database and API

### Horizontal Scaling
Future scalability can be supported by:
- stateless frontend hosting
- independent API services
- load-balanced application instances
- database clustering or replication

## 15. Risks and Constraints

- Initial implementation may not yet include backend persistence
- User roles and permissions need definition before multi-user rollout
- Data integrity rules must be enforced centrally
- API and database design must be planned before scaling the app
- Some features may require stronger error handling and reporting infrastructure

## 16. Future Architecture Roadmap

### Phase 1: Frontend Foundation
- TypeScript UI
- data models
- maintenance tracking flows
- local persistence or mock API responses

### Phase 2: Backend API
- REST endpoints
- authentication
- database integration
- validation middleware

### Phase 3: Fleet Management Features
- richer reporting
- reminders and alerts
- fleet dashboards
- user role management

### Phase 4: Production Hardening
- deployment automation
- observability
- security reviews
- performance optimization

## 17. Summary

My Truck Update is designed as a modular, TypeScript-driven application that can grow from a vehicle tracking dashboard into a production-grade fleet operations platform. The software architecture is intentionally simple at the start while providing a scalable foundation for persistence, APIs, analytics, and broader operational workflows.

The first version focuses on clarity and operational utility. The architecture provides a strong foundation for adding persistence, APIs, user management, analytics, and enterprise-grade deployment workflows over time.

## 18. Appendix: Example Runtime Flow

```text
User -> Frontend UI -> TypeScript Services -> Data Store / API -> Database
    |                  |                      |                 |
    |                  |                      |                 +-> persistence layer
    |                  |                      +-> validation/business rules
    |                  +-> state rendering + error handling
```

## 19. Appendix: Suggested Commands

```bash
npm install
npm run dev
npm run build
npm run test
```

## 20. Additional Repository Overview: My-track

# My-track

My-track is a full-stack TypeScript application for a logistics and order-management platform. The repository contains a backend API, a web dashboard, and a mobile application for drivers and users.

## Overview

This project is structured as a multi-service application:

- `backend/` — Hono-based API server, database layer, auth, business logic, and scheduled jobs
- `frontend/` — React + Vite web dashboard/admin UI
- `frontend-app/` — Expo + React Native mobile app for users and drivers

## Tech stack

### Backend
- TypeScript
- Hono
- MySQL via Drizzle ORM
- Better Auth
- JWT-based auth
- WebSockets for real-time updates
- Firebase Admin
- SMTP and SMS integrations
- Cron jobs for scheduled tasks
- File uploads and APK download support

### Web frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Radix UI primitives
- Recharts and map components

### Mobile app
- Expo
- React Native
- Expo Router
- Secure storage
- Notifications
- Location and image support
- Native mobile UI patterns

## Project structure

```text
My-track/
├── backend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── render.yaml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── frontend-app/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── package.json
│   └── app.json
├── .cpanel.yml
├── docker-compose.yml
├── build-frontend-to-backend.sh
├── README.md
└── package.json (if present at repo root)
```

## Main features

- Admin dashboard and management screens
- Driver, manager, and customer workflows
- Order creation and tracking
- Payments and wallet features
- Referral system
- Notifications and announcements
- Driver document onboarding
- Real-time WebSocket communication
- Secure authentication and user access controls
- Backend scheduled jobs for cleanup, fraud scans, and tier recalculation

## Backend responsibilities

The backend server is initialized in `backend/src/index.ts` and provides:

- `/health` health-check endpoint
- `/api/auth/*` authentication routes
- `/rpc/*` RPC API routes
- `/uploads/*` static file serving
- `/api/app/download-apk` for app package download
- SPA serving for built frontend assets

It also includes:

- database schema definitions under `backend/src/database/schema/`
- business logic under `backend/src/controllers/`
- middleware for auth, context, rate limiting, and IP restrictions
- jobs for scheduled maintenance under `backend/src/jobs/`

## Web app

The web frontend is a dashboard and management platform for operations staff. It includes pages for:

- admin dashboards and analytics
- user management
- manager views
- agent workflows
- referral setup and analytics
- order management
- wallet views
- announcements and app upload pages

## Mobile app

The mobile app is built with Expo and is used for order-related activities, onboarding, wallet management, and driver workflows.

Typical modules include:

- auth flow (login, onboarding, forgot password, registration)
- user home and wallet screens
- driver dashboards and assigned orders
- shared notifications and profile screens
- order tracking and payment flows

## Environment setup

### Backend

Create a `.env` file in `backend/` based on the values in `.env.example`.

Required configuration commonly includes:

- MySQL database settings
- JWT secret and expiry
- CORS origins
- SMTP settings
- SMS API credentials
- Chapa payment keys

### Web frontend

```bash
cd frontend
npm install
npm run dev
```

### Mobile app

```bash
cd frontend-app
npm install
npx expo start
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Production build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

## Deployment notes

The repository includes a `cPanel` deployment config in `.cpanel.yml` to deploy the backend and static frontend build to a hosting environment. It also creates upload directories and installs production dependencies.

## License

No explicit license file is present in the current repository snapshot, so the project may currently be unlicensed unless otherwise stated by the repository owner.

## Notes

This repo appears to be a private project and may have additional internal business logic not fully documented here. The codebase itself is the best source of truth for current functionality.

## Useful starting points

- `backend/src/index.ts` — server entry point
- `backend/src/config/env_config.ts` — environment config
- `backend/src/routes/_app.ts` — route registration
- `backend/src/database/schema/` — database schema definitions
- `frontend/src/pages/` — web app pages
- `frontend-app/app/` — mobile app navigation and screens

## Summary

My-track is a transport/logistics platform with a multi-role system for users, drivers, managers, and admins, combining a web dashboard, mobile application, and backend API into a single TypeScript monorepo-style setup.

## 21. License

This project is licensed under the MIT License. See the LICENSE file for details.
