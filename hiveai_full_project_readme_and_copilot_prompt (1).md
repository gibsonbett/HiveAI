# HiveAI

## AI Data Annotation & Task Marketplace Platform

HiveAI is a scalable AI training, annotation, and workforce management platform inspired by systems like Remotasks, Scale AI workflows, and modern RLHF operations.

The platform enables:
- Task creation and management
- AI data annotation workflows
- Workforce onboarding and qualification
- Contributor payments via Safaricom M-Pesa Till Number
- Reviewer and admin quality pipelines
- Real-time analytics
- Project management
- Multi-role authentication
- AI evaluation workflows
- RLHF-compatible review systems
- Enterprise-ready APIs

---

# 1. Project Vision

HiveAI is designed to become a distributed AI workforce platform where:

- Clients upload AI training projects.
- Workers complete annotation/evaluation tasks.
- Reviewers validate work.
- Admins manage payouts, fraud prevention, and quality scoring.
- Payments are automated through Safaricom Daraja APIs.

The architecture should support:
- Tens of thousands of concurrent users
- Modular task systems
- Future AI integrations
- Horizontal scaling
- Microservice migration readiness

---

# 2. Technology Stack

## Frontend

- Nuxt 3
- Vue 3 Composition API
- Vite
- Pinia
- VueUse
- Tailwind CSS
- PrimeVue
- Vue Query / TanStack Query
- Socket.IO Client
- Chart.js or ECharts
- Zod validation
- TypeScript

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Redis
- BullMQ
- Multer
- Cloudinary or AWS S3
- Winston logger
- Helmet
- Rate limiting middleware
- Express Validator / Zod

## Payments

- Safaricom Daraja API
- STK Push
- B2C payments
- Till Number support
- Callback processing
- Transaction reconciliation

## DevOps

- Docker
- Docker Compose
- Nginx
- PM2
- GitHub Actions
- MongoDB Atlas
- Redis Cloud
- Vercel (frontend)
- Railway/Render/AWS/DigitalOcean (backend)

---

# 3. System Architecture

## High-Level Architecture

Frontend (Nuxt 3)
↓
API Gateway (Express)
↓
Core Services
- Authentication Service
- Task Service
- Review Service
- Payment Service
- Analytics Service
- Notification Service
- File Upload Service
↓
MongoDB + Redis
↓
External Services
- Daraja API
- Email Provider
- SMS Provider
- Cloud Storage

---

# 4. User Roles

## 1. Admin

Permissions:
- Manage users
- Manage projects
- Configure payouts
- Configure task templates
- Manage disputes
- Access analytics
- Ban users
- Fraud review
- Payment approvals
- Manual adjustments

## 2. Client

Permissions:
- Create AI projects
- Upload datasets
- Track project performance
- Monitor workforce
- Download outputs
- Configure task workflows
- Approve completed batches

## 3. Worker

Permissions:
- Complete tasks
- Take qualification tests
- Track earnings
- Withdraw funds
- View leaderboard
- Submit appeals

## 4. Reviewer

Permissions:
- Review completed tasks
- Approve/reject work
- Score quality
- Flag fraud
- Escalate disputes

---

# 5. Core Features

# Authentication System

## Features
- Email/password login
- Phone number login
- Social login (optional)
- JWT access tokens
- Refresh tokens
- Session management
- Role-based access control
- 2FA support
- Device tracking
- Suspicious login detection

## Required APIs

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify

---

# Worker Onboarding System

## Features
- KYC verification
- ID upload
- Skills assessment
- Qualification exams
- Language proficiency tests
- NDA acceptance
- Tax information
- Payment setup

## Qualification Flow

1. User registers
2. Completes profile
3. Uploads verification docs
4. Takes training
5. Takes qualification test
6. Gets approved
7. Receives task access

---

# Task Management System

## Task Types

### Image Annotation
- Bounding boxes
- Segmentation
- Keypoint labeling
- OCR annotation
- Classification

