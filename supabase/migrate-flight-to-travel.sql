-- Migration: Rename 'flight' event type to 'travel' and add sub_type column
-- Run this against the live Supabase database

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
UPDATE events SET type = 'travel' WHERE type = 'flight';
ALTER TABLE events ADD CONSTRAINT events_type_check CHECK (type IN ('travel', 'hotel', 'restaurant', 'activity'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS sub_type text;
UPDATE events SET sub_type = 'flight' WHERE type = 'travel' AND sub_type IS NULL;
