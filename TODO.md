# Travel Itinerary - Feature Roadmap

## Completed (MVP)
- [x] Project scaffolding (Next.js, shadcn/ui, Tailwind)
- [x] Supabase integration (client, server, middleware)
- [x] Authentication (Google SSO via Supabase Auth)
- [x] Database schema with RLS policies
- [x] Trip CRUD (create, view, edit, delete)
- [x] Event CRUD (flights, hotels, restaurants, activities, drives)
- [x] Calendar view with event highlighting
- [x] To-do list with completion toggle
- [x] Day-grouped event itinerary view

## Completed (Phase 2)
- [x] Share trips with other users (collaborative editing)
- [x] Public read-only share links (via share token, itinerary only)
- [x] Flight lookup (FlightAware + AirLabs fallback)
- [x] Restaurant search (BenEats API integration)
- [x] Place search and drive time calculation (Google Maps APIs)
- [x] Static map previews for drives and restaurants
- [x] Per-user trips scoped via Row Level Security

## Completed (Admin Console)
- [x] Admin dashboard with stat cards (users, trips, events, shares)
- [x] User management (search, detail view, delete account)
- [x] Analytics with charts (growth over time, top destinations, event type distribution)
- [x] Date range selector for analytics (week/month/quarter/year/all)
- [x] CSV export for analytics data
- [x] Activity log with filters (action type, email, date range) and pagination
- [x] Activity logging integration across all user actions

## Completed (Security Hardening)
- [x] Auth checks on all API proxy routes
- [x] Three-layer admin access control (middleware, layout, API)
- [x] Open redirect prevention on auth callback
- [x] SQL injection fix in admin user detail route
- [x] Explicit ownership checks on shares GET/DELETE endpoints
- [x] DB trigger to prevent shared editors from modifying sensitive columns
- [x] Per-user rate limiting on all external API proxy routes
- [x] Action type allowlist and size limits on activity log POST
- [x] RLS on activity_logs table (service role only)
- [x] Share page restricted to safe column selection

## Completed (Security Audit — Feb 2026)
- [x] HTML injection fix: `escapeHtml()` on all email template interpolations
- [x] Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] Removed debug info from flight lookup error responses
- [x] Wrapped `request.json()` in try-catch across 7 API routes (400 on malformed JSON)
- [x] Replaced bulk `listUsers()` with targeted `getUserById()` in friends/shares routes
- [x] Deduplicated admin email list (middleware imports `isAdmin()` from shared module)
- [x] Sanitized Supabase error messages in all non-admin API responses
- [x] Added rate limiting to attachment upload endpoint (20 req/min)
- [x] Guarded cron route against missing `CRON_SECRET` (503 early return)
- [x] Sanitized uploaded filenames (strip path traversal, unsafe chars, length limit)

## Completed (Social & Notifications)
- [x] Hotel search via Google Places (with map detail cards)
- [x] Friends system (send/accept/decline/remove friend requests)
- [x] In-app notification bell with polling and unread badge
- [x] Notification triggers (friend requests, trip shares)
- [x] Email notifications via Resend (friend requests, trip shares, admin signup alerts)
- [x] Quick share with friends in share dialog

## Completed (UX & Design)
- [x] Warm accent color and visual identity (customized from stock shadcn/ui)
- [x] Onboarding empty state for new users ("Where to next?")
- [x] Featured trip card with countdown badge for next upcoming trip
- [x] BenEats link in restaurant detail cards
- [x] Drive time calculation fix
- [x] Dedicated train form with operator, class, coach, seat fields
- [x] Expandable train detail card with route visualization
- [x] Italian train stations (Cinque Terre, Lake Como, Sicily, tourist destinations)
- [x] Station code to city name resolution on train cards
- [x] Renamed "Prep" / "Prep List" to "To Do" across all pages
- [x] Due date support on to-do items (date picker, badge display, overdue styling, smart sorting)
- [x] Daily cron reminder for to-dos due today (in-app notification + email via Resend)
- [x] Optional description/note field on to-do items

## Bugs
- [x] Restaurant Google Maps link opens coordinates instead of the restaurant listing (should prefer place_id + name over raw coordinates)

## Completed (Shopping Redesign)
- [x] Shopping events redesigned as dateless, city-based parent cards
- [x] Three-column itinerary layout: day events | hotels | shopping (3fr 4fr 3fr)
- [x] Shopping cards matched to hotels by city (multi-signal: title, location, store addresses)
- [x] Auto-detect city from Google Places address (`src/lib/address.ts`)
- [x] Shopping card shows "Shopping in <city>" with store count
- [x] Store creation flow: search store first, auto find/create parent city card
- [x] Shopping events excluded from calendar view (no meaningful dates)
- [x] Shopping detail card with per-store management (add/remove, categories, map links)

## Completed (Bars Feature)
- [x] Bars event type with dateless city-based parent cards (same pattern as shopping)
- [x] `bar_venues` table with RLS policies (migration 012)
- [x] Bar detail card with venue management (add/remove, notes, map links)
- [x] Venue creation flow: search bar → auto-detect city → find/create parent → add venue
- [x] Column 3 layout alongside shopping, matched to hotels by city
- [x] Bars excluded from calendar view
- [x] Support in trip page, share page, and admin analytics

## Completed (Google Calendar & Share Page)
- [x] "Add to Google Calendar" links on restaurant and activity detail cards
- [x] Google Calendar URL utility (`src/lib/calendar.ts`) with timezone-aware date formatting
- [x] Public share page shows itinerary only (removed calendar and to-do tabs)

## Phase 3 - Enhancements
- [x] Timezone support for all events (single tz for activities/restaurants/hotels, dual tz for flights/trains/ferries/drives)
- [x] Drag-and-drop to-do reordering (with @dnd-kit)
- [x] Inline editing of to-do items (title + description)
- [x] Clickable hyperlinks in to-do descriptions
- [ ] Drag-and-drop event reordering
- [x] File/document attachments on Activity and Train events (images + PDFs, up to 5 files, 10MB each)
- [ ] Interactive map view (show event locations on a map)
- [ ] Budget tracking per trip
- [ ] Weather forecast integration for trip dates
- [ ] Export itinerary as PDF
- [ ] Dark mode toggle

## Phase 4 - Advanced
- [ ] AI-powered trip suggestions
- [ ] Integration with booking APIs (flights, hotels)
- [ ] Mobile app (React Native or PWA)
- [ ] Offline support
- [ ] Multi-language support
- [ ] Upgrade rate limiting to Upstash Redis for cross-instance enforcement
- [ ] Add Cloudflare Turnstile bot protection
