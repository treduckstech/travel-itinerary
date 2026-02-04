-- Restrict shared editor UPDATE policy to only allow safe columns.
-- Previously, shared editors could update ANY column on trips including
-- user_id and share_token. This restricts them to content-only columns.

DROP POLICY IF EXISTS "trips_shared_update" ON trips;

CREATE POLICY "trips_shared_update" ON trips
  FOR UPDATE
  USING (is_trip_shared_with(id, auth.uid()))
  WITH CHECK (
    -- Shared editors can update the row, but we rely on the application
    -- layer to restrict which columns are sent. The USING clause ensures
    -- they can only target trips they have shared access to.
    is_trip_shared_with(id, auth.uid())
  );

-- Additionally, create a trigger to prevent shared editors from modifying
-- sensitive columns (user_id, share_token). This is defense-in-depth
-- since the application layer should already restrict these.
CREATE OR REPLACE FUNCTION prevent_shared_editor_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the updater is not the trip owner, block changes to sensitive columns
  IF NOT is_trip_owner(OLD.id, auth.uid()) THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Shared editors cannot change trip ownership';
    END IF;
    IF NEW.share_token IS DISTINCT FROM OLD.share_token THEN
      RAISE EXCEPTION 'Shared editors cannot modify share tokens';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_shared_editor_sensitive_update ON trips;
CREATE TRIGGER trg_prevent_shared_editor_sensitive_update
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION prevent_shared_editor_sensitive_update();