### Text Tasks
- Sentiment analysis
- Toxicity moderation
- AI response ranking
- RLHF comparison
- Text categorization

### Audio Tasks
- Transcription
- Speaker labeling
- Translation
- Audio classification

### Video Tasks
- Frame annotation
- Object tracking
- Event detection

### AI Evaluation Tasks
- Chatbot evaluation
- Prompt scoring
- Hallucination detection
- Response ranking
- Safety review

---

# Task Workflow Pipeline

## Standard Flow

Client Creates Project
↓
Dataset Upload
↓
Task Generation
↓
Worker Assignment
↓
Task Completion
↓
Reviewer Validation
↓
Quality Check
↓
Approval/Rejection
↓
Payment Queue
↓
Worker Payment

---

# Task Assignment Logic

## Assignment Factors
- Worker accuracy score
- Skill tags
- Language
- Speed score
- Fraud score
- Task history
- Reviewer confidence
- Region

## Anti-Fraud Logic
- VPN detection
- Duplicate accounts
- Device fingerprinting
- Speed anomaly detection
- Copy-paste detection
- Random audits
- Hidden gold-standard tasks

---

# Review System

## Multi-Level Review

Level 1:
- Automated validation

Level 2:
- Human reviewer

Level 3:
- Senior reviewer

Level 4:
- Admin arbitration

## Review Metrics
- Accuracy
- Speed
- Consistency
- Agreement score
- Rejection rate
- Trust score

---

# Payment System

## M-Pesa Daraja Integration

## Payment Features
- STK Push deposits
- Till Number integration
- B2C withdrawals
- Wallet system
- Pending balance
- Withdrawable balance
- Minimum withdrawal thresholds
- Transaction logs
- Failed transaction retries
- Callback verification

---

# Daraja API Integration Details

## APIs Required

### STK Push
Used for:
- User deposits
- Wallet top-ups

### B2C API
Used for:
- Worker withdrawals
- Earnings payouts

### Transaction Status API
Used for:
- Reconciliation
- Failed transaction verification

### Account Balance API
Used for:
- Wallet liquidity checks

---

# Daraja Backend Flow

## STK Push Deposit Flow

1. User enters amount
2. Backend generates access token
3. Backend initiates STK Push
4. User confirms PIN
5. Daraja sends callback
6. Backend verifies callback
7. Wallet updated
8. Transaction recorded

## Withdrawal Flow

1. User requests withdrawal
2. Balance validation
3. Fraud/risk checks
4. Admin approval (optional)
5. B2C payout initiated
6. Callback received
7. Transaction finalized

---

# MongoDB Database Design

# Collections

## users

Fields:
- _id
- firstName
- lastName
- email
- phone
- passwordHash
- role
- walletBalance
- pendingBalance
- accuracyScore
- trustScore
- status
- kycStatus
- skills
- devices
- lastLogin
- createdAt
- updatedAt

## projects

Fields:
- title
- description
- clientId
- taskType
- datasetUrl
- status
- budget
- payoutPerTask
- qualityThreshold
- totalTasks
- completedTasks

## tasks

Fields:
- projectId
- assignedTo
- status
- inputData
- outputData
- reviewStatus
- qualityScore
- payoutAmount
- startedAt
- submittedAt

## reviews

Fields:
- taskId
- reviewerId
- decision
- comments
- score

## transactions

Fields:
- userId
- type
- amount
- mpesaReceipt
- transactionId
- status
- metadata

## notifications

Fields:
- userId
- type
- title
- message
- read

---

# Recommended Folder Structure

# Frontend (Nuxt 3)

/apps/web

/components
/auth
/tasks
/dashboard
/payments
/reviews
/admin
/shared

/pages
/auth
/dashboard
/tasks
/admin
/projects
/wallet

/layouts

/composables
/useAuth.ts
/useTasks.ts
/usePayments.ts
/useSocket.ts

/stores
/auth.ts
/tasks.ts
/payments.ts

/plugins
/socket.client.ts
/primevue.ts

/middleware
/auth.ts
/admin.ts
/reviewer.ts

