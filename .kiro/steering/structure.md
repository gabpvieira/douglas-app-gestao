---
inclusion: always
---

# Project Structure & Conventions

## Directory Layout

**Frontend**: `client/src/` - React TypeScript application
- `components/` - React components (feature components at root, UI primitives in `ui/`, legacy examples in `examples/`)
- `pages/` - Route components (`admin/` for trainer, `aluno/` for student)
- `hooks/` - Custom React hooks (use TanStack Query for data fetching)
- `lib/` - Core utilities (`supabase.ts`, `queryClient.ts`, `utils.ts`)

**Backend**: `server/` - Express TypeScript API
- `routes/` - Feature-based API handlers (imported in `routes.ts`)
- `supabase.ts` - Server-side Supabase client (uses service role key)
- Storage modules: `storage.ts`, `storageHelper.ts`, `supabaseStorage.ts`
- `upload.ts` - Multer file upload handling
- `thumbnailGenerator.ts` - Video thumbnail generation

**Shared**: `shared/schema.ts` - Drizzle ORM schemas and Zod validators (single source of truth for types)

**Deployment**: `api/` - Vercel serverless functions (mirrors server routes for production)

**Scripts**: `scripts/` - Database setup and utility scripts

## Architectural Patterns

### Data Flow
1. Client uses custom hooks (`hooks/use*.ts`) that wrap TanStack Query
2. Hooks call Supabase client directly (`client/src/lib/supabase.ts`) - NO backend API for data operations
3. Backend API (`server/routes/`) handles ONLY file uploads and storage operations
4. All database queries use Supabase client with RLS policies for security

### Authentication
- Supabase Auth manages sessions
- Client: `supabase.auth.getSession()` for current user
- Server: Service role key for admin operations (bypasses RLS)
- RLS policies enforce data access control at database level

### File Storage
- Supabase Storage buckets: `videos`, `thumbnails`, `pdfs`, `fotos-progresso`
- Upload flow: Client → Backend API → Supabase Storage → Return public URL
- Thumbnails generated server-side for videos

## Naming Conventions

**Files**:
- Components: `PascalCase.tsx` (e.g., `AdminDashboard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useFichasTreino.ts`)
- Utilities: `camelCase.ts` (e.g., `queryClient.ts`)
- Config: `kebab-case.ts` (e.g., `vite.config.ts`)

**Suffixes**:
- Modals: `*Modal.tsx` (e.g., `FichaTreinoModal.tsx`)
- Lists: `*List.tsx` (e.g., `FichasTreinoList.tsx`)

**Database**:
- Tables: `snake_case` (e.g., `fichas_treino`, `planos_alimentares`)
- Foreign keys: `{table}_id` (e.g., `aluno_id`, `ficha_id`)

## Code Style Rules

### Components
- Use functional components with TypeScript
- Props interfaces named `{Component}Props`
- Destructure props in function signature
- Use Radix UI primitives from `components/ui/` for consistency
- Wrap forms with React Hook Form + Zod validation

### Hooks
- One hook per feature domain (e.g., `useFichasTreino` for all workout card operations)
- Export individual query/mutation hooks (e.g., `useFichas`, `useCreateFicha`)
- Use TanStack Query's `useQuery` for reads, `useMutation` for writes
- Include `queryKey` arrays for cache management
- Handle loading/error states in components, not hooks

### Routing
- Client routes: `/admin/*` (trainer), `/aluno/*` (student), `/` (landing)
- API routes: `/api/*` (file operations only)
- Use Wouter's `useRoute` and `useLocation` for navigation
- Protect routes with auth checks in components

### Styling
- Tailwind utility classes (no custom CSS unless necessary)
- Dark mode default: `dark` class on `<html>`
- Responsive: mobile-first breakpoints (`sm:`, `md:`, `lg:`)
- Use `cn()` utility from `lib/utils.ts` for conditional classes

### Database Operations
- Define schemas in `shared/schema.ts` with Drizzle + Zod
- Use Supabase client directly from frontend (not Drizzle)
- Query pattern: `supabase.from('table').select().eq('column', value)`
- Insert pattern: `supabase.from('table').insert(data).select().single()`
- Always use `.select()` after mutations to return data
- Rely on RLS policies for security (defined in SQL scripts)

## Key Patterns to Follow

1. **No backend API for CRUD**: Use Supabase client directly from frontend hooks
2. **Backend only for files**: Upload, storage, thumbnail generation
3. **Single schema source**: `shared/schema.ts` defines all types
4. **Query invalidation**: Use `queryClient.invalidateQueries()` after mutations
5. **Error boundaries**: Wrap route components with `ErrorBoundary`
6. **Type safety**: Leverage TypeScript strict mode, no `any` types
7. **Imports**: Use path alias `@/` for `client/src/`, `@shared/` for `shared/`

## Common Locations

- Supabase client config: `client/src/lib/supabase.ts`
- React Query config: `client/src/lib/queryClient.ts`
- Main routing: `client/src/App.tsx`
- API registration: `server/routes.ts`
- Environment variables: `.env` (see `.env.example` for required keys)
