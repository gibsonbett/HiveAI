# HiveAI API

Backend API for the HiveAI AI Data Annotation & Task Marketplace Platform.

## Overview

The HiveAI API is a scalable Node.js/Express backend that powers a distributed AI workforce platform. It handles task management, user authentication, payments via Safaricom M-Pesa, real-time notifications, and comprehensive analytics.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Client, Worker, Reviewer)
- **Task Management**: Create, assign, and track AI annotation tasks
- **Workforce Management**: Worker onboarding, qualification, and performance tracking
- **Payment Integration**: Safaricom Daraja API for M-Pesa STK Push and B2C withdrawals
- **Real-time Updates**: Socket.IO for live task updates and notifications
- **Review System**: Multi-level review pipeline for quality assurance
- **Analytics**: Project and worker performance metrics
- **Fraud Detection**: Anti-fraud mechanisms including VPN detection and anomaly detection
- **File Management**: Cloudinary integration for file uploads
- **Email Notifications**: Automated email notifications via Nodemailer
- **Rate Limiting**: Request rate limiting and security headers with Helmet
- **Caching**: Redis for session management and caching
- **Job Queues**: BullMQ for background job processing
- **Logging**: Winston logger for comprehensive application logging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Caching**: Redis with ioredis
- **Authentication**: JWT (jsonwebtoken)
- **Job Queue**: BullMQ
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, bcrypt, express-rate-limit
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/gibsonbett/HiveAI.git
cd HiveAI/hiveai-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

## Environment Variables

Create a `.env` file in the project root with the following:

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hiveai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@hiveai.com

# Daraja (M-Pesa)
DARAJA_CONSUMER_KEY=your_consumer_key
DARAJA_CONSUMER_SECRET=your_consumer_secret
DARAJA_SHORTCODE=your_shortcode
DARAJA_PASSKEY=your_passkey
DARAJA_TILL_NUMBER=your_till_number
DARAJA_CALLBACK_URL=https://your-domain.com/api/v1/payments/daraja/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Testing
npm test
npm run test:watch
```

## Project Structure

```
src/
├── config/           # Configuration files (DB, Redis, Cloudinary, etc.)
├── constants/        # Enums and constants
├── controllers/      # Route handlers
├── jobs/            # Background job definitions
├── middlewares/     # Express middlewares (auth, validation, error handling)
├── models/          # Mongoose schemas
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic
├── sockets/         # WebSocket event handlers
├── types/           # TypeScript types and interfaces
├── utils/           # Utility functions and helpers
├── validators/      # Input validation schemas
├── app.ts           # Express app setup
├── server.ts        # Server entry point
└── seed.ts          # Database seeding script
```

## API Routes

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/leaderboard` - Get worker leaderboard

### Projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task
- `POST /api/v1/tasks/:id/submit` - Submit completed task

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews` - List reviews
- `PUT /api/v1/reviews/:id` - Update review

### Payments
- `POST /api/v1/payments/daraja/stk-push` - Initiate M-Pesa deposit
- `POST /api/v1/payments/daraja/callback` - Handle M-Pesa callback
- `POST /api/v1/payments/withdraw` - Request withdrawal
- `GET /api/v1/payments/transactions` - Get transaction history

### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard metrics
- `GET /api/v1/analytics/projects/:id` - Get project analytics

## Database Models

- **User**: User accounts with role-based access
- **Project**: AI annotation projects
- **Task**: Individual annotation tasks
- **Review**: Task review and quality control
- **Transaction**: Payment transactions
- **Notification**: User notifications
- **AuditLog**: System audit logs

## WebSocket Events

Real-time communication via Socket.IO:
- `task:assigned` - Task assigned to worker
- `task:updated` - Task status updated
- `task:completed` - Task marked complete
- `notification:received` - New notification
- `payment:completed` - Payment processed

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Deployment

### Docker

```bash
docker-compose up -d
```

### Environment

The application is configured for deployment on:
- AWS (EC2, RDS, S3)
- DigitalOcean
- Railway
- Render
- Heroku

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting (20 requests/minute per IP)
- Helmet for security headers
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- SQL injection prevention with Mongoose
- XSS protection with Helmet

## Performance Optimization

- Redis caching for frequently accessed data
- Database indexing on key fields
- Job queue for async operations
- Connection pooling
- Request rate limiting
- Gzip compression

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

## Contributing

1. Create a feature branch from `develop`
2. Commit changes with clear messages
3. Push to your branch
4. Create a Pull Request with a detailed description

## License

ISC

## Support

For issues and questions, please use the GitHub Issues tracker.

---

**Built with ❤️ for the future of AI data annotation**
