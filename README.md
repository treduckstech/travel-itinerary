# Travel Itinerary

A travel planning app to organize trips, events, and prep lists.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Backend/DB**: Supabase (Postgres + Auth + Row Level Security)
- **Hosting**: Vercel

## Features

- **Trip Management** -- Create, edit, and delete trips with destinations and date ranges
- **Events** -- Add flights, hotels, restaurants, and activities to each trip with type-specific fields (departure/arrival for flights, check-in/out for hotels, etc.)
- **Calendar View** -- Interactive calendar highlighting trip dates and event days, with a detail panel for selected dates
- **Prep List** -- Per-trip todo checklist with add, complete, and delete functionality
- **Day-Grouped Itinerary** -- Events organized chronologically by day
- **Auth** -- Email/password signup and login via Supabase Auth, with middleware-based route protection

## Prerequisites

- **Node.js 18+** -- check with `node -v`
- **npm** -- comes with Node.js, check with `npm -v`
- **A Supabase account** -- free tier at [supabase.com](https://supabase.com)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/treduckstech/travel-itinerary.git
cd travel-itinerary
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in
2. Click **New Project**
3. Choose an organization, give it a name (e.g. "travel-itinerary"), set a database password, and pick a region
4. Wait for the project to finish provisioning

### 3. Get your Supabase credentials

1. In your Supabase project dashboard, go to **Settings > API** (or click the gear icon, then "API" in the sidebar)
2. You need two values:
   - **Project URL** -- listed under "Project URL" (looks like `https://abcdefghijk.supabase.co`)
   - **anon public key** -- listed under "Project API keys" > `anon` `public` (a long JWT string)

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values from step 3:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Set up the database

1. In your Supabase dashboard, go to **SQL Editor** (the terminal icon in the sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` from this repo and copy its entire contents
4. Paste it into the SQL editor and click **Run**

This creates three tables (`trips`, `events`, `todos`), enables Row Level Security on all of them, and adds policies so each user can only access their own data. It also creates indexes for query performance.

### 6. Configure Supabase Auth

The app uses email/password authentication. By default, Supabase requires email confirmation. To adjust this:

1. In the Supabase dashboard, go to **Authentication > Providers**
2. Under **Email**, you can:
   - **Keep email confirmations on** (default) -- users will receive a confirmation email after signup. Make sure your Supabase project has email sending configured (it works out of the box on the free tier with Supabase's built-in email service, though with rate limits).
   - **Disable email confirmations** (for development) -- toggle off "Confirm email" to let users sign in immediately after signup without checking email.

For the auth callback to work correctly, add your site URL:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (for local development)
3. Under **Redirect URLs**, add `http://localhost:3000/auth/callback`

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page. Click "Sign up" to create an account, then log in.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server (with hot reload) |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Add the two environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

After deploying, update your Supabase Auth settings:

1. In **Authentication > URL Configuration**, update the **Site URL** to your Vercel domain (e.g. `https://travel-itinerary.vercel.app`)
2. Add `https://travel-itinerary.vercel.app/auth/callback` to the **Redirect URLs**

## Database Schema

The app uses three tables:

**trips** -- Top-level travel plans
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner (references `auth.users`) |
| `name` | text | Trip name |
| `destination` | text | Where you're going |
| `start_date` | date | Trip start |
| `end_date` | date | Trip end |
| `created_at` | timestamptz | When the record was created |

**events** -- Things happening during a trip
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `trip_id` | uuid | Parent trip |
| `user_id` | uuid | Owner |
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
| `user_id` | uuid | Owner |
| `title` | text | Todo item text |
| `completed` | boolean | Whether it's done |
| `due_date` | date | Optional due date |
| `created_at` | timestamptz | When the record was created |

All tables have Row Level Security enabled. Users can only read, create, update, and delete their own rows.

## Project Structure

```
src/
  app/
    page.tsx              # Dashboard (upcoming + past trips)
    layout.tsx            # Root layout with header
    login/page.tsx        # Login form
    signup/page.tsx       # Signup form
    auth/callback/route.ts # Supabase auth callback handler
    trips/
      new/page.tsx        # Create trip form
      [id]/page.tsx       # Trip detail (itinerary, calendar, prep list tabs)
      [id]/edit/page.tsx  # Edit trip form
  components/
    header.tsx            # App header with user email + sign out
    auth/
      sign-out-button.tsx
    calendar/
      trip-calendar.tsx   # Calendar view with event highlighting
    events/
      event-card.tsx      # Single event display with type-specific styling
      event-form-dialog.tsx # Add/edit event dialog
      event-list.tsx      # Day-grouped event list
    todos/
      todo-list.tsx       # Todo checklist with add/toggle/delete
    trips/
      trip-card.tsx       # Trip summary card for dashboard
      trip-form.tsx       # Create/edit trip form
      delete-trip-button.tsx # Delete confirmation dialog
    ui/                   # shadcn/ui components (button, card, dialog, etc.)
  lib/
    supabase/
      client.ts           # Browser-side Supabase client
      server.ts           # Server-side Supabase client (uses cookies)
      middleware.ts        # Session refresh + route protection logic
    types.ts              # TypeScript types matching the DB schema
    utils.ts              # Utility functions (cn)
  middleware.ts           # Next.js middleware entry point
supabase/
  schema.sql              # Full database schema with RLS policies
```

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"** -- You haven't created `.env.local` or the values are empty. See step 4 above.

**Signup works but login says "Invalid login credentials"** -- If email confirmations are enabled, you need to click the confirmation link in your email before you can log in.

**"relation 'trips' does not exist"** -- You haven't run the database schema yet. See step 5 above.

**Auth callback redirects to login instead of the app** -- Make sure `http://localhost:3000/auth/callback` is in your Supabase Redirect URLs (Authentication > URL Configuration).
