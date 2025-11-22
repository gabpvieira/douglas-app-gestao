---
inclusion: always
---

# Project Structure

## Root Organization

```
├── client/              # Frontend React application
├── server/              # Backend Express API
├── shared/              # Shared types and schemas
├── api/                 # Vercel serverless functions
├── scripts/             # Utility scripts (DB setup, admin creation)
├── attached_assets/     # Static assets (images, logos)
└── dist/                # Build output (gitignored)
```

## Frontend (`client/`)

```
client/
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Radix UI-based design system components
│   │   ├── examples/    # Example/reference components
│   │   └── *.tsx        # Feature components (modals, lists, forms)
│   ├── pages/           # Route-level page components
│   │   ├── admin/       # Admin-only pages
│   │   └── aluno/       # Student-only pages
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   │   ├── supabase.ts  # Supabase client setup
│   │   ├── queryClient.ts # React Query config
│   │   └── utils.ts     # Helper functions
│   ├── utils/           # Additional utilities
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
└── index.html           # HTML entry point
```

## Backend (`server/`)

```
server/
├── routes/              # API route handlers (organized by feature)
├── index.ts             # Express server setup
├── routes.ts            # Route registration
├── supabase.ts          # Supabase server client
├── storage.ts           # File storage logic
├── storageHelper.ts     # Storage utilities
├── supabaseStorage.ts   # Supabase storage integration
├── thumbnailGenerator.ts # Video thumbnail generation
├── upload.ts            # File upload handling
└── vite.ts              # Vite dev server integration
```

## Shared (`shared/`)

```
shared/
└── schema.ts            # Drizzle ORM schemas and Zod validators
```

## API Routes (`api/`)

Vercel serverless functions for production deployment. Mirrors server route structure.

## Conventions

### Component Organization
- UI primitives in `components/ui/`
- Feature components at `components/` root
- Page components in `pages/` with admin/aluno subdirectories
- Modals named with `*Modal.tsx` suffix
- Lists named with `*List.tsx` suffix

### Hooks
- Custom hooks in `hooks/` directory
- Named with `use*` prefix
- Organized by feature (e.g., `useAlunos.ts`, `useFichasTreino.ts`)
- Use TanStack Query for data fetching

### Routing
- Admin routes: `/admin/*`
- Student routes: `/aluno/*`
- API routes: `/api/*`
- Wouter for client-side routing
- Express for server-side routing

### Database
- Schema definitions in `shared/schema.ts`
- Drizzle ORM for type-safe queries
- Zod schemas for validation
- Supabase for database and storage

### Styling
- Tailwind CSS utility classes
- Dark mode by default (`dark` class on root)
- Component variants with `class-variance-authority`
- Responsive design with mobile-first approach

### File Naming
- React components: PascalCase (e.g., `AdminDashboard.tsx`)
- Utilities/hooks: camelCase (e.g., `useAlunos.ts`)
- Config files: kebab-case (e.g., `vite.config.ts`)
- Database tables: snake_case (e.g., `fichas_treino`)