/utils
/api.ts
/constants.ts
/helpers.ts

/types
/api.ts
/user.ts
/task.ts

/server

---

# Backend Structure

/apps/api

/src
/config
/controllers
/routes
/services
/middlewares
/models
/jobs
/events
/sockets
/utils
/validators
/constants
/loggers

---

# Authentication Architecture

## JWT Strategy

Access Token:
- 15 minutes

Refresh Token:
- 30 days

## Security Features
- HTTP-only cookies
- CSRF protection
- Rate limiting
- IP throttling
- Helmet
- Password hashing using bcrypt
- Secure session rotation

---

# Real-Time Features

## Socket.IO Use Cases

- Live task assignment
- Real-time notifications
- Reviewer queues
- Admin monitoring dashboard
- Live payout updates
- Chat support
- Online worker tracking

---

# Admin Dashboard

## Dashboard Modules

### User Management
- Search users
- Ban users
- Role assignment
- Fraud review

### Project Management
- Create projects
- Track completion
- Monitor quality

### Financial Dashboard
- Revenue
- Pending payouts
- Wallet balances
- Failed payments

### Analytics
- Worker productivity
- Task completion rates
- Quality trends
- Platform growth

---

# Worker Dashboard

## Features
- Available tasks
- Earnings overview
- Task history
- Accuracy score
- Qualification badges
- Leaderboards
- Wallet
- Withdrawals

---

# Client Dashboard

## Features
- Create projects
- Upload datasets
- Analytics
- Team collaboration
- Quality metrics
- Export outputs

---

# Notification System

## Channels
- Email
- SMS
- Push notifications
- In-app notifications
- WebSocket events

## Events
- Task assigned
- Task rejected
- Payment completed
- Withdrawal approved
- New project available

---

# File Upload System

## Supported Uploads
- Images
- Videos
- Audio
- CSV
- JSON
- ZIP datasets

## Storage Strategy

Use:
- AWS S3 OR
- Cloudinary

## Requirements
- Signed URLs
- Chunk uploads
- Virus scanning
- Metadata extraction

---

# AI Annotation UI Requirements

## Bounding Box Tool
Features:
- Zoom
- Pan
- Label classes
- Keyboard shortcuts
- Polygon support
- Multi-select
- Undo/redo

## Text Annotation Tool
Features:
- Highlighting
- Entity tagging
- Sentiment labeling
- Classification shortcuts

## RLHF Tool
Features:
- Side-by-side comparison
- Ranking interface
- Safety scoring
- Explanation notes

---

# API Design Standards

## REST API Principles

- Versioned APIs
- Consistent responses
- Pagination
- Filtering
- Sorting
- Rate limiting

## Standard API Response

Success:
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

Error:
{
  "success": false,
  "message": "Validation error",
  "errors": []
}

---

# Queue System

## BullMQ Jobs

Queues:
- Email queue
- Notification queue
- Payment queue
- Review queue
- File processing queue
- AI validation queue

---

# Logging & Monitoring

## Logging
Use:
- Winston
- Morgan

## Monitoring
Use:
- Sentry
- Prometheus
- Grafana

Track:
- API latency
- Error rates
- Queue failures
- Payment failures
- User activity

---

# Security Requirements

## Essential Security
- Helmet
- CORS protection
- XSS sanitization
- MongoDB injection prevention
- Rate limiting
- JWT rotation
- Audit logs
- Encryption at rest
- Secure file uploads

## Fraud Prevention
- Behavioral analysis
- Duplicate detection
- VPN blocking
- Device fingerprinting
- Withdrawal cooldowns
- Suspicious activity alerts

---

# Scalability Strategy

## Initial Monolith
Start with modular monolith.

## Future Migration
Later split into:
- Auth service
- Task service
- Payment service
- Notification service
- Analytics service

---

# Suggested Packages

## Frontend Packages

npm install:
- @pinia/nuxt
- @vueuse/nuxt
- primevue
- primeicons
- tailwindcss
- socket.io-client
- zod
- axios
- vue-chartjs
- @tanstack/vue-query

