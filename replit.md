# BTJO — Banco de Talentos Jovens de Oriximiná

A professional portfolio platform for young talent in Oriximiná, Pará (Brazil). Users can create profiles, showcase skills, education, projects, and experiences. Admins can manage profiles, review reports, and view logs.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **UI**: Tailwind CSS + shadcn/ui component library
- **Auth & DB**: Supabase (hosted, external) — uses anon/public key with Row Level Security
- **Routing**: React Router v6
- **State/Data**: TanStack React Query + direct Supabase client calls
- **Forms**: React Hook Form + Zod

No backend server — all data access goes through Supabase's JS client with RLS enforcing authorization.

## Key Files

- `src/App.tsx` — routes
- `src/hooks/useAuth.tsx` — auth context (sign up, sign in, sign out, admin check)
- `src/hooks/useProfile.ts` — profile CRUD (skills, education, experiences, projects, etc.)
- `src/integrations/supabase/client.ts` — Supabase client
- `src/integrations/supabase/types.ts` — generated DB types
- `src/pages/` — all page components
- `src/components/profile/` — profile editing form sections
- `supabase/migrations/` — DB schema migrations (applied on Supabase dashboard)

## Environment Variables

Set in Replit secrets (shared environment):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key

## Running

```bash
npm run dev   # development server on port 5000
npm run build # production build to dist/
```

## Supabase Schema

The database schema lives in `supabase/migrations/`. Key tables:
- `profiles` — user profiles with status (DRAFT/PUBLISHED/BLOCKED)
- `user_roles` — admin/user roles
- `skills`, `soft_skills`, `education`, `experiences`, `projects`, `certifications`, `languages`, `availability`
- `messages`, `reports`, `admin_logs`

RLS policies protect all tables. Admin email: `admin@btjo.com` and `yurimaxqi@gmail.com` get admin role on signup.
