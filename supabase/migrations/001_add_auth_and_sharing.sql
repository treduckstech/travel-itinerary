-- Migration: Add auth (user_id), sharing, and RLS
-- Run in Supabase SQL Editor

-- 1. Add user_id and share_token to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS share_token uuid UNIQUE;

-- 2. Create trip_shares table
CREATE TABLE IF NOT EXISTS trip_shares (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  shared_with_email text NOT NULL,
  shared_with_user_id uuid REFERENCES auth.users(id),
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('editor')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (trip_id, shared_with_email)
);

CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_user_id ON trip_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON trips(share_token);

-- 3. Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for trips
CREATE POLICY "trips_owner_all" ON trips
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "trips_shared_select" ON trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_shares
      WHERE trip_shares.trip_id = trips.id
        AND trip_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "trips_shared_update" ON trips
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trip_shares
      WHERE trip_shares.trip_id = trips.id
        AND trip_shares.shared_with_user_id = auth.uid()
        AND trip_shares.role = 'editor'
    )
  );

-- 5. RLS Policies for events
CREATE POLICY "events_owner_all" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = events.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "events_shared_all" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_shares
      WHERE trip_shares.trip_id = events.trip_id
        AND trip_shares.shared_with_user_id = auth.uid()
        AND trip_shares.role = 'editor'
    )
  );

-- 6. RLS Policies for todos
CREATE POLICY "todos_owner_all" ON todos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = todos.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "todos_shared_all" ON todos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_shares
      WHERE trip_shares.trip_id = todos.trip_id
        AND trip_shares.shared_with_user_id = auth.uid()
        AND trip_shares.role = 'editor'
    )
  );

-- 7. RLS Policies for trip_shares
CREATE POLICY "trip_shares_owner_all" ON trip_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_shares.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "trip_shares_shared_select" ON trip_shares
  FOR SELECT USING (shared_with_user_id = auth.uid());

-- ============================================================
-- POST-MIGRATION: Run after first Google login
-- ============================================================
-- UPDATE trips SET user_id = '<your-user-id>' WHERE user_id IS NULL;
-- ALTER TABLE trips ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE trips ALTER COLUMN user_id SET DEFAULT auth.uid();
