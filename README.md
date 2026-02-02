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
```

### 4. Set up the database

1. Open the Supabase dashboard for your project (from Vercel: **Storage** tab > click your Supabase integration, or go directly to [supabase.com/dashboard](https://supabase.com/dashboard))
2. Go to **SQL Editor** (the terminal icon in the sidebar)
3. Click **New query**
4. Open the file `supabase/schema.sql` from this repo and copy its entire contents
5. Paste it into the SQL editor and click **Run**

This creates three tables (`trips`, `events`, `todos`), enables Row Level Security on all of them, and adds policies so each user can only access their own data. It also creates indexes for query performance.

### 5. Configure Supabase Auth

The app uses email/password authentication. By default, Supabase requires email confirmation. To adjust this:

1. In the Supabase dashboard, go to **Authentication > Providers**
2. Under **Email**, you can:
   - **Keep email confirmations on** (default) -- users will receive a confirmation email after signup. Make sure your Supabase project has email sending configured (it works out of the box with Supabase's built-in email service, though with rate limits).
   - **Disable email confirmations** (for development) -- toggle off "Confirm email" to let users sign in immediately after signup without checking email.

For the auth callback to work correctly, add your site URLs:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your Vercel production domain (e.g. `https://travel-itinerary.vercel.app`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-vercel-domain.vercel.app/auth/callback` (for production)

### 6. Start the dev server

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

Since Supabase is provisioned through the Vercel Marketplace, the environment variables are already configured in your Vercel project. Just push to deploy:

1. Push your repo to GitHub
2. If you haven't already, go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Deploy -- the Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are already set by the marketplace integration

Make sure your Supabase Auth redirect URLs include your production domain (see step 5 in Setup).

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

**"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"** -- You haven't pulled the environment variables locally. Run `vercel env pull .env.local`, or see step 3 above.

**Signup works but login says "Invalid login credentials"** -- If email confirmations are enabled, you need to click the confirmation link in your email before you can log in.

**"relation 'trips' does not exist"** -- You haven't run the database schema yet. See step 4 above.

**Auth callback redirects to login instead of the app** -- Make sure `http://localhost:3000/auth/callback` is in your Supabase Redirect URLs (Authentication > URL Configuration).