## Backend Packages

npm install:
- express
- mongoose
- jsonwebtoken
- bcrypt
- dotenv
- cors
- helmet
- express-rate-limit
- multer
- cloudinary
- socket.io
- bullmq
- ioredis
- axios
- winston
- morgan
- zod
- node-cron

---

# Environment Variables

## Frontend

NUXT_PUBLIC_API_URL=
NUXT_PUBLIC_SOCKET_URL=
NUXT_PUBLIC_APP_NAME=HiveAI

## Backend

PORT=
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
REDIS_URL=
DARAJA_CONSUMER_KEY=
DARAJA_CONSUMER_SECRET=
DARAJA_SHORTCODE=
DARAJA_PASSKEY=
DARAJA_CALLBACK_URL=
CLOUDINARY_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

---

# CI/CD Pipeline

## GitHub Actions

Steps:
1. Install dependencies
2. Run lint
3. Run tests
4. Build frontend
5. Build backend
6. Dockerize
7. Deploy

---

# Docker Setup

## Services
- Frontend
- Backend
- MongoDB
- Redis
- Nginx

---

# Testing Strategy

## Frontend Testing
- Vitest
- Cypress

## Backend Testing
- Jest
- Supertest

## Coverage Goals
- Services
- Controllers
- Authentication
- Payment flows
- Task assignment logic

---

# Analytics System

## Metrics
- Daily active users
- Worker retention
- Average quality score
- Revenue
- Tasks completed
- Approval rates
- Average payout

---

# Gamification

## Features
- Worker levels
- Badges
- Streaks
- Leaderboards
- Bonuses
- Referral system

---

# Recommended Development Phases

# Phase 1 - Foundation

Build:
- Authentication
- User management
- Basic dashboards
- MongoDB models
- RBAC

# Phase 2 - Task Engine

Build:
- Task assignment
- Annotation tools
- Review system
- Quality scoring

# Phase 3 - Payments

Build:
- Wallet
- Daraja integration
- Transaction system
- Withdrawals

# Phase 4 - Real-Time & Analytics

Build:
- Socket.IO
- Notifications
- Analytics dashboards
- Monitoring

# Phase 5 - Scale & Optimization

Build:
- Queue optimization
- AI-assisted validation
- Fraud detection
- Horizontal scaling

---

# Recommended UI Design

## Design Language

Use:
- Clean enterprise UI
- Dark/light mode
- Minimal clutter
- High-density dashboards
- Accessible forms
- Keyboard shortcuts

## UI Inspiration
- Linear
- Stripe Dashboard
- Scale AI
- ClickUp
- Notion

---

# Copilot Master Prompt

Paste everything below into VSCode Copilot Chat:

