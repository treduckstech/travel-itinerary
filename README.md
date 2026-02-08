# Travel Itinerary

A travel planning app to organize trips, events, and prep lists — with Google SSO, per-user trips, collaborative sharing, and public read-only links.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Backend/DB**: Supabase (Postgres + Auth + RLS)
- **Hosting**: Vercel

## Features

- **Google SSO** -- Sign in with Google via Supabase Auth
- **Per-User Trips** -- Trips are scoped to their creator via Row Level Security
- **Collaborative Sharing** -- Invite others by email to view and edit your trips
- **Public Share Links** -- Generate a read-only link showing the itinerary (no calendar or to-do list)
- **Trip Management** -- Create, edit, and delete trips with destinations and date ranges
- **Events** -- Add flights, hotels, restaurants, drives, and activities to each trip with type-specific fields (departure/arrival for flights, check-in/out for hotels, origin/destination for drives, etc.)
- **Flight Lookup** -- Auto-fill flight details from FlightAware or AirLabs by entering a flight number
- **Restaurant Search** -- Search restaurants via BenEats API integration
- **Place Search & Drive Time** -- Google Maps-powered place search with automatic drive time calculation
- **Static Map Previews** -- Map thumbnails for drive routes and restaurant locations
- **Google Calendar Integration** -- Add restaurant and activity events to Google Calendar with one click (timezone-aware)
- **Calendar View** -- Interactive calendar highlighting trip dates and event days, with a detail panel for selected dates
- **Prep List** -- Per-trip todo checklist with add, complete, and delete functionality
- **Day-Grouped Itinerary** -- Events organized chronologically by day
- **Hotel Search** -- Search hotels via Google Places with map detail cards
- **Friends System** -- Add friends by email, accept/decline requests, quick-share trips with friends
- **In-App Notifications** -- Bell icon with unread count badge, auto-polling, click-to-navigate
- **Email Notifications** -- Via Resend for friend requests, trip shares, and admin signup alerts
- **Admin Console** -- Dashboard with stats, user management, analytics charts (growth, destinations, event types), and a filterable activity log (admin-only, restricted by email allowlist)
- **Ocean Teal Design System** -- Custom color palette with polished UI across all views

## Prerequisites

