---
inclusion: always
---

# Tech Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with custom components
- **Styling**: Tailwind CSS with dark mode support
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

## Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM with Zod schemas
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for videos, PDFs, and images
- **File Upload**: Multer for multipart form handling

## Build System
- **Bundler**: Vite for frontend, esbuild for backend
- **Dev Server**: Vite dev server with HMR
- **Deployment**: Vercel (serverless functions for API routes)

## Common Commands

```bash
# Development
npm run dev              # Start dev server (frontend + backend)
npm run dev:debug        # Start dev server without watch mode

# Build
npm run build            # Build both frontend and backend for production

# Production
npm run start            # Run production build

# Database
npm run db:push          # Push schema changes to database
npm run create-admin     # Create admin user

# Type Checking
npm run check            # Run TypeScript type checking
```

## Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Environment Variables
Required in `.env`:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)
- `PORT`: Server port (default: 3174)

## Key Dependencies
- `@supabase/supabase-js`: Supabase client
- `drizzle-orm`: Type-safe ORM
- `zod`: Schema validation
- `express`: HTTP server
- `wouter`: Client-side routing
- `@tanstack/react-query`: Data fetching and caching