"""
You are a senior staff-level software architect and principal engineer.

Your task is to build a production-grade AI workforce and annotation platform called HiveAI.

Tech stack:
- Nuxt 3
- Vue 3 Composition API
- Vite
- TypeScript
- Tailwind CSS
- PrimeVue
- Pinia
- Express.js
- MongoDB + Mongoose
- Redis
- BullMQ
- Socket.IO
- JWT Authentication
- Safaricom Daraja API integration

Architecture requirements:
- Modular monolith architecture
- Clean architecture principles
- Service layer pattern
- Repository pattern
- Strong typing
- Scalable folder structure
- Reusable composables
- Reusable UI components
- Enterprise-grade security
- Production-ready coding standards

Core platform features:
1. Authentication system
2. Role-based access control
3. Admin dashboard
4. Worker dashboard
5. Client dashboard
6. Reviewer dashboard
7. Task management system
8. AI annotation tools
9. Review workflows
10. Wallet system
11. M-Pesa Daraja integration
12. Real-time notifications
13. Analytics dashboards
14. Fraud prevention systems
15. Queue processing
16. File uploads
17. Audit logging
18. Qualification exams
19. Gamification
20. AI evaluation workflows

Roles:
- Admin
- Client
- Worker
- Reviewer

Authentication requirements:
- JWT access + refresh tokens
- Secure cookie handling
- Password hashing
- Rate limiting
- Role guards
- Middleware-based RBAC
- Session management

Database requirements:
Create scalable Mongoose schemas for:
- Users
- Tasks
- Projects
- Reviews
- Transactions
- Notifications
- Wallets
- Audit logs
- Qualification tests
- Fraud reports

Payment requirements:
Implement full Safaricom Daraja integration:
- STK Push
- B2C payouts
- Callback endpoints
- Transaction verification
- Wallet ledger
- Withdrawal approval system
- Retry handling
- Webhook validation
- Till number integration

Frontend requirements:
- Fully responsive UI
- Enterprise dashboard layouts
- Advanced tables
- Search/filter systems
- Real-time updates
- Toast notifications
- Optimistic updates
- Skeleton loaders
- Error boundaries
- Dark mode

Backend requirements:
- Express modular architecture
- Controllers/services/repositories separation
- Validation middleware
- Error handling middleware
- Queue workers
- Socket.IO events
- Centralized logging
- Cron jobs
- API versioning

Task system requirements:
Support:
- Image annotation
- Text classification
- RLHF comparison tasks
- Audio transcription
- Video annotation
- Reviewer workflows
- Quality scoring
- Gold-standard validation
- Auto-assignment

Security requirements:
- Helmet
- XSS protection
- Mongo sanitization
- Rate limiting
- Secure uploads
- Audit trails
- Fraud detection
- Device tracking
- IP analysis

Infrastructure requirements:
- Docker support
- Docker Compose
- CI/CD support
- Environment configuration
- Production deployment readiness
- Horizontal scalability

Code quality requirements:
- Type-safe code
- Clean reusable architecture
- SOLID principles
- Proper naming conventions
- Minimal duplication
- Modular components
- Reusable composables
- API abstraction layer
- Proper comments where necessary

Frontend folder structure:
- components
- composables
- stores
- services
- middleware
- pages
- layouts
- plugins
- types
- utils

Backend folder structure:
- controllers
- services
- repositories
- models
- middlewares
- validators
- routes
- jobs
- sockets
- config
- utils

When generating code:
- Always generate production-grade code.
- Never generate placeholder pseudo-code.
- Always use best practices.
- Use TypeScript everywhere possible.
- Use async/await.
- Add proper error handling.
- Add validation.
- Add loading states.
- Add reusable abstractions.
- Add scalable architecture.
- Avoid tightly coupled code.

When building APIs:
- Use REST conventions.
- Use pagination.
- Use filtering.
- Use structured responses.
- Add validation.
- Add authentication.
- Add RBAC middleware.

When building frontend:
- Use Nuxt 3 Composition API.
- Use script setup syntax.
- Use composables.
- Use Pinia.
- Use reusable components.
- Use Tailwind utility-first styling.
- Use PrimeVue professionally.

Always think like a principal engineer building a scalable startup platform intended to support millions of tasks and thousands of concurrent workers.

Always optimize for:
- Maintainability
- Scalability
- Security
- Performance
- Developer experience
- Production readiness

Do not cut corners.
Generate complete implementations.
"""

---

# Final Recommendations

## Start Small
Build the MVP first:
- Authentication
- RBAC
- Task engine
- Wallet
- Daraja integration

## Avoid Overengineering Early
Keep modular monolith until scale requires microservices.

## Focus Areas
The hardest systems will be:
- Task assignment
- Fraud prevention
- Payment reconciliation
- Annotation tooling
- Real-time concurrency

## Recommended Priority
1. Security
2. Payment reliability
3. Task workflow stability
4. Review accuracy
5. Scalability

---

# Suggested Future AI Features

- AI-assisted annotation
- Auto-label suggestions
- AI reviewer confidence scoring
- LLM evaluation pipelines
- Smart task routing
- AI fraud detection
- Automated moderation

---

# License

Private Proprietary Software

---

# Author

HiveAI Engineering Team

