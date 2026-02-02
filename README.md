# Travel Itinerary

A travel planning app to organize trips, events, and prep lists.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Backend/DB**: Supabase (Postgres)
- **Hosting**: Vercel

> **Note**: Authentication is not yet implemented. The app currently works without login. Auth and Row Level Security will be added later.

## Features

- **Trip Management** -- Create, edit, and delete trips with destinations and date ranges
- **Events** -- Add flights, hotels, restaurants, and activities to each trip with type-specific fields (departure/arrival for flights, check-in/out for hotels, etc.)
- **Calendar View** -- Interactive calendar highlighting trip dates and event days, with a detail panel for selected dates
- **Prep List** -- Per-trip todo checklist with add, complete, and delete functionality
- **Day-Grouped Itinerary** -- Events organized chronologically by day
- **Ocean Teal Design System** -- Custom color palette with polished UI across all views
- **Toast Notifications** -- Real-time feedback via sonner for all CRUD operations
- **Collapsible Event Form** -- Streamlined event creation with expandable detail fields
- **Featured Trip Cards** -- Visual trip cards on the dashboard with destination highlights
- **Contextual Delete Dialog** -- Confirmation dialogs for destructive actions

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

This creates three tables (`trips`, `events`, `todos`) with indexes for query performance.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start planning trips.

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

## Database Schema

The app uses three tables:

**trips** -- Top-level travel plans
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
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

## Project Structure

```
src/
  app/
    page.tsx              # Dashboard (upcoming + past trips)
    layout.tsx            # Root layout with header
    login/page.tsx        # Login form (unused -- auth deferred)
    signup/page.tsx       # Signup form (unused -- auth deferred)
    auth/callback/route.ts # Auth callback handler (unused -- auth deferred)
    trips/
      new/page.tsx        # Create trip form
      [id]/page.tsx       # Trip detail (itinerary, calendar, prep list tabs)
      [id]/edit/page.tsx  # Edit trip form
  components/
    header.tsx            # App header with logo
    auth/
      sign-out-button.tsx # (unused -- auth deferred)
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
      middleware.ts        # Session refresh logic (unused -- auth deferred)
    types.ts              # TypeScript types matching the DB schema
    utils.ts              # Utility functions (cn)
supabase/
  schema.sql              # Full database schema
```

## Troubleshooting

**"Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"** -- You haven't pulled the environment variables locally. Run `vercel env pull .env.local`, or see step 3 above.

**"relation 'trips' does not exist"** -- You haven't run the database schema yet. See step 4 above.

## Roadmap

- **Flight Number Lookup** -- Enter a flight number (e.g. UA123) and auto-fill departure/arrival times, route, and airline info via AviationStack API
- **Google SSO Authentication** -- Sign in with Google via Supabase Auth, with row-level security scoping data to each user
