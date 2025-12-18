# AutoSolver - CAPTCHA & Typing Job Automation Platform

## Overview

AutoSolver is an AI-powered automation platform for solving CAPTCHAs and completing typing jobs. The application provides a dashboard interface for managing job queues, tracking earnings, connecting to third-party CAPTCHA solving platforms, and processing withdrawals via PayPal or cryptocurrency.

The platform uses OpenAI's vision capabilities to solve image-based CAPTCHAs and process text-based challenges. Users can connect multiple CAPTCHA solving platforms (2Captcha, AntiCaptcha, CapMonster), track job completion statistics, and withdraw earnings through PayPal or crypto wallets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state with automatic refetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON API with `/api` prefix
- **Build Process**: esbuild for production bundling with selective dependency bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Drizzle Kit with `db:push` command

### Database Schema
Key tables include:
- `users` - User accounts with balance tracking
- `platforms` - Connected CAPTCHA solving platforms with API credentials
- `jobs` - Individual job records (captcha/typing) with status tracking
- `transactions` - Withdrawal and earnings transactions
- `activityLogs` - System activity feed
- `settings` - Key-value configuration storage

### AI Integration
- **Provider**: OpenAI GPT-5 with vision capabilities
- **Use Cases**: Image CAPTCHA solving, text CAPTCHA solving, image transcription, data entry processing
- **Module**: Conditionally loaded when `OPENAI_API_KEY` is available

### Project Structure
```
├── client/              # Frontend React application
│   └── src/
│       ├── components/  # React components including shadcn/ui
│       ├── pages/       # Page components (Dashboard, NotFound)
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and query client
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data access layer interface
│   ├── openai.ts        # AI integration
│   └── paypal.ts        # Payment processing
├── shared/              # Shared code between frontend/backend
│   └── schema.ts        # Drizzle database schema
└── migrations/          # Database migrations
```

### Key Design Patterns
- **Interface-based storage**: `IStorage` interface allows swapping storage implementations
- **Conditional module loading**: OpenAI and PayPal modules load only when credentials are configured
- **Shared schema validation**: Single source of truth for types across frontend and backend
- **Real-time updates**: React Query with polling intervals for live dashboard updates

## External Dependencies

### Payment Processing
- **PayPal Server SDK**: `@paypal/paypal-server-sdk` for PayPal withdrawals
- **Environment Variables**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- **Critical Note**: PayPal integration code in `server/paypal.ts` must not be modified

### AI Services
- **OpenAI API**: Used for CAPTCHA solving and text processing
- **Environment Variable**: `OPENAI_API_KEY`
- **Model**: GPT-5 with vision capabilities

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Session Storage**: `connect-pg-simple` for Express session management

### Third-Party CAPTCHA Platforms
The application integrates with external CAPTCHA solving services:
- 2Captcha (api.2captcha.com)
- AntiCaptcha (api.anti-captcha.com)
- CapMonster (api.capmonster.cloud)
- Custom platform support

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Icons**: Additional icon sets (PayPal, Bitcoin, Ethereum icons)
- **Embla Carousel**: Carousel component
- **Recharts**: Charting library