# Travel Itinerary - Claude Code Guidance

## Tech Stack
- Next.js 15 (App Router) with TypeScript
- shadcn/ui + Tailwind CSS v4
- Supabase (Postgres + Auth + RLS)
- Recharts for admin analytics charts
- Deployed on Vercel

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/admin/` - Admin console (dashboard, users, analytics, activity log)
- `src/app/api/admin/` - Admin API routes (stats, users, analytics, activity log)
- `src/app/api/` - Public API routes (trips, flights, places, maps, restaurants, activity log, friends, notifications)
- `src/app/friends/` - Friends management page
- `src/components/` - React components organized by domain (admin, auth, trips, events, calendar, todos, notifications, ui)
- `src/components/admin/` - Admin components (sidebar, stat cards, pagination, analytics charts, activity log)
- `src/lib/` - Shared utilities, types, Supabase clients, admin helpers, rate limiting
- `supabase/` - Database schema and migrations

## Key Patterns
- Server components fetch data using `@/lib/supabase/server`
- Client components use `@/lib/supabase/client` for mutations
- Service role client (`@/lib/supabase/service`) bypasses RLS for admin operations and public share pages
- Google SSO auth via Supabase Auth with RLS policies on all tables
- Admin access restricted to emails in `src/lib/admin.ts` with three-layer defense: middleware, server layout, API route checks
- Activity logging via fire-and-forget POST from client (`src/lib/activity-log.ts`) to `/api/activity-log`
- Per-user in-memory rate limiting on external API proxy routes (`src/lib/rate-limit.ts`)
- UI components are from shadcn/ui in `src/components/ui/`
- Types in `src/lib/types.ts` mirror the database schema
- Friends system uses `friendships` table with pending/accepted/declined status
- Notifications created via service client, polled by client every 30s
- Email via Resend (`src/lib/email.ts`) - fire-and-forget, no-ops without RESEND_API_KEY

## Security
- All API proxy routes (flights, places, maps, restaurants) require authentication
- Admin routes enforce email allowlist at middleware, layout, and API levels
- Shares endpoints verify trip ownership explicitly (not just RLS)
- DB trigger prevents shared editors from modifying `user_id` or `share_token`
- Auth callback validates redirect URLs to prevent open redirects
- Activity log POST validates action types against an allowlist with size limits

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations, public shares)
- `FLIGHTAWARE_API_KEY` - FlightAware AeroAPI key for flight lookup (optional, server-side only)
- `AIRLABS_API_KEY` - AirLabs API key for flight lookup fallback (optional, server-side only)
- `BENEATS_API_KEY` - BenEats API key for restaurant search (optional, server-side only)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key for place search and drive time calculation (optional, server-side only; requires Places API and Distance Matrix API)
- `RESEND_API_KEY` - Resend API key for email notifications (optional, server-side only)
