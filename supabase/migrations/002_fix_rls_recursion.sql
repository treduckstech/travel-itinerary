-- Fix: infinite recursion between trips and trip_shares RLS policies
-- The original policies had trips referencing trip_shares and vice versa.
-- This migration drops those policies and replaces them with SECURITY DEFINER
-- helper functions that bypass RLS for cross-table lookups.

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "trips_owner_all" ON trips;
DROP POLICY IF EXISTS "trips_shared_select" ON trips;
DROP POLICY IF EXISTS "trips_shared_update" ON trips;
DROP POLICY IF EXISTS "events_owner_all" ON events;
DROP POLICY IF EXISTS "events_shared_all" ON events;
DROP POLICY IF EXISTS "todos_owner_all" ON todos;
DROP POLICY IF EXISTS "todos_shared_all" ON todos;
DROP POLICY IF EXISTS "trip_shares_owner_all" ON trip_shares;
DROP POLICY IF EXISTS "trip_shares_shared_select" ON trip_shares;

-- 2. Create SECURITY DEFINER helper functions (bypass RLS for internal lookups)

-- Check if a user owns a trip (used by trip_shares, events, todos policies)
CREATE OR REPLACE FUNCTION is_trip_owner(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trips
    WHERE id = p_trip_id AND user_id = p_user_id
  );
$$;

-- Check if a user has shared access to a trip (used by trips, events, todos policies)
CREATE OR REPLACE FUNCTION is_trip_shared_with(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_shares
    WHERE trip_id = p_trip_id AND shared_with_user_id = p_user_id
  );
$$;

-- 3. Recreate trips policies (no longer reference trip_shares directly)
CREATE POLICY "trips_owner_all" ON trips
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "trips_shared_select" ON trips
  FOR SELECT USING (is_trip_shared_with(id, auth.uid()));

CREATE POLICY "trips_shared_update" ON trips
  FOR UPDATE USING (is_trip_shared_with(id, auth.uid()));

-- 4. Recreate events policies (use helper functions)
CREATE POLICY "events_owner_all" ON events
  FOR ALL USING (is_trip_owner(trip_id, auth.uid()));

CREATE POLICY "events_shared_all" ON events
  FOR ALL USING (is_trip_shared_with(trip_id, auth.uid()));

-- 5. Recreate todos policies (use helper functions)
CREATE POLICY "todos_owner_all" ON todos
  FOR ALL USING (is_trip_owner(trip_id, auth.uid()));

CREATE POLICY "todos_shared_all" ON todos
  FOR ALL USING (is_trip_shared_with(trip_id, auth.uid()));

-- 6. Recreate trip_shares policies (use helper function for owner check)
CREATE POLICY "trip_shares_owner_all" ON trip_shares
  FOR ALL USING (is_trip_owner(trip_id, auth.uid()));

CREATE POLICY "trip_shares_shared_select" ON trip_shares
  FOR SELECT USING (shared_with_user_id = auth.uid());
