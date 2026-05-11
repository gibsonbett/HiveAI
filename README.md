# HiveAI

**AI Data Annotation & Task Marketplace Platform**

A scalable, distributed workforce platform for AI training data annotation, evaluation, and quality assurance. Inspired by Scale AI, Remotasks, and modern RLHF operations.

## 🎯 Project Overview

HiveAI enables organizations to:
- Create and manage AI annotation projects
- Recruit and onboard a qualified global workforce
- Assign tasks and track completion
- Validate quality through multi-level reviews
- Automate payments via Safaricom M-Pesa
- Monitor performance with real-time analytics
- Prevent fraud with advanced detection systems

## 📦 Project Structure

```
HiveAI/
├── hiveai-api/          # Node.js/Express backend API
├── hiveai-web/          # Nuxt 3 frontend application
└── README.md            # This file
```

## 🚀 Quick Start

### Backend Setup

```bash
cd hiveai-api
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd hiveai-web
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📚 Documentation

- [Backend README](./hiveai-api/README.md) - API documentation, setup, and architecture
- [Frontend README](./hiveai-web/README.md) - UI setup, components, and features

## 🏗️ System Architecture

```
┌─────────────────────┐
│   Frontend (Nuxt)   │
├─────────────────────┤
│  Components, Pages  │
│  Stores, Composables│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│     Backend API (Express.js)        │
├─────────────────────────────────────┤
│ Controllers, Services, Repositories │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
  MongoDB      Redis
```

## 🔑 Key Features

### User Management
- Multi-role authentication (Admin, Client, Worker, Reviewer)
- Profile management and verification
- Worker onboarding and qualification
- Performance tracking and leaderboards

### Project & Task Management
- Create and configure annotation projects
- Support for multiple task types:
  - Image annotation (bounding boxes, segmentation, keypoints)
  - Text tasks (sentiment, toxicity, ranking)
  - Audio tasks (transcription, classification)
  - Video annotation
  - AI evaluation tasks
- Intelligent task assignment based on worker skills
- Real-time task status updates

### Quality Assurance
- Multi-level review pipeline (automated, human, senior, admin)
- Quality scoring and metrics
- Accuracy and consistency tracking
- Dispute resolution

### Payment System
- Safaricom M-Pesa integration
- STK Push for deposits
- B2C withdrawals
- Wallet management
- Transaction history and reconciliation
- Payment automation

### Analytics
- Real-time dashboard metrics
- Project performance analytics
- Worker performance tracking
- Quality metrics and trends
- Payment reports

### Security & Fraud Prevention
- JWT-based authentication
- Role-based access control
- Rate limiting and request throttling
- Helmet security headers
- VPN and proxy detection
- Device fingerprinting
- Anomaly detection
- Automated fraud alerts

### Real-time Communication
- Socket.IO for live updates
- Task notifications
- Payment confirmations
- Real-time collaboration

## 🛠️ Technology Stack

### Frontend
- **Nuxt 3** - Meta framework for Vue
- **Vue 3** - Progressive JavaScript framework
- **Tailwind CSS** - Utility-first CSS
- **PrimeVue** - Premium Vue UI components
- **Pinia** - State management
- **Socket.IO Client** - Real-time communication
- **TypeScript** - Type safety
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Redis** - Caching and sessions
- **BullMQ** - Job queue
- **JWT** - Authentication
- **Socket.IO** - WebSocket communication
- **Cloudinary** - File storage
- **Nodemailer** - Email service
- **Winston** - Logging
- **TypeScript** - Type safety

### DevOps
- **Docker & Docker Compose** - Containerization
- **MongoDB Atlas** - Managed database
- **Redis Cloud** - Managed cache
- **Vercel** - Frontend deployment (optional)
- **Railway/Render** - Backend deployment (optional)

## 📋 User Roles

### Admin
- Manage users and permissions
- Configure system parameters
- Monitor platform analytics
- Approve payments
- Review fraud cases
- Access audit logs

### Client
- Create and manage projects
- Upload datasets
- Configure task workflows
- Monitor project progress
- Download results
- Manage budget and payments

### Worker
- View available tasks
- Complete annotations
- Track earnings
- Request withdrawals
- View profile stats
- Participate in leaderboards

### Reviewer
- Review completed tasks
- Score quality
- Approve/reject submissions
- Flag suspicious work
- Escalate disputes

## 🔐 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention with Mongoose
- XSS protection with Helmet
- CORS configuration
- Rate limiting (20 req/min per IP)
- API key management
- Audit logging

## 📊 API Overview

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:id` - Get details

### Tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks/:id/submit` - Submit task

### Payments
- `POST /api/v1/payments/daraja/stk-push` - Initiate deposit
- `POST /api/v1/payments/withdraw` - Request withdrawal

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/projects/:id` - Project analytics

See individual READMEs for complete API documentation.

## 🚢 Deployment

### Prerequisites
- Docker and Docker Compose
- MongoDB Atlas account
- Redis Cloud account
- Cloudinary account
- Safaricom Daraja credentials

### Local Development
```bash
docker-compose up -d
```

### Production
Deployment guides available in respective README files for backend and frontend.

## 📝 Environment Setup

### Backend
Copy `.env.example` to `.env` and configure:
```
MONGODB_URI=...
REDIS_URL=...
JWT_SECRET=...
DARAJA_CONSUMER_KEY=...
# See hiveai-api/README.md for full list
```

### Frontend
Copy `.env` and configure:
```
NUXT_PUBLIC_API_BASE_URL=...
NUXT_PUBLIC_SOCKET_URL=...
```

## 🧪 Testing

### Backend
```bash
cd hiveai-api
npm test
npm run test:watch
```

### Frontend
```bash
cd hiveai-web
# Testing configuration coming soon
```

## 📖 Documentation Files

- `hiveai_full_project_readme_and_copilot_prompt (1).md` - Comprehensive project specification
- [hiveai-api/README.md](./hiveai-api/README.md) - Backend API documentation
- [hiveai-web/README.md](./hiveai-web/README.md) - Frontend application documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write clear commit messages
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Run linting and type checks before pushing

## 📄 License

ISC

## 👥 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Review documentation in README files
- Check the comprehensive project spec

## 🎓 Learning Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

---

**Built with ❤️ for the future of AI data annotation**

**Repository:** https://github.com/gibsonbett/HiveAI
