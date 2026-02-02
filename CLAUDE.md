# Travel Itinerary - Claude Code Guidance

## Tech Stack
- Next.js 14+ (App Router) with TypeScript
- shadcn/ui + Tailwind CSS v4
- Supabase (Postgres + Auth)
- Deployed on Vercel

## Project Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - React components organized by domain (auth, trips, events, calendar, todos, ui)
- `src/lib/` - Shared utilities, types, Supabase clients
- `supabase/` - Database schema SQL

## Key Patterns
- Server components fetch data using `@/lib/supabase/server`
- Client components use `@/lib/supabase/client` for mutations
- All database tables have RLS policies scoped to `auth.uid() = user_id`
- UI components are from shadcn/ui in `src/components/ui/`
- Types in `src/lib/types.ts` mirror the database schema

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