- **Node.js 18+** -- check with `node -v`
- **npm** -- comes with Node.js, check with `npm -v`
- **A Vercel account** -- at [vercel.com](https://vercel.com)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/treduckstech/travel-itinerary.git
cd travel-itinerary
npm install
```

### 2. Add Supabase via the Vercel Marketplace

We provision Supabase through the Vercel Marketplace, just like our other apps.

1. Go to your Vercel dashboard and select your project (or create one by importing this repo)
2. Navigate to the **Storage** tab
3. Click **Browse Marketplace** and select **Supabase**
4. Click **Create** and follow the prompts to provision a new Supabase project (or connect an existing one)
5. Vercel will automatically add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables to your project

Once provisioned, you can access the Supabase dashboard directly from the Vercel Storage tab by clicking on your Supabase integration.

### 3. Configure local environment variables

Pull the Vercel-managed environment variables to your local machine:

```bash
vercel env pull .env.local
```

This populates `.env.local` with the Supabase credentials that Vercel set up for you. If you prefer to do it manually, copy the template and fill in the values from the Vercel project settings (Settings > Environment Variables):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The service role key is found in the Supabase dashboard under **Settings > API > Project API keys > service_role**. Add it to both `.env.local` and your Vercel project's environment variables.

### 4. Set up the database

1. Open the Supabase dashboard for your project (from Vercel: **Storage** tab > click your Supabase integration, or go directly to [supabase.com/dashboard](https://supabase.com/dashboard))
2. Go to **SQL Editor** (the terminal icon in the sidebar)
3. Click **New query**
4. Open the file `supabase/schema.sql` from this repo and copy its entire contents
5. Paste it into the SQL editor and click **Run**
6. Run each migration file in order:
   - `supabase/migrations/001_add_auth_and_sharing.sql` -- Adds auth columns, `trip_shares` table, and RLS policies
   - `supabase/migrations/002_fix_rls_recursion.sql` -- Fixes infinite recursion in RLS policies with SECURITY DEFINER helpers
   - `supabase/migrations/003_add_activity_logs.sql` -- Adds `activity_logs` table for admin activity tracking
   - `supabase/migrations/004_restrict_shared_update.sql` -- Adds trigger to prevent shared editors from modifying sensitive columns
   - `supabase/migrations/005_add_friends_and_notifications.sql` -- Adds `friendships` and `notifications` tables with RLS

This creates the tables (`trips`, `events`, `todos`, `trip_shares`, `activity_logs`, `friendships`, `notifications`), indexes, RLS policies, and security triggers.

### 5. Set up Google SSO Authentication

Google SSO requires configuration in both the Google Cloud Console and the Supabase Dashboard. Follow these steps in order.

#### 5a. Create a Google Cloud project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Click **New Project**
4. Enter a project name (e.g. "Travel Itinerary") and click **Create**
5. Make sure the new project is selected in the dropdown

#### 5b. Configure the OAuth consent screen

Before creating credentials, Google requires you to configure what users see when they sign in.

1. In the Google Cloud Console, go to **APIs & Services > OAuth consent screen** from the left sidebar
2. Select **External** as the user type (unless you have a Google Workspace org and want to restrict to your domain), then click **Create**
3. Fill in the required fields:
   - **App name**: `Travel Itinerary` (or whatever you want users to see)
   - **User support email**: select your email from the dropdown
   - **Developer contact information**: enter your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**
   - Search for and select `email` and `profile` (under Google Account)
   - Click **Update**, then **Save and Continue**
6. On the **Test users** page, click **Save and Continue** (you can add test users later if your app is in "Testing" mode)
7. Click **Back to Dashboard**

> **Note on publishing status**: While in "Testing" mode, only users you explicitly add as test users can sign in (up to 100). To allow anyone with a Google account to sign in, click **Publish App** on the OAuth consent screen page. For a personal/small-team app this is fine — Google only requires verification if you request sensitive scopes, which we don't.

#### 5c. Create OAuth 2.0 credentials

1. Go to **APIs & Services > Credentials** from the left sidebar
2. Click **+ Create Credentials** at the top, then select **OAuth client ID**
3. For **Application type**, choose **Web application**
4. Enter a name (e.g. "Travel Itinerary Web")
5. Under **Authorized JavaScript origins**, click **Add URI** and enter:
   - `https://travel.treducks.io` (your production domain)
   - `http://localhost:3000` (for local development)
6. Under **Authorized redirect URIs**, click **Add URI** and enter your Supabase auth callback URL:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   You can find your project ref in the Supabase dashboard URL (it's the subdomain, e.g. `abcdefghijkl`). The full URL looks like `https://abcdefghijkl.supabase.co/auth/v1/callback`.
7. Click **Create**
8. A dialog will appear showing your **Client ID** and **Client Secret** — copy both values and save them somewhere safe. You'll need them in the next step.

#### 5d. Enable Google provider in Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project
2. Go to **Authentication** in the left sidebar
3. Click **Providers** (under Configuration)
4. Find **Google** in the provider list and click to expand it
5. Toggle the **Enable Sign in with Google** switch to on
6. Paste the **Client ID** from GCP into the "Client ID (for OAuth)" field
7. Paste the **Client Secret** from GCP into the "Client Secret (for OAuth)" field
8. Click **Save**

#### 5e. Configure Supabase redirect URLs

1. Still in **Authentication**, click **URL Configuration** (under Configuration)
2. Set the **Site URL** to your production URL:
   ```
   https://travel.treducks.io
   ```
3. Under **Redirect URLs**, click **Add URL** and add:
   ```
   https://travel.treducks.io/auth/callback
   ```
4. For local development, also add:
   ```
   http://localhost:3000/auth/callback
   ```
5. Click **Save**

#### 5f. Assign existing trips to your user (after first login)

After completing the setup above, start the dev server and sign in with Google for the first time. Then assign any pre-existing trips to your account:

1. After signing in, find your user ID in the Supabase dashboard under **Authentication > Users** — click your user row and copy the UUID
2. Go to **SQL Editor** and run:
   ```sql
   UPDATE trips SET user_id = '<your-user-id>' WHERE user_id IS NULL;
   ALTER TABLE trips ALTER COLUMN user_id SET NOT NULL;
   ALTER TABLE trips ALTER COLUMN user_id SET DEFAULT auth.uid();
   ```
   Replace `<your-user-id>` with the UUID you copied.

This migrates any existing trips to your account and makes `user_id` required for all future trips.

### 6. Set up Google Maps API (optional -- for drive place search and auto drive time)

The drive sub-type uses Google Maps to power place search and automatic drive time calculation. Without this key, origin/destination fields fall back to plain text input with no auto-calculation.

#### Create a Google Cloud project and enable APIs

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one) from the project dropdown at the top
3. Open **APIs & Services > Library** from the left sidebar
4. Search for and enable each of these APIs:
   - **Places API** -- powers the place search combobox (search for "Places API" in the library, _not_ "Places API (New)")
   - **Distance Matrix API** -- calculates drive time between two places (`distance-matrix-backend.googleapis.com`)

#### Create an API key

1. Go to **APIs & Services > Credentials**
2. Click **+ Create Credentials > API key**
3. Copy the generated key
4. (Recommended) Click **Edit API key** to add restrictions:
   - Under **Application restrictions**, select **IP addresses** and add your server's IP (or leave unrestricted for local development)
   - Under **API restrictions**, select **Restrict key** and choose only **Places API** and **Distance Matrix API**
5. Click **Save**

#### Add the key to your environment

Add the key to your `.env.local` file:

```
GOOGLE_MAPS_API_KEY=AIzaSy...your-key-here
```

If deploying to Vercel, also add `GOOGLE_MAPS_API_KEY` in your Vercel project settings under **Settings > Environment Variables**.

#### Billing

Google Maps APIs require a billing account linked to your Google Cloud project. Google provides a $200/month free tier which covers roughly:
- ~11,500 Places Text Search requests
- ~40,000 Distance Matrix requests

Go to **Billing** in the Cloud Console to set up a billing account if you don't have one. You can set budget alerts to avoid unexpected charges.

### 7. Set up Resend for email notifications (optional)

Email notifications (friend requests, trip shares, admin signup alerts) are sent via [Resend](https://resend.com). Without this key, the app works normally but skips sending emails.

1. Create an account at [resend.com](https://resend.com)
2. Go to **Domains** > **Add Domain** > enter your domain (e.g. `treducks.tech`)
3. Resend shows DNS records to add. In your domain registrar, add:
   - **MX record**: Host `feedback-smtp.{region}.amazonses.com`, priority 10 (for bounce handling)
   - **SPF TXT record**: Name `@` or subdomain, value `v=spf1 include:amazonses.com ~all`
   - **DKIM CNAME records** (3 records): Resend provides the exact name/value pairs
4. Wait for verification (usually a few minutes, can take up to 72 hours)
5. Create an API key: **Settings** > **API Keys** > **Create API Key**
6. Add `RESEND_API_KEY` to `.env.local` and Vercel env vars

### 8. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page — click "Sign in with Google" to authenticate.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server (with hot reload) |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

Since Supabase is provisioned through the Vercel Marketplace, most environment variables are already configured. Ensure these are set in your Vercel project's **Settings > Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL` -- set automatically by marketplace integration
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- set automatically by marketplace integration
- `SUPABASE_SERVICE_ROLE_KEY` -- required for public share links, user lookups, admin console, and activity logging
- `GOOGLE_MAPS_API_KEY` -- optional, for drive place search and static map previews
- `FLIGHTAWARE_API_KEY` -- optional, for flight lookup
- `AIRLABS_API_KEY` -- optional, flight lookup fallback
- `BENEATS_API_KEY` -- optional, for restaurant search
- `RESEND_API_KEY` -- optional, for email notifications

Push to deploy:

1. Push your repo to GitHub
2. If you haven't already, go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Deploy

## Database Schema

The app uses five tables:

**trips** -- Top-level travel plans
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Trip name |
| `destination` | text | Where you're going |
| `start_date` | date | Trip start |
| `end_date` | date | Trip end |
| `user_id` | uuid | Owner (references auth.users) |
| `share_token` | uuid | Public share link token (nullable) |
| `created_at` | timestamptz | When the record was created |

**events** -- Things happening during a trip
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `trip_id` | uuid | Parent trip |
| `type` | text | One of: `travel`, `hotel`, `restaurant`, `activity` |
| `sub_type` | text | Sub-type (e.g. `flight`, `drive`, `train` for travel) |
| `title` | text | Event name (airline/flight#, hotel name, etc.) |
| `description` | text | Optional description |
| `start_datetime` | timestamptz | When it starts (departure, check-in, etc.) |
| `end_datetime` | timestamptz | When it ends (arrival, check-out, etc.) |
| `location` | text | Address or route (e.g. "SFO -> CDG") |
| `confirmation_number` | text | Booking reference |
| `notes` | text | Additional notes |
| `created_at` | timestamptz | When the record was created |

**todos** -- Prep checklist items for a trip
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `trip_id` | uuid | Parent trip |
| `title` | text | Todo item text |
| `completed` | boolean | Whether it's done |
| `due_date` | date | Optional due date |
| `created_at` | timestamptz | When the record was created |

**trip_shares** -- Collaborative sharing
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `trip_id` | uuid | Parent trip |
| `shared_with_email` | text | Email of the person shared with |
| `shared_with_user_id` | uuid | User ID if they have an account (nullable) |
| `role` | text | Permission level (`editor`) |
| `created_at` | timestamptz | When the share was created |

**activity_logs** -- Admin activity tracking
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | User who performed the action (nullable) |
| `user_email` | text | Email at time of action |
| `action_type` | text | Action identifier (e.g. `trip_created`, `login`) |
| `action_details` | jsonb | Additional context about the action |
| `ip_address` | text | Client IP address |
| `user_agent` | text | Client user agent string |
| `created_at` | timestamptz | When the action occurred |

**friendships** -- Friend connections between users
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `requester_id` | uuid | User who sent the request |
| `addressee_id` | uuid | User who received the request |
| `status` | text | One of: `pending`, `accepted`, `declined` |
| `created_at` | timestamptz | When the request was created |
| `updated_at` | timestamptz | When the status last changed |

**notifications** -- In-app notifications
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `recipient_id` | uuid | User receiving the notification |
| `actor_id` | uuid | User who triggered it (nullable) |
| `type` | text | Notification type (e.g. `friend_request`, `trip_shared`) |
| `title` | text | Notification title |
| `body` | text | Notification body (nullable) |
| `data` | jsonb | Additional context |
| `read` | boolean | Whether it's been read |
| `created_at` | timestamptz | When it was created |

## Project Structure

```
src/
  app/
    page.tsx                # Dashboard (upcoming + past trips, scoped by user)
    layout.tsx              # Root layout with header
    login/page.tsx          # Google SSO login
    signup/page.tsx         # Redirects to /login
    auth/callback/route.ts  # OAuth callback handler (+ admin signup email)
    friends/page.tsx        # Friends management (send/accept/decline/remove)
    share/[token]/page.tsx  # Public read-only shared itinerary (itinerary only, no calendar/todos)
    trips/
      new/page.tsx          # Create trip form
      [id]/page.tsx         # Trip detail (itinerary, calendar, prep list tabs)
      [id]/edit/page.tsx    # Edit trip form
    admin/
      layout.tsx            # Admin layout with sidebar (auth + admin check)
      page.tsx              # Admin dashboard with stat cards
      users/page.tsx        # User management (search, table)
      users/[id]/page.tsx   # User detail (stats, trips, shares, delete)
      analytics/page.tsx    # Analytics with charts and CSV export
      activity-log/page.tsx # Filterable, paginated activity log
    api/
      activity-log/route.ts          # POST: log user actions (authenticated)
      friends/route.ts               # GET/POST: list friends, send request
      friends/[id]/route.ts          # PATCH/DELETE: accept/decline/remove
      notifications/route.ts         # GET/PATCH: list and mark notifications read
      trips/[id]/shares/route.ts     # GET/POST/DELETE: share management
      flights/lookup/route.ts        # GET: flight data lookup (rate limited)
      places/search/route.ts         # GET: Google Places search (rate limited)
      places/distance/route.ts       # GET: drive time calculation (rate limited)
      maps/static/route.ts           # GET: static map image proxy (rate limited)
      restaurants/search/route.ts    # GET: restaurant search (rate limited)
      admin/stats/route.ts           # GET: dashboard stats
      admin/users/route.ts           # GET: list users
      admin/users/[id]/route.ts      # GET/DELETE: user detail and deletion
      admin/analytics/route.ts       # GET: analytics overview
      admin/analytics/growth/route.ts       # GET: time series growth data
      admin/analytics/destinations/route.ts # GET: top destinations
      admin/analytics/events/route.ts       # GET: event type distribution
      admin/activity-log/route.ts    # GET: filtered activity log
  middleware.ts             # Auth middleware + admin route blocking
  components/
    header.tsx              # App header with logo, user email, admin link, sign out
    auth/
      sign-out-button.tsx   # Sign out button
    calendar/
      trip-calendar.tsx     # Calendar view with event highlighting
    events/
      event-card.tsx        # Single event display (supports readOnly mode)
      event-form-dialog.tsx # Add/edit event dialog
      event-list.tsx        # Day-grouped event list (supports readOnly mode)
      airport-combobox.tsx  # Airport search combobox for flights
      station-combobox.tsx  # Station search combobox for trains
      place-search.tsx      # Google Places search combobox for drives
      drive-detail-card.tsx # Drive event detail with map preview
      restaurant-search.tsx # Restaurant search combobox
      restaurant-detail-card.tsx # Restaurant detail with map preview and Google Calendar link
      hotel-search.tsx      # Hotel search combobox (Google Places)
      hotel-detail-card.tsx # Hotel detail with map preview
    todos/
      todo-list.tsx         # Todo checklist (supports readOnly mode)
    trips/
      trip-card.tsx         # Trip summary card for dashboard
      trip-form.tsx         # Create/edit trip form
      delete-trip-button.tsx # Delete confirmation dialog
      share-dialog.tsx      # Share trip dialog (invite by email, public link)
    notifications/
      notification-bell.tsx # Bell icon with unread count and popover list
    admin/
      admin-sidebar.tsx     # Admin nav sidebar with active state
      stat-card.tsx         # Reusable stat card with growth %
      pagination.tsx        # Reusable pagination (first/prev/next/last)
      activity-log-filters.tsx # Activity log filter form
      activity-log-table.tsx   # Activity log table with color-coded badges
      analytics/
        date-range-selector.tsx # Date range dropdown
        overview-cards.tsx      # Analytics overview stat cards
        growth-chart.tsx        # Line chart for growth over time
        destination-chart.tsx   # Bar chart for top destinations
        event-type-chart.tsx    # Bar chart for event type distribution
        index.ts                # Barrel exports
    ui/                     # shadcn/ui components (button, card, dialog, etc.)
  lib/
    supabase/
      client.ts             # Browser-side Supabase client
      server.ts             # Server-side Supabase client (uses cookies)
      service.ts            # Service-role client (bypasses RLS)
      middleware.ts          # Session refresh + admin route blocking
    admin.ts                # Admin email allowlist and isAdmin() check
    email.ts                # Resend email sender (fire-and-forget, no-ops without key)
    calendar.ts             # Google Calendar URL builder (timezone-aware)
    activity-log.ts         # Client-side fire-and-forget activity logger
    rate-limit.ts           # In-memory per-user rate limiter
    types.ts                # TypeScript types matching the DB schema
    utils.ts                # Utility functions (cn)
supabase/
  schema.sql                # Base database schema
  migrations/
    001_add_auth_and_sharing.sql      # Auth columns, trip_shares, RLS policies
    002_fix_rls_recursion.sql         # SECURITY DEFINER helpers, fixed RLS policies
    003_add_activity_logs.sql         # Activity logs table
    004_restrict_shared_update.sql    # Trigger to block sensitive column updates by shared editors
```

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"** -- You haven't pulled the environment variables locally. Run `vercel env pull .env.local`, or see step 3 above.

**"relation 'trips' does not exist"** -- You haven't run the database schema yet. See step 4 above.

**Google sign-in redirects back to login** -- Check that your Supabase redirect URL matches exactly (`https://your-domain.com/auth/callback`), and that the Google provider is enabled in the Supabase dashboard with the correct Client ID and Secret.

**"Invalid Redirect URI" error from Google** -- The authorized redirect URI in your GCP OAuth credentials must be your Supabase callback URL (`https://<ref>.supabase.co/auth/v1/callback`), not your app URL. Double-check step 5c.

**Public share link shows 404** -- Make sure the `SUPABASE_SERVICE_ROLE_KEY` environment variable is set. The public share page uses the service-role client to bypass RLS.

**Shared user can't see the trip** -- The shared user must sign in with the same email address used in the share invitation. If they signed up after being invited, their `shared_with_user_id` in `trip_shares` may be null — re-sharing will update it.

**Admin console shows 403/redirect** -- Only emails listed in `src/lib/admin.ts` can access `/admin`. The default is `ben@treducks.tech`. Add your email to the `ADMIN_EMAILS` array and redeploy.
