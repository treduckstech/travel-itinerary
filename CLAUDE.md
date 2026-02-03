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
- Auth is deferred -- no login required, no RLS, no user_id columns. Auth files are kept but unused for easy re-enablement.
- UI components are from shadcn/ui in `src/components/ui/`
- Types in `src/lib/types.ts` mirror the database schema

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `FLIGHTAWARE_API_KEY` - FlightAware AeroAPI key for flight lookup (optional, server-side only)
