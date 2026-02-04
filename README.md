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
- **Public Share Links** -- Generate a read-only link anyone can view without signing in
- **Trip Management** -- Create, edit, and delete trips with destinations and date ranges
- **Events** -- Add flights, hotels, restaurants, and activities to each trip with type-specific fields (departure/arrival for flights, check-in/out for hotels, etc.)
- **Calendar View** -- Interactive calendar highlighting trip dates and event days, with a detail panel for selected dates
- **Prep List** -- Per-trip todo checklist with add, complete, and delete functionality
- **Day-Grouped Itinerary** -- Events organized chronologically by day
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
6. Open the file `supabase/migrations/001_add_auth_and_sharing.sql` and copy its entire contents
7. Paste it into a new query in the SQL editor and click **Run**

This creates the tables (`trips`, `events`, `todos`, `trip_shares`), indexes, and Row Level Security policies.

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

### 7. Start the dev server

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
- `SUPABASE_SERVICE_ROLE_KEY` -- required for public share links and user lookups
- `GOOGLE_MAPS_API_KEY` -- optional, for drive place search
- `FLIGHTAWARE_API_KEY` -- optional, for flight lookup
- `AIRLABS_API_KEY` -- optional, flight lookup fallback
- `BENEATS_API_KEY` -- optional, for restaurant search

Push to deploy:

1. Push your repo to GitHub
2. If you haven't already, go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Deploy

## Database Schema

The app uses four tables:

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
| `type` | text | One of: `flight`, `hotel`, `restaurant`, `activity` |
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

## Project Structure

```
src/
  app/
    page.tsx              # Dashboard (upcoming + past trips, scoped by user)
    layout.tsx            # Root layout with header
    login/page.tsx        # Google SSO login
    signup/page.tsx       # Redirects to /login
    auth/callback/route.ts # OAuth callback handler
    share/[token]/page.tsx # Public read-only shared itinerary
    trips/
      new/page.tsx        # Create trip form
      [id]/page.tsx       # Trip detail (itinerary, calendar, prep list tabs)
      [id]/edit/page.tsx  # Edit trip form
    api/
      trips/[id]/shares/route.ts # Share management API
  middleware.ts           # Auth middleware (redirects to /login if unauthenticated)
  components/
    header.tsx            # App header with logo, user email, sign out
    auth/
      sign-out-button.tsx # Sign out button
    calendar/
      trip-calendar.tsx   # Calendar view with event highlighting
    events/
      event-card.tsx      # Single event display (supports readOnly mode)
      event-form-dialog.tsx # Add/edit event dialog
      event-list.tsx      # Day-grouped event list (supports readOnly mode)
    todos/
      todo-list.tsx       # Todo checklist (supports readOnly mode)
    trips/
      trip-card.tsx       # Trip summary card for dashboard
      trip-form.tsx       # Create/edit trip form
      delete-trip-button.tsx # Delete confirmation dialog
      share-dialog.tsx    # Share trip dialog (invite by email, public link)
    ui/                   # shadcn/ui components (button, card, dialog, etc.)
  lib/
    supabase/
      client.ts           # Browser-side Supabase client
      server.ts           # Server-side Supabase client (uses cookies)
      service.ts          # Service-role client (bypasses RLS)
      middleware.ts        # Session refresh logic
    types.ts              # TypeScript types matching the DB schema
    utils.ts              # Utility functions (cn)
supabase/
  schema.sql              # Base database schema
  migrations/
    001_add_auth_and_sharing.sql # Auth columns, trip_shares table, RLS policies
```

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"** -- You haven't pulled the environment variables locally. Run `vercel env pull .env.local`, or see step 3 above.

**"relation 'trips' does not exist"** -- You haven't run the database schema yet. See step 4 above.

**Google sign-in redirects back to login** -- Check that your Supabase redirect URL matches exactly (`https://your-domain.com/auth/callback`), and that the Google provider is enabled in the Supabase dashboard with the correct Client ID and Secret.

**"Invalid Redirect URI" error from Google** -- The authorized redirect URI in your GCP OAuth credentials must be your Supabase callback URL (`https://<ref>.supabase.co/auth/v1/callback`), not your app URL. Double-check step 5c.

**Public share link shows 404** -- Make sure the `SUPABASE_SERVICE_ROLE_KEY` environment variable is set. The public share page uses the service-role client to bypass RLS.

**Shared user can't see the trip** -- The shared user must sign in with the same email address used in the share invitation. If they signed up after being invited, their `shared_with_user_id` in `trip_shares` may be null — re-sharing will update it.
