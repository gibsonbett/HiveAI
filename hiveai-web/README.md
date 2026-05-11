# HiveAI Web

Frontend application for the HiveAI AI Data Annotation & Task Marketplace Platform.

## Overview

HiveAI Web is a modern, responsive Nuxt 3 application that serves as the user interface for the HiveAI platform. It enables clients to create and manage AI annotation projects, workers to complete tasks and earn money, reviewers to validate work quality, and admins to oversee the entire platform.

## Features

- **Multi-Role Dashboard**: Separate interfaces for Admin, Client, Worker, and Reviewer roles
- **Project Management**: Create, track, and manage AI annotation projects
- **Task Interface**: Intuitive task completion interface for various annotation types
- **Real-time Updates**: Live notifications and task updates via WebSocket
- **Wallet & Payments**: M-Pesa integration for deposits and withdrawals
- **Analytics Dashboard**: Project and worker performance metrics
- **User Authentication**: Secure login with JWT tokens
- **Responsive Design**: Mobile-friendly UI using Tailwind CSS
- **Data Visualization**: Charts and graphs for analytics
- **Form Validation**: Client-side validation with Zod
- **State Management**: Centralized state with Pinia
- **API Integration**: Type-safe API communication

## Tech Stack

- **Framework**: Nuxt 3
- **Frontend**: Vue 3 with Composition API
- **Styling**: Tailwind CSS
- **UI Components**: PrimeVue
- **Icons**: PrimeIcons
- **State Management**: Pinia with persistence
- **API Client**: Axios
- **Real-time**: Socket.IO Client
- **Utilities**: VueUse
- **Type Safety**: TypeScript
- **Build Tool**: Vite (integrated with Nuxt)

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/gibsonbett/HiveAI.git
cd HiveAI/hiveai-web

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```
# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NUXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Application
NUXT_PUBLIC_APP_NAME=HiveAI
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

## Running the Application

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate

# Type checking
npm run type-check
```

The development server runs on `http://localhost:3000`.

## Project Structure

```
app/
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components
│   ├── annotation/     # Task annotation components
│   └── shared/         # Shared/reusable components
├── composables/        # Reusable composition functions
│   ├── useApi.ts      # API communication
│   ├── useAuth.ts     # Authentication logic
│   ├── useSocket.ts   # WebSocket management
│   ├── useRealtimeEvents.ts # Real-time events
│   └── useToast.ts    # Toast notifications
├── layouts/            # Layout components
│   ├── default.vue    # Default layout
│   ├── auth.vue       # Auth page layout
│   └── dashboard.vue  # Dashboard layout
├── middleware/         # Route middleware
├── pages/             # Page components (routes)
├── plugins/           # Nuxt plugins
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── app.vue            # Root component
└── nuxt.config.ts     # Nuxt configuration
```

## Key Pages

- `/` - Home page
- `/auth/login` - User login
- `/auth/register` - User registration
- `/dashboard` - Main dashboard (role-based)
- `/projects` - Project listing and creation
- `/tasks` - Task listing and details
- `/wallet` - Wallet and payment management
- `/analytics` - Analytics and reports
- `/profile` - User profile settings

## Composables

### useApi
Handle API requests with authentication:
```typescript
const { data, pending, error } = await useApi('/endpoint')
```

### useAuth
Authentication state and methods:
```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

### useSocket
WebSocket communication:
```typescript
const { on, emit, connected } = useSocket()
```

### useRealtimeEvents
Real-time event handling:
```typescript
const { onTaskUpdate, onNotification } = useRealtimeEvents()
```

### useToast
Toast notifications:
```typescript
const { showSuccess, showError } = useToast()
```

## Stores

Pinia stores for global state management:

- **authStore**: User authentication and profile
- **projectStore**: Projects data
- **taskStore**: Tasks and task assignments
- **walletStore**: Wallet balance and transactions
- **notificationStore**: Notifications
- **analyticsStore**: Analytics data

## Component Examples

### Task Annotation Component
Interactive component for completing annotation tasks:
- Image annotation with canvas
- Text input fields
- Multiple choice options
- Validation and submission

### Project Dashboard
Overview of project metrics and progress:
- Task completion rates
- Worker statistics
- Quality scores
- Payment information

### Wallet Interface
User payment management:
- Balance display
- Deposit via M-Pesa STK Push
- Withdrawal requests
- Transaction history

## Forms & Validation

Input validation using Zod schemas:
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

## API Integration

Type-safe API calls:
```typescript
// In composables/useApi.ts
const response = await useApi('/users/profile')
```

## Real-time Features

WebSocket integration for:
- Task assignments
- Status updates
- Notifications
- Live collaboration

## Styling

Tailwind CSS with PrimeVue components:
- Responsive grid system
- Custom color schemes
- Dark mode support (optional)
- Utility-first approach

## Performance

- Code splitting with Nuxt
- Image optimization
- Lazy loading components
- Caching with axios interceptors
- Pinia store persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run preview
```

## Deployment

The application can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages** (with `nuxt generate`)
- **AWS S3 + CloudFront**
- **Any Node.js hosting**

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3001
```

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .nuxt
npm install
npm run build
```

### API Connection Issues
- Verify `NUXT_PUBLIC_API_BASE_URL` is correct
- Ensure backend server is running
- Check CORS configuration

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

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
