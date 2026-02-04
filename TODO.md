# Travel Itinerary - Feature Roadmap

## Completed (MVP)
- [x] Project scaffolding (Next.js, shadcn/ui, Tailwind)
- [x] Supabase integration (client, server, middleware)
- [x] Authentication (Google SSO via Supabase Auth)
- [x] Database schema with RLS policies
- [x] Trip CRUD (create, view, edit, delete)
- [x] Event CRUD (flights, hotels, restaurants, activities, drives)
- [x] Calendar view with event highlighting
- [x] Prep todo list with completion toggle
- [x] Day-grouped event itinerary view

## Completed (Phase 2)
- [x] Share trips with other users (collaborative editing)
- [x] Public read-only share links (via share token)
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

## Completed (Social & Notifications)
- [x] Hotel search via Google Places (with map detail cards)
- [x] Friends system (send/accept/decline/remove friend requests)
- [x] In-app notification bell with polling and unread badge
- [x] Notification triggers (friend requests, trip shares)
- [x] Email notifications via Resend (friend requests, trip shares, admin signup alerts)
- [x] Quick share with friends in share dialog

## Phase 3 - Enhancements
- [ ] Drag-and-drop event reordering
- [ ] File/document attachments (boarding passes, confirmations)
- [ ] Interactive map view (show event locations on a map)
- [ ] Budget tracking per trip
- [ ] Weather forecast integration for trip dates
- [ ] Export itinerary as PDF
- [ ] Dark mode toggle
- [ ] Show local times with timezone on flight cards (based on airport timezone)

## Phase 4 - Advanced
- [ ] AI-powered trip suggestions
- [ ] Integration with booking APIs (flights, hotels)
- [ ] Mobile app (React Native or PWA)
- [ ] Offline support
- [ ] Multi-language support
- [ ] Upgrade rate limiting to Upstash Redis for cross-instance enforcement
