# Travel Itinerary - Claude Code Guidance

## URLs
- **Travel app:** travel.treducks.io
- **Restaurant API:** beneats.ai

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
- `src/app/api/cron/` - Vercel Cron jobs (todo reminders)
- `src/app/friends/` - Friends management page
- `src/components/` - React components organized by domain (admin, auth, trips, events, calendar, todos, notifications, ui)
- `src/components/admin/` - Admin components (sidebar, stat cards, pagination, analytics charts, activity log)
- `src/components/events/` - Event components (event cards, detail cards for drive/train/restaurant/hotel/shopping/bars, form dialog, airport/station comboboxes)
- `src/data/` - Static data (airports, stations)
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
- Vercel Cron jobs configured in `vercel.json` — todo reminder runs daily at 9 AM UTC, authenticated via `CRON_SECRET`

## Travel Event Sub-types
Travel events have a `sub_type` field: `flight`, `train`, `ferry`, or `drive`.

### Description Field Encoding
The `description` field uses `|||` as a separator to store structured data without schema changes:
- **Drives:** `originAddress|||destinationAddress`
- **Trains:** `operator|||class|||coach|||seat`
- **Restaurants:** Google Maps URL (when from search)
- **Hotels:** Google Maps URL (when from search)
- **Shopping:** Not used (stores tracked in `shopping_stores` table with per-store Google Maps URLs)
- **Bars:** Not used (venues tracked in `bar_venues` table with per-venue Google Maps URLs)

### Stations & Airports
- Airport data in `src/data/airports.ts` — used by `AirportCombobox` for flight forms
- Station data in `src/data/stations.ts` — used by `StationCombobox` for train and ferry forms
- Stations include US (Amtrak), UK, France, Germany, Italy (including Cinque Terre, Lake Como, Sicily), Spain, Netherlands, Belgium, Switzerland, Austria, Scandinavia, Eastern Europe, Portugal, Ireland, and ferry terminals

### Event Detail Cards
Each travel sub-type has an expandable detail card:
- `DriveDetailCard` — route map, addresses, Google Maps link
- `TrainDetailCard` — route visualization with station resolution, operator, class, coach/seat, confirmation number
- `RestaurantDetailCard` — cuisine, price, rating, BenEats link, Google Maps link, Add to Google Calendar link
- `HotelDetailCard` — address, Google Maps link
- `ShoppingDetailCard` — list of stores (with Google Maps links), add/remove stores via PlaceSearch, category tags
- `BarDetailCard` — list of venues (with Google Maps links), add/remove venues via PlaceSearch, notes
- Google Calendar URL builder in `src/lib/calendar.ts` — `buildGoogleCalendarUrl()` converts UTC times to event timezone, uses `ctz` param

### Shopping Event Architecture
Shopping events are **dateless city-based parent cards** (not date-ranged like hotels):
- `start_datetime` uses a sentinel value (`new Date().toISOString()`), never displayed
- `title` stores the city name (auto-detected from store addresses via `extractCityFromAddress`)
- Stores are managed in the `shopping_stores` table with per-store name, address, Google Maps URL, and category
- **Creation flow**: User searches for a store → city extracted from address → existing parent found or new one created → store added as `shopping_stores` row
- **Layout**: Three-column grid (`event-list.tsx`): day events | hotels | shopping. Shopping cards matched to hotels by city name.
- Shopping events are excluded from the calendar view
- City extraction logic in `src/lib/address.ts` handles US, European, and UK address formats

### Bars Event Architecture
Bars events follow the identical pattern to shopping events — **dateless city-based parent cards**:
- `start_datetime` uses a sentinel value, never displayed
- `title` stores the city name (auto-detected from venue addresses via `extractCityFromAddress`)
- Venues are managed in the `bar_venues` table with per-venue name, address, Google Maps URL, and category (used as note)
- **Creation flow**: User searches for a bar → city extracted from address → existing parent found or new one created → venue added as `bar_venues` row
- **Layout**: Column 3 alongside shopping, matched to hotels by city name
- Bars events are excluded from the calendar view

## Security
- All API proxy routes (flights, places, maps, restaurants) require authentication
- Admin routes enforce email allowlist at middleware, layout, and API levels — middleware imports `isAdmin()` from `src/lib/admin.ts` (single source of truth)
- Shares endpoints verify trip ownership explicitly (not just RLS)
- DB trigger prevents shared editors from modifying `user_id` or `share_token`
- Auth callback validates redirect URLs to prevent open redirects
- Activity log POST validates action types against an allowlist with size limits
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) configured in `next.config.ts`
- HTML escaping via `escapeHtml()` from `src/lib/email.ts` on all email template interpolations
- All `request.json()` calls wrapped in try-catch (returns 400 on malformed JSON)
- Supabase error messages sanitized in non-admin API responses (no schema/table name leaks)
- Rate limiting on attachment uploads (20 req/min per user)
- Uploaded filenames sanitized: path traversal stripped, unsafe chars replaced, length limited
- Cron route returns 503 if `CRON_SECRET` env var is missing

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
- `CRON_SECRET` - Secret for Vercel Cron job authentication (auto-provided by Vercel on Pro plans)

## Tracking
- Feature roadmap and pending tasks are tracked in `TODO.md` — always keep it in sync when completing work or adding new tasks
